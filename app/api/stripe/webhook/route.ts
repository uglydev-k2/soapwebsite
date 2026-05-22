import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { sendOrderConfirmation } from "@/lib/resend";
import Stripe from "stripe";

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

    const customer = await prisma.customer.upsert({
      where: { email },
      create: { email, firstName, lastName },
      update: { firstName, lastName },
    });

    const lineItems = await getStripe().checkout.sessions.listLineItems(session.id);
    let subtotal = 0;
    const orderItems = [];

    for (const item of lineItems.data) {
      const product = await prisma.product.findFirst({
        where: { name: item.description || "" },
      });
      if (product) {
        const qty = item.quantity || 1;
        const price = (item.amount_total || 0) / 100 / qty;
        subtotal += price * qty;
        orderItems.push({
          productId: product.id,
          quantity: qty,
          price,
        });
      }
    }

    const shipping = subtotal >= 75 ? 0 : 8;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        status: "PROCESSING",
        customerId: customer.id,
        subtotal,
        shipping,
        tax: Math.round(tax * 100) / 100,
        total: Math.round(total * 100) / 100,
        stripeId: session.id,
        items: { create: orderItems },
      },
    });

    await sendOrderConfirmation(email, order.orderNumber, order.total);
  }

  return NextResponse.json({ received: true });
}
