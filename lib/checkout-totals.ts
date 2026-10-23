import {
  applySubscriptionDiscount,
  type PurchaseType,
} from "@/lib/subscriptions";
import { validatePromoCode } from "@/lib/promo-codes";
import { getBundleLineTotal } from "@/lib/bundle-pricing";
import {
  calculateCheckoutShipping,
  calculateOrderTotals,
  getCheckoutSettings,
  validateCartItems,
  applyFreeShippingIfEligible,
  type ShippingAddress,
  type ValidatedCartItem,
} from "@/lib/checkout";
import type { checkoutTotalsSchema } from "@/lib/validations";
import type { z } from "zod";

export type CheckoutTotalsInput = z.infer<typeof checkoutTotalsSchema>;

export type CheckoutTotalsResult = {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  totalCents: number;
};

export async function computeCheckoutTotals(
  input: CheckoutTotalsInput
): Promise<{
  totals: CheckoutTotalsResult;
  validatedItems?: ValidatedCartItem[];
  promoCodeApplied?: string;
  promoDiscount?: number;
  error?: string;
}> {
  const purchaseType: PurchaseType = input.purchaseType ?? "one_time";

  const { items: validatedItems, error: cartError } = await validateCartItems(
    input.items
  );
  if (cartError) return { totals: zeroTotals(), error: cartError };

  const rawSubtotal = validatedItems.reduce(
    (sum, item) => sum + getBundleLineTotal(item.price, item.quantity),
    0
  );

  let promoDiscount = 0;
  let promoCodeApplied: string | undefined;
  if (input.promoCode?.trim()) {
    const promoResult = await validatePromoCode(input.promoCode, rawSubtotal);
    if (!promoResult.valid) {
      return { totals: zeroTotals(), error: promoResult.error };
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
    line1: input.line1,
    line2: input.line2,
    city: input.city,
    state: input.state ?? "",
    postalCode: input.postalCode,
    country: input.country,
  };

  const settings = await getCheckoutSettings();
  const shippingQuote = applyFreeShippingIfEligible(
    await calculateCheckoutShipping(validatedItems, shippingAddress),
    subtotalAfterPromo,
    settings.freeShippingThreshold,
    input.country
  );

  const orderTotals = calculateOrderTotals(
    subtotal,
    settings,
    shippingQuote.shipping
  );

  return {
    totals: {
      subtotal: orderTotals.subtotal,
      shipping: orderTotals.shipping,
      tax: orderTotals.tax,
      total: orderTotals.total,
      totalCents: Math.round(orderTotals.total * 100),
    },
    validatedItems,
    promoCodeApplied,
    promoDiscount: promoDiscount > 0 ? promoDiscount : undefined,
  };
}

function zeroTotals(): CheckoutTotalsResult {
  return { subtotal: 0, shipping: 0, tax: 0, total: 0, totalCents: 0 };
}
