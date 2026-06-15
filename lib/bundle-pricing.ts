/** Bundle quantity tiers and their fixed dollar discounts off the line total. */
export const BUNDLE_OPTIONS = [
  { label: "Single", quantity: 1, note: "Perfect for first try", discount: 0 },
  { label: "3-Pack", quantity: 3, note: "Best for weekly ritual", discount: 2 },
  { label: "6-Pack", quantity: 6, note: "Stock up and save trips", discount: 3 },
] as const;

export function getBundleDiscount(quantity: number): number {
  const tier = BUNDLE_OPTIONS.find((option) => option.quantity === quantity);
  return tier?.discount ?? 0;
}

export function getBundleLineTotal(unitPrice: number, quantity: number): number {
  const discount = getBundleDiscount(quantity);
  return Math.max(0, Math.round((unitPrice * quantity - discount) * 100) / 100);
}
