import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { withApiHandler } from "@/lib/api-handler";
import { checkoutPaymentSchema } from "@/lib/validations";
import { getCheckoutSettings, type ShippingAddress } from "@/lib/checkout";
import { computeCheckoutTotals } from "@/lib/checkout-totals";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isSquareConfigured } from "@/lib/square";
import {
  chargeSquarePayment,
  SQUARE_PAYMENT_SUCCESS_STATUSES,
} from "@/lib/square-payments";
import { fulfillOrder } from "@/lib/fulfill-order";
import { generateOrderNumber } from "@/lib/utils";
import type { PurchaseType } from "@/lib/subscriptions";
import { redeemPromoCode } from "@/lib/promo-codes";
import { squarePaymentUserMessage } from "@/lib/square-payment-errors";
import {
  createOrGetSquareCustomer,
  createSquareCardOnFile,
  formatSquareApiError,
} from "@/lib/square-subscription";
import { createCustomerSubscription } from "@/lib/customer-subscriptions";
import { getCheckoutBlockReason } from "@/lib/checkout-guards";
import { FulfillOrderError } from "@/lib/fulfill-order";
import { isDatabaseConfigured } from "@/lib/env";

export const POST = withApiHandler("checkout.create", async (request: NextRequest) => {
  if (!isSquareConfigured()) {
    return errorResponse("Square payments are not configured", 503);
  }

  const checkoutBlockReason = await getCheckoutBlockReason();
  if (checkoutBlockReason) {
    return errorResponse(checkoutBlockReason, 503);
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

  const computed = await computeCheckoutTotals(parsed.data);
  if (computed.error) return errorResponse(computed.error);
  const validatedItems = computed.validatedItems!;
  const totals = computed.totals;
  const promoCodeApplied = computed.promoCodeApplied;
  const promoDiscount = computed.promoDiscount ?? 0;

  const shippingAddress: ShippingAddress = {
    line1: parsed.data.line1,
    line2: parsed.data.line2,
    city: parsed.data.city,
    state: parsed.data.state ?? "",
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

  const orderNumber = generateOrderNumber();
  const amountCents = BigInt(totals.totalCents);

  let squareCustomerId: string | undefined;
  let subscriptionStatus: "active" | undefined;
  const paymentSourceId = parsed.data.sourceId;
  let savedCardId: string | undefined;

  if (purchaseType === "subscription" && !subscriptionCadence) {
    return errorResponse("Choose a delivery frequency for your subscription");
  }

  let paymentResponse;
  try {
    paymentResponse = await chargeSquarePayment({
      sourceId: paymentSourceId,
      verificationToken: parsed.data.verificationToken,
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
    console.error(
      "[msvee:checkout] Square payment failed:",
      formatSquareApiError(error)
    );
    return errorResponse(squarePaymentUserMessage(error), 402);
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

  if (purchaseType === "subscription") {
    const paymentCustomerId =
      typeof payment.customerId === "string" ? payment.customerId : undefined;

    if (paymentCustomerId) {
      squareCustomerId = paymentCustomerId;
    } else {
      try {
        squareCustomerId = await createOrGetSquareCustomer({
          email: parsed.data.email,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          phone: parsed.data.phone,
          countryCode: parsed.data.country,
        });
      } catch (error) {
        console.error(
          "[msvee:checkout] Square customer setup failed after payment:",
          formatSquareApiError(error)
        );
      }
    }

    if (squareCustomerId) {
      try {
        savedCardId = await createSquareCardOnFile({
          customerId: squareCustomerId,
          sourceId: payment.id,
          idempotencyKey: randomUUID(),
        });
      } catch (error) {
        console.error(
          "[msvee:checkout] Card-on-file save failed after payment:",
          formatSquareApiError(error)
        );
      }
    }
  }

  if (purchaseType === "subscription" && subscriptionCadence && squareCustomerId && savedCardId) {
    subscriptionStatus = "active";
  }

  let result;
  try {
    result = await fulfillOrder({
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
  } catch (error) {
    console.error("[msvee:checkout] Fulfillment failed after payment:", error);
    return errorResponse(
      error instanceof FulfillOrderError
        ? "Your payment was received but we could not save your order. Please contact us with your email and we will resolve this promptly."
        : "Your payment was received but order processing failed. Please contact support.",
      500
    );
  }

  if (isDatabaseConfigured() && !result.orderId) {
    console.error(
      "[msvee:checkout] Payment succeeded without order record:",
      payment.id
    );
    return errorResponse(
      "Your payment was received but we could not save your order. Please contact us with your email and we will resolve this promptly.",
      500
    );
  }

  if (promoCodeApplied) {
    await redeemPromoCode(promoCodeApplied);
  }

  let subscriptionSetupFailed =
    purchaseType === "subscription" && Boolean(squareCustomerId) && !savedCardId;

  if (
    purchaseType === "subscription" &&
    subscriptionCadence &&
    squareCustomerId &&
    savedCardId &&
    result.customerId &&
    result.orderId
  ) {
    try {
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
    } catch (error) {
      subscriptionSetupFailed = true;
      console.error(
        "[msvee:checkout] Subscription profile failed after order:",
        error
      );
    }
  }

  return jsonResponse({
    paymentId: payment.id,
    orderNumber: result.orderNumber,
    orderId: result.orderId,
    purchaseType,
    subscriptionCadence,
    subscriptionStatus: subscriptionSetupFailed ? undefined : subscriptionStatus,
    subscriptionSetupFailed,
  });
});
