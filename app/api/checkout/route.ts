import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { withApiHandler } from "@/lib/api-handler";
import { checkoutPaymentSchema } from "@/lib/validations";
import {
  calculateOrderTotals,
  getCheckoutSettings,
  validateCartItems,
  calculateCheckoutShipping,
  applyFreeShippingIfEligible,
  type ShippingAddress,
} from "@/lib/checkout";
import { getBundleLineTotal } from "@/lib/bundle-pricing";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isSquareConfigured } from "@/lib/square";
import {
  chargeSquarePayment,
  SQUARE_PAYMENT_SUCCESS_STATUSES,
} from "@/lib/square-payments";
import { fulfillOrder } from "@/lib/fulfill-order";
import { generateOrderNumber } from "@/lib/utils";
import {
  applySubscriptionDiscount,
  type PurchaseType,
} from "@/lib/subscriptions";
import { validatePromoCode, redeemPromoCode } from "@/lib/promo-codes";
import {
  createSquareCardOnFile,
  createSquareCustomer,
} from "@/lib/square-subscription";
import { createCustomerSubscription } from "@/lib/customer-subscriptions";

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

  const purchaseType: PurchaseType = parsed.data.purchaseType;
  const subscriptionCadence = parsed.data.subscriptionCadence;

  const { items: validatedItems, error: cartError } = await validateCartItems(
    parsed.data.items
  );
  if (cartError) return errorResponse(cartError);

  const rawSubtotal = validatedItems.reduce(
    (sum, item) => sum + getBundleLineTotal(item.price, item.quantity),
    0
  );

  let promoDiscount = 0;
  let promoCodeApplied: string | undefined;
  if (parsed.data.promoCode?.trim()) {
    const promoResult = await validatePromoCode(parsed.data.promoCode, rawSubtotal);
    if (!promoResult.valid) {
      return errorResponse(promoResult.error);
    }
    promoDiscount = promoResult.discountAmount;
    promoCodeApplied = promoResult.code;
  }

  const subtotalAfterPromo = Math.max(
    0,
    Math.round((rawSubtotal - promoDiscount) * 100) / 100
  );
  const subtotal = applySubscriptionDiscount(subtotalAfterPromo, purchaseType);

  const shippingAddress: ShippingAddress = {
    line1: parsed.data.line1,
    line2: parsed.data.line2,
    city: parsed.data.city,
    state: parsed.data.state ?? "",
    postalCode: parsed.data.postalCode,
    country: parsed.data.country,
  };

  const shippingQuote = applyFreeShippingIfEligible(
    await calculateCheckoutShipping(validatedItems, shippingAddress),
    subtotal,
    settings.freeShippingThreshold,
    parsed.data.country
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

  let squareCustomerId: string | undefined;
  let subscriptionStatus: "active" | undefined;
  let paymentSourceId = parsed.data.sourceId;
  let savedCardId: string | undefined;

  if (purchaseType === "subscription") {
    if (!subscriptionCadence) {
      return errorResponse("Choose a delivery frequency for your subscription");
    }

    try {
      squareCustomerId = await createSquareCustomer({
        email: parsed.data.email,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone,
      });

      savedCardId = await createSquareCardOnFile({
        customerId: squareCustomerId,
        sourceId: parsed.data.sourceId,
        idempotencyKey: randomUUID(),
      });
      paymentSourceId = savedCardId;
    } catch (error) {
      console.error("[msvee:checkout] Subscription card setup failed:", error);
      return errorResponse(
        "We could not save your card for subscription billing. Please try again or choose a one-time purchase.",
        402
      );
    }
  }

  let paymentResponse;
  try {
    paymentResponse = await chargeSquarePayment({
      sourceId: paymentSourceId,
      idempotencyKey: parsed.data.idempotencyKey,
      amountCents,
      orderNumber,
      email: parsed.data.email,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      line1: parsed.data.line1,
      line2: parsed.data.line2,
      city: parsed.data.city,
      state: parsed.data.state,
      postalCode: parsed.data.postalCode,
      country: parsed.data.country,
    });
  } catch (error) {
    console.error("[msvee:checkout] Square payment failed:", error);
    return errorResponse("Payment could not be processed. Please try again.", 402);
  }

  const payment = paymentResponse.payment;
  if (!payment?.id) {
    return errorResponse("Payment could not be processed. Please try again.", 402);
  }

  if (!payment.status || !SQUARE_PAYMENT_SUCCESS_STATUSES.has(payment.status)) {
    return errorResponse(
      payment.status === "FAILED"
        ? "Your card was declined. Please try another payment method."
        : "Payment could not be completed. Please try again.",
      402
    );
  }

  if (purchaseType === "subscription" && subscriptionCadence && squareCustomerId && savedCardId) {
    subscriptionStatus = "active";
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
    purchaseType,
    subscriptionCadence,
    squareCustomerId,
    subscriptionStatus,
    promoCode: promoCodeApplied,
    promoDiscount: promoDiscount > 0 ? promoDiscount : undefined,
    cartItems: validatedItems,
  });

  if (promoCodeApplied) {
    await redeemPromoCode(promoCodeApplied);
  }

  if (
    purchaseType === "subscription" &&
    subscriptionCadence &&
    squareCustomerId &&
    savedCardId &&
    result.customerId &&
    result.orderId
  ) {
    await createCustomerSubscription({
      customerId: result.customerId,
      cadence: subscriptionCadence,
      squareCustomerId,
      squareCardId: savedCardId,
      sourceOrderId: result.orderId,
      sourceOrderNumber: result.orderNumber,
      items: validatedItems,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      tax: totals.tax,
      total: totals.total,
    });
  }

  return jsonResponse({
    paymentId: payment.id,
    orderNumber: result.orderNumber,
    orderId: result.orderId,
    purchaseType,
    subscriptionCadence,
    subscriptionStatus,
  });
});
