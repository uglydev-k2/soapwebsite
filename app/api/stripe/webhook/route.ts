import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { fulfillOrder } from "@/lib/fulfill-order";
import type { ShippingAddress, ValidatedCartItem } from "@/lib/checkout";
import Stripe from "stripe";

function parseShippingAddress(raw: string | undefined): ShippingAddress {
  if (!raw) {
    return {
      line1: "",
      city: "",
      state: "",
      postalCode: "",
      country: "United States",
    };
  }
  try {
    return JSON.parse(raw) as ShippingAddress;
  } catch {
    return {
      line1: "",
      city: "",
      state: "",
      postalCode: "",
      country: "United States",
    };
  }
}

function parseCartItems(metadata: Stripe.Checkout.Session["metadata"]): ValidatedCartItem[] {
  const raw = metadata?.cartItems ?? "";
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ValidatedCartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Legacy Stripe webhook — kept for any in-flight Stripe checkout sessions. */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await fulfillOrder({
      email: session.customer_email || session.metadata?.email || "",
      firstName: session.metadata?.firstName || "Guest",
      lastName: session.metadata?.lastName || "",
      phone: session.metadata?.phone || undefined,
      userId: session.metadata?.userId || null,
      shippingAddress: parseShippingAddress(session.metadata?.shippingAddress),
      subtotal: parseFloat(session.metadata?.subtotal || "0"),
      shipping: parseFloat(session.metadata?.shipping || "0"),
      tax: parseFloat(session.metadata?.tax || "0"),
      total: parseFloat(session.metadata?.total || "0"),
      paymentId: session.id,
      paymentProvider: "stripe",
      cartItems: parseCartItems(session.metadata),
    });
  }

  return NextResponse.json({ received: true });
}
