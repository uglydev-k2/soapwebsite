import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";
import type { SubscriptionCadence } from "@/lib/subscriptions";
import type { ValidatedCartItem } from "@/lib/checkout";

type CreateSubscriptionInput = {
  customerId: string;
  cadence: SubscriptionCadence;
  squareCustomerId: string;
  squareCardId: string;
  sourceOrderId?: string;
  sourceOrderNumber: string;
  items: ValidatedCartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
};

export function computeNextChargeAt(
  cadence: SubscriptionCadence,
  fromDate: Date = new Date()
): Date {
  const next = new Date(fromDate);
  const months = cadence === "monthly" ? 1 : cadence === "bimonthly" ? 2 : 3;
  next.setMonth(next.getMonth() + months);
  return next;
}

export async function createCustomerSubscription(input: CreateSubscriptionInput) {
  if (!isDatabaseConfigured()) return null;

  return prisma.customerSubscription.create({
    data: {
      customerId: input.customerId,
      cadence: input.cadence,
      status: "ACTIVE",
      squareCustomerId: input.squareCustomerId,
      squareCardId: input.squareCardId,
      sourceOrderId: input.sourceOrderId,
      sourceOrderNumber: input.sourceOrderNumber,
      nextChargeAt: computeNextChargeAt(input.cadence),
      cartSnapshot: {
        items: input.items.map((item) => ({
          productId: item.productId,
          scentOptionId: item.scentOptionId,
          scentLabel: item.scentLabel,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          slug: item.slug,
          image: item.image,
        })),
        totals: {
          subtotal: input.subtotal,
          shipping: input.shipping,
          tax: input.tax,
          total: input.total,
        },
      },
    },
  });
}
