import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";
import { parseOrderNotes } from "@/lib/order-notes";
import { buildUspsTrackingUrl } from "@/lib/tracking";
import { getSupabaseOrdersForUser } from "@/lib/supabase/orders";

export type CustomerOrderSummary = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  trackingNumber?: string;
  trackingUrl?: string;
};

export async function getCustomerOrderSummaries(
  userId: string,
  email: string
): Promise<CustomerOrderSummary[]> {
  const supabaseOrders = await getSupabaseOrdersForUser(userId, email);
  const byNumber = new Map<string, CustomerOrderSummary>();

  for (const order of supabaseOrders) {
    byNumber.set(order.order_number, {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      total: Number(order.total),
      createdAt: order.created_at,
    });
  }

  if (isDatabaseConfigured() && email) {
    const prismaOrders = await prisma.order.findMany({
      where: { customer: { email: email.toLowerCase() } },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { customer: { select: { email: true } } },
    });

    for (const order of prismaOrders) {
      const meta = parseOrderNotes(order.notes);
      const trackingNumber = meta.trackingNumber?.trim();
      const existing = byNumber.get(order.orderNumber);

      const summary: CustomerOrderSummary = {
        id: existing?.id ?? order.id,
        orderNumber: order.orderNumber,
        status: order.status.toLowerCase(),
        total: order.total,
        createdAt: existing?.createdAt ?? order.createdAt.toISOString(),
        trackingNumber,
        trackingUrl: trackingNumber ? buildUspsTrackingUrl(trackingNumber) : undefined,
      };

      byNumber.set(order.orderNumber, summary);
    }
  }

  return Array.from(byNumber.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
