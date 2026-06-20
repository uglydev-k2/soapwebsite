import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";
import { fulfillOrder } from "@/lib/fulfill-order";
import { parseOrderNotes } from "@/lib/order-notes";
import {
  chargeSquarePayment,
  SQUARE_PAYMENT_SUCCESS_STATUSES,
} from "@/lib/square-payments";
import { isSquareConfigured } from "@/lib/square";
import { computeNextChargeAt } from "@/lib/customer-subscriptions";
import {
  parseSubscriptionCartSnapshot,
  type SubscriptionCartSnapshot,
} from "@/lib/subscription-cart";
import { getBundleLineTotal } from "@/lib/bundle-pricing";
import {
  applyFreeShippingIfEligible,
  calculateCheckoutShipping,
  calculateOrderTotals,
  getCheckoutSettings,
} from "@/lib/checkout";
import { generateOrderNumber } from "@/lib/utils";
import type { ShippingAddress, ValidatedCartItem } from "@/lib/checkout";
import type { Customer, CustomerSubscription } from "@prisma/client";
import type { SubscriptionCadence } from "@/lib/subscriptions";

export type SubscriptionChargeResult = {
  subscriptionId: string;
  status: "charged" | "skipped" | "failed";
  orderId?: string;
  orderNumber?: string;
  paymentId?: string;
  error?: string;
};

export type ProcessSubscriptionChargesSummary = {
  processed: number;
  charged: number;
  skipped: number;
  failed: number;
  results: SubscriptionChargeResult[];
};

async function validateRenewalCartItems(
  items: SubscriptionCartSnapshot["items"]
): Promise<{ items: ValidatedCartItem[]; error?: string }> {
  if (!items.length) return { items: [], error: "Subscription cart is empty" };

  if (!isDatabaseConfigured()) {
    return {
      items: items.map((item) => ({
        productId: item.productId,
        scentOptionId: item.scentOptionId,
        scentLabel: item.scentLabel,
        name: item.name ?? "Product",
        slug: item.slug ?? item.productId,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
    };
  }

  const validated: ValidatedCartItem[] = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });

    if (!product || !product.active) {
      return {
        items: [],
        error: `${item.name ?? "A product"} is no longer available`,
      };
    }

    if (item.scentOptionId) {
      const scentOption = await prisma.productScentOption.findFirst({
        where: {
          id: item.scentOptionId,
          productId: product.id,
          active: true,
        },
      });

      if (!scentOption) {
        return {
          items: [],
          error: `${item.name ?? product.name} scent is no longer available`,
        };
      }

      if (scentOption.stock < item.quantity) {
        return {
          items: [],
          error: `${product.name} (${scentOption.label}) is out of stock`,
        };
      }

      validated.push({
        productId: product.id,
        scentOptionId: scentOption.id,
        scentLabel: scentOption.label,
        name: item.name ?? `${product.name} — ${scentOption.label}`,
        slug: item.slug ?? product.slug,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      });
      continue;
    }

    if (product.stock < item.quantity) {
      return {
        items: [],
        error: `${product.name} is out of stock`,
      };
    }

    validated.push({
      productId: product.id,
      name: item.name ?? product.name,
      slug: item.slug ?? product.slug,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    });
  }

  return { items: validated };
}

async function getSubscriptionShippingAddress(
  subscription: CustomerSubscription
): Promise<ShippingAddress | null> {
  if (subscription.sourceOrderId) {
    const sourceOrder = await prisma.order.findUnique({
      where: { id: subscription.sourceOrderId },
      select: { notes: true },
    });
    const address = parseOrderNotes(sourceOrder?.notes).shippingAddress;
    if (address) return address;
  }

  const recentOrder = await prisma.order.findFirst({
    where: { customerId: subscription.customerId },
    orderBy: { createdAt: "desc" },
    select: { notes: true },
  });

  return parseOrderNotes(recentOrder?.notes).shippingAddress ?? null;
}

async function resolveRenewalTotals(input: {
  cartItems: ValidatedCartItem[];
  shippingAddress: ShippingAddress;
  snapshot: SubscriptionCartSnapshot;
}) {
  const settings = await getCheckoutSettings();
  const merchandiseSubtotal = input.snapshot.items.reduce(
    (sum, item) => sum + getBundleLineTotal(item.price, item.quantity),
    0
  );

  let quote = await calculateCheckoutShipping(
    input.cartItems,
    input.shippingAddress
  );
  quote = applyFreeShippingIfEligible(
    quote,
    merchandiseSubtotal,
    settings.freeShippingThreshold,
    input.shippingAddress.country
  );

  const subtotal = input.snapshot.totals.subtotal;
  const orderTotals = calculateOrderTotals(subtotal, settings, quote.shipping);

  return {
    subtotal: orderTotals.subtotal,
    shipping: orderTotals.shipping,
    tax: orderTotals.tax,
    total: orderTotals.total,
  };
}

async function chargeSubscriptionRenewal(input: {
  subscription: CustomerSubscription & { customer: Customer };
  cartItems: ValidatedCartItem[];
  shippingAddress: ShippingAddress;
  snapshot: SubscriptionCartSnapshot;
}): Promise<SubscriptionChargeResult> {
  const { subscription, cartItems, shippingAddress, snapshot } = input;
  const totals = await resolveRenewalTotals({
    cartItems,
    shippingAddress,
    snapshot,
  });
  const orderNumber = generateOrderNumber();
  const idempotencyKey = `renewal-${subscription.id}-${subscription.nextChargeAt.toISOString()}`;
  const amountCents = BigInt(Math.round(totals.total * 100));

  let paymentResponse;
  try {
    paymentResponse = await chargeSquarePayment({
      sourceId: subscription.squareCardId,
      idempotencyKey,
      amountCents,
      orderNumber,
      email: subscription.customer.email,
      firstName: subscription.customer.firstName,
      lastName: subscription.customer.lastName,
      line1: shippingAddress.line1,
      line2: shippingAddress.line2,
      city: shippingAddress.city,
      state: shippingAddress.state,
      postalCode: shippingAddress.postalCode,
      country: shippingAddress.country,
    });
  } catch (error) {
    console.error(
      `[msvee:subscription-renewal] Charge failed for ${subscription.id}:`,
      error
    );
    return {
      subscriptionId: subscription.id,
      status: "failed",
      error: "Payment could not be processed",
    };
  }

  const payment = paymentResponse.payment;
  if (!payment?.id || !payment.status || !SQUARE_PAYMENT_SUCCESS_STATUSES.has(payment.status)) {
    return {
      subscriptionId: subscription.id,
      status: "failed",
      error:
        payment?.status === "FAILED"
          ? "Card was declined"
          : "Payment could not be completed",
    };
  }

  const result = await fulfillOrder({
    orderNumber,
    email: subscription.customer.email,
    firstName: subscription.customer.firstName,
    lastName: subscription.customer.lastName,
    phone: subscription.customer.phone ?? undefined,
    shippingAddress,
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    tax: totals.tax,
    total: totals.total,
    paymentId: payment.id,
    paymentProvider: "square",
    purchaseType: "subscription",
    subscriptionCadence: subscription.cadence as SubscriptionCadence,
    squareCustomerId: subscription.squareCustomerId,
    subscriptionStatus: "active",
    subscriptionId: subscription.id,
    subscriptionRenewal: true,
    cartItems,
  });

  if (!result.orderId) {
    console.error(
      `[msvee:subscription-renewal] Payment ${payment.id} succeeded but order was not saved for subscription ${subscription.id}`
    );
    return {
      subscriptionId: subscription.id,
      status: "failed",
      paymentId: payment.id,
      error: "Payment succeeded but order could not be created",
    };
  }

  const chargedAt = new Date();
  await prisma.customerSubscription.update({
    where: { id: subscription.id },
    data: {
      lastChargedAt: chargedAt,
      nextChargeAt: computeNextChargeAt(
        subscription.cadence as SubscriptionCadence,
        chargedAt
      ),
    },
  });

  return {
    subscriptionId: subscription.id,
    status: "charged",
    orderId: result.orderId,
    orderNumber: result.orderNumber,
    paymentId: payment.id,
  };
}

export async function processDueSubscriptionCharges(
  limit = 50
): Promise<ProcessSubscriptionChargesSummary> {
  const summary: ProcessSubscriptionChargesSummary = {
    processed: 0,
    charged: 0,
    skipped: 0,
    failed: 0,
    results: [],
  };

  if (!isDatabaseConfigured() || !isSquareConfigured()) {
    return summary;
  }

  const due = await prisma.customerSubscription.findMany({
    where: {
      status: "ACTIVE",
      nextChargeAt: { lte: new Date() },
    },
    include: {
      customer: true,
    },
    orderBy: { nextChargeAt: "asc" },
    take: limit,
  });

  for (const subscription of due) {
    summary.processed += 1;

    const snapshot = parseSubscriptionCartSnapshot(subscription.cartSnapshot);
    if (!snapshot?.items.length || !snapshot.totals) {
      summary.skipped += 1;
      summary.results.push({
        subscriptionId: subscription.id,
        status: "skipped",
        error: "Invalid subscription cart snapshot",
      });
      continue;
    }

    const shippingAddress = await getSubscriptionShippingAddress(subscription);
    if (!shippingAddress) {
      summary.skipped += 1;
      summary.results.push({
        subscriptionId: subscription.id,
        status: "skipped",
        error: "No shipping address on file",
      });
      continue;
    }

    const { items: cartItems, error: cartError } = await validateRenewalCartItems(
      snapshot.items
    );
    if (cartError) {
      summary.skipped += 1;
      summary.results.push({
        subscriptionId: subscription.id,
        status: "skipped",
        error: cartError,
      });
      continue;
    }

    const result = await chargeSubscriptionRenewal({
      subscription,
      cartItems,
      shippingAddress,
      snapshot,
    });

    summary.results.push(result);
    if (result.status === "charged") summary.charged += 1;
    else if (result.status === "skipped") summary.skipped += 1;
    else summary.failed += 1;
  }

  return summary;
}
