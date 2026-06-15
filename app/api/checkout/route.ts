import { NextRequest } from "next/server";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { withApiHandler } from "@/lib/api-handler";
import { checkoutPaymentSchema } from "@/lib/validations";
import {
  calculateOrderTotals,
  getCheckoutSettings,
  validateCartItems,
  calculateCheckoutShipping,
  type ShippingAddress,
} from "@/lib/checkout";
import { getBundleLineTotal } from "@/lib/bundle-pricing";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCountryCode } from "@/lib/shipping";
import { getSquareClient, getSquareLocationId, isSquareConfigured } from "@/lib/square";
import { fulfillOrder } from "@/lib/fulfill-order";
import { generateOrderNumber } from "@/lib/utils";

const SUCCESS_STATUSES = new Set(["COMPLETED", "APPROVED", "PENDING"]);

export const POST = withApiHandler("checkout.create", async (request: NextRequest) => {
  if (!isSquareConfigured()) {
    return errorResponse("Square payments are not configured", 503);
  }

  const body = await request.json();
  const parsed = checkoutPaymentSchema.safeParse(body);
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
    (sum, item) => sum + getBundleLineTotal(item.price, item.quantity),
    0
  );

  const shippingAddress: ShippingAddress = {
    line1: parsed.data.line1,
    line2: parsed.data.line2,
    city: parsed.data.city,
    state: parsed.data.state ?? "",
    postalCode: parsed.data.postalCode,
    country: parsed.data.country,
  };

  const shippingQuote = await calculateCheckoutShipping(
    validatedItems,
    shippingAddress,
    subtotal
  );

  const totals = calculateOrderTotals(subtotal, settings, shippingQuote.shipping);

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

  const orderNumber = generateOrderNumber();
  const amountCents = BigInt(Math.round(totals.total * 100));

  let paymentResponse;
  try {
    paymentResponse = await getSquareClient().payments.create({
      sourceId: parsed.data.sourceId,
      idempotencyKey: parsed.data.idempotencyKey,
      amountMoney: {
        amount: amountCents,
        currency: "USD",
      },
      locationId: getSquareLocationId(),
      referenceId: orderNumber.slice(0, 40),
      note: `MsVee Soaps order ${orderNumber}`,
      buyerEmailAddress: parsed.data.email,
      shippingAddress: {
        addressLine1: parsed.data.line1,
        addressLine2: parsed.data.line2,
        locality: parsed.data.city,
        administrativeDistrictLevel1: parsed.data.state ?? undefined,
        postalCode: parsed.data.postalCode,
        country: getCountryCode(parsed.data.country) as
          | "US"
          | "CA"
          | "MX"
          | "GB"
          | "AU"
          | "DE"
          | "FR"
          | "IE"
          | "NL"
          | "JP"
          | "NZ"
          | "SG",
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
      },
      autocomplete: true,
    });
  } catch (error) {
    console.error("[msvee:checkout] Square payment failed:", error);
    return errorResponse("Payment could not be processed. Please try again.", 402);
  }

  const payment = paymentResponse.payment;
  if (!payment?.id) {
    return errorResponse("Payment could not be processed. Please try again.", 402);
  }

  if (!payment.status || !SUCCESS_STATUSES.has(payment.status)) {
    return errorResponse(
      payment.status === "FAILED"
        ? "Your card was declined. Please try another payment method."
        : "Payment could not be completed. Please try again.",
      402
    );
  }

  const result = await fulfillOrder({
    orderNumber,
    email: parsed.data.email,
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    phone: parsed.data.phone,
    userId: supabaseUserId,
    shippingAddress,
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    tax: totals.tax,
    total: totals.total,
    paymentId: payment.id,
    paymentProvider: "square",
    cartItems: validatedItems,
  });

  return jsonResponse({
    paymentId: payment.id,
    orderNumber: result.orderNumber,
    orderId: result.orderId,
  });
});
