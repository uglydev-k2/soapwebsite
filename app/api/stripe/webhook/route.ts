import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { sendOrderConfirmation } from "@/lib/resend";
import { saveOrderToSupabase } from "@/lib/supabase/orders";
import type { ShippingAddress, ValidatedCartItem } from "@/lib/checkout";
import { isDatabaseConfigured } from "@/lib/env";
import Stripe from "stripe";

function parseShippingAddress(raw: string | undefined): ShippingAddress {
  if (!raw) {
    return {
      line1: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Ghana",
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
      country: "Ghana",
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
    const email = session.customer_email || session.metadata?.email || "";
    const firstName = session.metadata?.firstName || "Guest";
    const lastName = session.metadata?.lastName || "";
    const phone = session.metadata?.phone || undefined;
    const userId = session.metadata?.userId || null;
    const shippingAddress = parseShippingAddress(session.metadata?.shippingAddress);

    const subtotal = parseFloat(session.metadata?.subtotal || "0");
    const shipping = parseFloat(session.metadata?.shipping || "0");
    const tax = parseFloat(session.metadata?.tax || "0");
    const total = parseFloat(session.metadata?.total || "0");

    const parsedCartItems = parseCartItems(session.metadata);
    const cartItems: ValidatedCartItem[] = [...parsedCartItems];

    if (!cartItems.length && isDatabaseConfigured()) {
      const lineItems = await getStripe().checkout.sessions.listLineItems(session.id);
      for (const item of lineItems.data) {
        if (item.description === "Shipping" || item.description === "Tax") continue;
        const product = await prisma.product.findFirst({
          where: { name: item.description || "" },
        });
        if (product) {
          const qty = item.quantity || 1;
          cartItems.push({
            productId: product.id,
            name: product.name,
            slug: product.slug,
            price: (item.amount_total || 0) / 100 / qty,
            quantity: qty,
          });
        }
      }
    }

    const orderNumber = generateOrderNumber();

    await saveOrderToSupabase({
      orderNumber,
      userId: userId || null,
      email,
      firstName,
      lastName,
      phone,
      subtotal,
      shipping,
      tax,
      total,
      stripeSessionId: session.id,
      shippingAddress,
      items: cartItems,
    });

    if (isDatabaseConfigured()) {
      const customer = await prisma.customer.upsert({
        where: { email },
        create: { email, firstName, lastName, phone },
        update: { firstName, lastName, phone },
      });

      const orderItems = [];
      for (const item of cartItems) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        if (product) {
          orderItems.push({
            productId: product.id,
            quantity: item.quantity,
            price: item.price,
          });
          await prisma.product.update({
            where: { id: product.id },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      await prisma.order.create({
        data: {
          orderNumber,
          status: "PROCESSING",
          customerId: customer.id,
          subtotal,
          shipping,
          tax,
          total,
          stripeId: session.id,
          notes: JSON.stringify({ shippingAddress, supabaseUserId: userId }),
          items: { create: orderItems },
        },
      });
    }

    await sendOrderConfirmation(email, orderNumber, total);
  }

  return NextResponse.json({ received: true });
}
