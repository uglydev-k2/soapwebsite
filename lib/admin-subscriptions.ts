import type { CustomerSubscription, Customer } from "@prisma/client";
import { getCadenceLabel, type SubscriptionCadence } from "@/lib/subscriptions";
import {
  parseSubscriptionCartSnapshot,
  type SubscriptionCartSnapshot,
} from "@/lib/subscription-cart";

export type { SubscriptionCartSnapshot };

export type AdminSubscriptionRow = {
  id: string;
  status: CustomerSubscription["status"];
  cadence: SubscriptionCadence;
  cadenceLabel: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  sourceOrderId: string | null;
  sourceOrderNumber: string;
  itemCount: number;
  itemSummary: string;
  items: SubscriptionCartSnapshot["items"];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  nextChargeAt: string;
  lastChargedAt: string | null;
  createdAt: string;
  cancelledAt: string | null;
  pausedAt: string | null;
};

export type AdminSubscriptionMetrics = {
  activeCount: number;
  pausedCount: number;
  cancelledCount: number;
  dueThisWeek: number;
  estimatedMrr: number;
};

type SubscriptionWithCustomer = CustomerSubscription & {
  customer: Pick<Customer, "id" | "firstName" | "lastName" | "email">;
};

export function serializeAdminSubscription(
  subscription: SubscriptionWithCustomer
): AdminSubscriptionRow {
  const snapshot = parseSubscriptionCartSnapshot(subscription.cartSnapshot);
  const items = snapshot?.items ?? [];
  const itemCount = items.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
  const names = items
    .map((item) => {
      const label = item.scentLabel
        ? `${item.name ?? "Item"} (${item.scentLabel})`
        : item.name ?? "Item";
      return `${label} ×${item.quantity}`;
    })
    .slice(0, 3);

  return {
    id: subscription.id,
    status: subscription.status,
    cadence: subscription.cadence as SubscriptionCadence,
    cadenceLabel: getCadenceLabel(subscription.cadence as SubscriptionCadence),
    customerId: subscription.customerId,
    customerName:
      `${subscription.customer.firstName} ${subscription.customer.lastName}`.trim() ||
      subscription.customer.email,
    customerEmail: subscription.customer.email,
    sourceOrderId: subscription.sourceOrderId,
    sourceOrderNumber: subscription.sourceOrderNumber,
    itemCount,
    itemSummary: names.join(", ") || "—",
    items,
    subtotal: snapshot?.totals.subtotal ?? 0,
    shipping: snapshot?.totals.shipping ?? 0,
    tax: snapshot?.totals.tax ?? 0,
    total: snapshot?.totals.total ?? 0,
    nextChargeAt: subscription.nextChargeAt.toISOString(),
    lastChargedAt: subscription.lastChargedAt?.toISOString() ?? null,
    createdAt: subscription.createdAt.toISOString(),
    cancelledAt: subscription.cancelledAt?.toISOString() ?? null,
    pausedAt: subscription.pausedAt?.toISOString() ?? null,
  };
}

function cadenceMonths(cadence: SubscriptionCadence): number {
  if (cadence === "monthly") return 1;
  if (cadence === "bimonthly") return 2;
  return 3;
}

export function computeSubscriptionMetrics(
  subscriptions: AdminSubscriptionRow[]
): AdminSubscriptionMetrics {
  const now = new Date();
  const weekAhead = new Date(now);
  weekAhead.setDate(weekAhead.getDate() + 7);

  let activeCount = 0;
  let pausedCount = 0;
  let cancelledCount = 0;
  let dueThisWeek = 0;
  let estimatedMrr = 0;

  for (const sub of subscriptions) {
    if (sub.status === "ACTIVE") {
      activeCount += 1;
      const nextCharge = new Date(sub.nextChargeAt);
      if (nextCharge <= weekAhead) dueThisWeek += 1;
      estimatedMrr += sub.total / cadenceMonths(sub.cadence);
    } else if (sub.status === "PAUSED") {
      pausedCount += 1;
    } else if (sub.status === "CANCELLED") {
      cancelledCount += 1;
    }
  }

  return {
    activeCount,
    pausedCount,
    cancelledCount,
    dueThisWeek,
    estimatedMrr: Math.round(estimatedMrr * 100) / 100,
  };
}
