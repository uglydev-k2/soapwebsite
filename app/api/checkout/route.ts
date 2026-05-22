import { NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return errorResponse("Stripe is not configured", 503);
  }

  const { items, email, firstName, lastName } = await request.json();
  if (!items?.length) return errorResponse("Cart is empty");

  const lineItems = items.map(
    (item: { name: string; price: number; quantity: number; image?: string }) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    })
  );

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: lineItems,
    success_url: `${process.env.NEXTAUTH_URL}/collections?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/collections?cancelled=true`,
    metadata: {
      firstName: firstName || "",
      lastName: lastName || "",
      email: email || "",
    },
  });

  return jsonResponse({ url: session.url });
}
