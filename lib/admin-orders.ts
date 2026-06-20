import type { Prisma } from "@prisma/client";
import { parseOrderNotes } from "@/lib/order-notes";
import type { PurchaseType } from "@/lib/subscriptions";

export function getOrderPurchaseType(
  notes: string | null | undefined
): PurchaseType {
  return parseOrderNotes(notes).purchaseType ?? "one_time";
}

export function orderPurchaseTypeWhere(
  type: PurchaseType
): Prisma.OrderWhereInput {
  if (type === "subscription") {
    return { notes: { contains: '"purchaseType":"subscription"' } };
  }
  return {
    NOT: { notes: { contains: '"purchaseType":"subscription"' } },
  };
}
