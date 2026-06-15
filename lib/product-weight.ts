import type { Category } from "@prisma/client";

/** Per-unit shipping weight in ounces (product + primary packaging). */
export const CATEGORY_WEIGHT_OZ: Record<Category, number> = {
  BAR_SOAP: 6,
  BATH_BODY: 10, // 8 oz jar + ~2 oz product
  CANDLES: 10,
  ACCESSORIES: 4,
  GIFT_SET: 18,
};

/** Sample items ship lighter but need extra padding. */
export const SAMPLE_UNIT_WEIGHT_OZ = 2;
export const SAMPLE_EXTRA_OZ = 2;

/** Mailer, padding, and label per order. */
export const PACKAGE_TARE_OZ = 3;

export function isSampleProduct(name: string, slug: string): boolean {
  const haystack = `${name} ${slug}`.toLowerCase();
  return haystack.includes("sample");
}

export function getCategoryDefaultWeightOz(category: Category): number {
  return CATEGORY_WEIGHT_OZ[category] ?? 6;
}

export function getUnitWeightOz(
  category: Category,
  name: string,
  slug: string,
  weightOz?: number | null
): number {
  if (weightOz != null && weightOz > 0) {
    return weightOz;
  }
  if (isSampleProduct(name, slug)) {
    return SAMPLE_UNIT_WEIGHT_OZ + SAMPLE_EXTRA_OZ;
  }
  return getCategoryDefaultWeightOz(category);
}

export type CartWeightItem = {
  category: Category;
  name: string;
  slug: string;
  quantity: number;
  weightOz?: number | null;
};

export function calculateCartWeightOz(items: CartWeightItem[]): number {
  if (items.length === 0) return 0;

  const productOz = items.reduce((sum, item) => {
    const unit = getUnitWeightOz(
      item.category,
      item.name,
      item.slug,
      item.weightOz
    );
    return sum + unit * item.quantity;
  }, 0);

  return productOz + PACKAGE_TARE_OZ;
}

/** Round up to USPS Ground Advantage billing weight. */
export function toUspsBillingWeightOz(totalOz: number): {
  billingOz: number;
  billingLb: number;
  tier: string;
} {
  if (totalOz <= 0) {
    return { billingOz: 4, billingLb: 0.25, tier: "4 oz" };
  }

  if (totalOz <= 4) {
    return { billingOz: 4, billingLb: 0.25, tier: "4 oz" };
  }
  if (totalOz <= 8) {
    return { billingOz: 8, billingLb: 0.5, tier: "8 oz" };
  }
  if (totalOz <= 12) {
    return { billingOz: 12, billingLb: 0.75, tier: "12 oz" };
  }
  if (totalOz <= 15.999) {
    return { billingOz: 15.999, billingLb: 1, tier: "15.999 oz" };
  }

  const billingLb = Math.ceil(totalOz / 16);
  return {
    billingOz: billingLb * 16,
    billingLb,
    tier: `${billingLb} lb`,
  };
}
