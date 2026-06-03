/** Shared shipping constants for cart, checkout, and marketing copy */
export const FREE_SHIPPING_THRESHOLD = 60;
export const FLAT_SHIPPING_RATE = 8;
export const TAX_RATE = 0.08;

export function getFreeShippingProgress(subtotal: number) {
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const amountRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const qualifies = subtotal >= FREE_SHIPPING_THRESHOLD;
  return { progress, amountRemaining, qualifies };
}

export function calculateCartTotals(subtotal: number) {
  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;
  return { subtotal, shipping, tax, total };
}
