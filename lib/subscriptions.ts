export type PurchaseType = "one_time" | "subscription";

export type SubscriptionCadence = "monthly" | "bimonthly" | "quarterly";

export const SUBSCRIPTION_DISCOUNT_RATE = 0.1;

export const SUBSCRIPTION_CADENCES: {
  id: SubscriptionCadence;
  label: string;
  description: string;
}[] = [
  {
    id: "monthly",
    label: "Monthly",
    description: "Delivered every month · 10% off each box",
  },
  {
    id: "bimonthly",
    label: "Every 2 months",
    description: "Seasonal refresh · 10% off each box",
  },
  {
    id: "quarterly",
    label: "Every 3 months",
    description: "Quarterly ritual · 10% off each box",
  },
];

export function applySubscriptionDiscount(
  subtotal: number,
  purchaseType: PurchaseType
): number {
  if (purchaseType !== "subscription") return subtotal;
  return Math.round(subtotal * (1 - SUBSCRIPTION_DISCOUNT_RATE) * 100) / 100;
}

export function getCadenceLabel(cadence: SubscriptionCadence): string {
  return SUBSCRIPTION_CADENCES.find((item) => item.id === cadence)?.label ?? cadence;
}
