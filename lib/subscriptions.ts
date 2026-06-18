export type PurchaseType = "one_time" | "subscription";

export type SubscriptionCadence = "monthly" | "bimonthly" | "quarterly";

export const SUBSCRIPTION_DISCOUNT_RATE = 0.1;

export const SUBSCRIPTION_CADENCES: {
  id: SubscriptionCadence;
  label: string;
  description: string;
  envKey: string;
}[] = [
  {
    id: "monthly",
    label: "Monthly",
    description: "Delivered every month · 10% off each box",
    envKey: "SQUARE_SUBSCRIPTION_PLAN_MONTHLY",
  },
  {
    id: "bimonthly",
    label: "Every 2 months",
    description: "Seasonal refresh · 10% off each box",
    envKey: "SQUARE_SUBSCRIPTION_PLAN_BIMONTHLY",
  },
  {
    id: "quarterly",
    label: "Every 3 months",
    description: "Quarterly ritual · 10% off each box",
    envKey: "SQUARE_SUBSCRIPTION_PLAN_QUARTERLY",
  },
];

export function getSubscriptionPlanVariationId(
  cadence: SubscriptionCadence
): string | null {
  const config = SUBSCRIPTION_CADENCES.find((item) => item.id === cadence);
  if (!config) return null;
  const planId = process.env[config.envKey]?.trim();
  return planId || null;
}

export function isSquareSubscriptionPlanConfigured(
  cadence: SubscriptionCadence
): boolean {
  return Boolean(getSubscriptionPlanVariationId(cadence));
}

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
