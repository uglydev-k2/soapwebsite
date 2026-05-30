import { NextRequest } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { withApiHandler } from "@/lib/api-handler";
import { checkoutSchema } from "@/lib/validations";
import {
  calculateOrderTotals,
  getCheckoutSettings,
  getSiteUrl,
  validateCartItems,
  type ShippingAddress,
} from "@/lib/checkout";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const POST = withApiHandler("checkout.create", async (request: NextRequest) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return errorResponse("Stripe is not configured", 503);
  }

  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message || "Invalid checkout data");
  }

  const settings = await getCheckoutSettings();
  if (!settings.featureCheckout) {
    return errorResponse("Checkout is temporarily unavailable", 503);
  }

  const { items: validatedItems, error: cartError } = await validateCartItems(
    parsed.data.items
  );
  if (cartError) return errorResponse(cartError);

  const subtotal = validatedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totals = calculateOrderTotals(subtotal, settings);

  const shippingAddress: ShippingAddress = {
    line1: parsed.data.line1,
    line2: parsed.data.line2,
    city: parsed.data.city,
    state: parsed.data.state,
    postalCode: parsed.data.postalCode,
    country: parsed.data.country,
  };

  let supabaseUserId: string | null = null;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      supabaseUserId = user?.id ?? null;
    } catch {
      /* guest checkout */
    }
  }

  const siteUrl = getSiteUrl();
  const cartPayload = JSON.stringify(
    validatedItems.map((item) => ({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      price: item.price,
      quantity: item.quantity,
    }))
  );

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = validatedItems.map(
    (item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
          metadata: { productId: item.productId },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    })
  );

  if (totals.shipping > 0) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Shipping" },
        unit_amount: Math.round(totals.shipping * 100),
      },
      quantity: 1,
    });
  }

  if (totals.tax > 0) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Tax" },
        unit_amount: Math.round(totals.tax * 100),
      },
      quantity: 1,
    });
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: parsed.data.email,
    line_items: lineItems,
    shipping_address_collection: {
      allowed_countries: ["GH", "US", "GB", "NG", "CA"],
    },
    success_url: `${siteUrl}/order/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout?cancelled=true`,
    metadata: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      phone: parsed.data.phone ?? "",
      userId: supabaseUserId ?? "",
      cartItems: cartPayload.slice(0, 500),
      shippingAddress: JSON.stringify(shippingAddress).slice(0, 500),
      subtotal: String(totals.subtotal),
      shipping: String(totals.shipping),
      tax: String(totals.tax),
      total: String(totals.total),
    },
  });

  return jsonResponse({ url: session.url, sessionId: session.id });
});
