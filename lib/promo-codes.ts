import type { PromoDiscountType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";

export type PromoValidationResult =
  | {
      valid: true;
      code: string;
      discountType: PromoDiscountType;
      discountValue: number;
      discountAmount: number;
      discountedSubtotal: number;
    }
  | { valid: false; error: string };

export function calculatePromoDiscount(
  subtotal: number,
  discountType: PromoDiscountType,
  discountValue: number
): number {
  if (discountType === "PERCENT") {
    return Math.round(subtotal * (discountValue / 100) * 100) / 100;
  }
  return Math.min(subtotal, Math.round(discountValue * 100) / 100);
}

export async function validatePromoCode(
  code: string | undefined | null,
  subtotal: number
): Promise<PromoValidationResult> {
  const normalized = code?.trim().toUpperCase();
  if (!normalized) {
    return { valid: false, error: "Enter a promo code" };
  }

  if (!isDatabaseConfigured()) {
    return { valid: false, error: "Promo codes are unavailable right now" };
  }

  const promo = await prisma.promoCode.findUnique({
    where: { code: normalized },
  });

  if (!promo || !promo.active) {
    return { valid: false, error: "This promo code is not valid" };
  }

  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return { valid: false, error: "This promo code has expired" };
  }

  if (promo.maxUses != null && promo.usedCount >= promo.maxUses) {
    return { valid: false, error: "This promo code has reached its usage limit" };
  }

  if (promo.minSubtotal != null && subtotal < promo.minSubtotal) {
    return {
      valid: false,
      error: `Minimum order of $${promo.minSubtotal.toFixed(2)} required`,
    };
  }

  const discountAmount = calculatePromoDiscount(
    subtotal,
    promo.discountType,
    promo.discountValue
  );

  if (discountAmount <= 0) {
    return { valid: false, error: "This promo code does not apply to your cart" };
  }

  return {
    valid: true,
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    discountAmount,
    discountedSubtotal: Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100),
  };
}

export async function redeemPromoCode(code: string) {
  if (!isDatabaseConfigured()) return;

  await prisma.promoCode.update({
    where: { code: code.toUpperCase() },
    data: { usedCount: { increment: 1 } },
  });
}
