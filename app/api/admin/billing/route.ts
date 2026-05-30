import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAdmin,
  jsonResponse,
  errorResponse,
  requireRateLimit,
} from "@/lib/api-helpers";
import { withApiHandler } from "@/lib/api-handler";
import { logAdminAction } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";
import { getStripe } from "@/lib/stripe";
import type { OrderStatus } from "@prisma/client";

export const GET = withApiHandler("admin.billing", async () => {
  const { error } = await requireAdmin("billing:read");
  if (error) return error;

  const orders = await prisma.order.findMany({
    include: {
      customer: { select: { firstName: true, lastName: true, email: true } },
      items: { include: { product: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [monthRevenue, totalRevenue, refunded, cancelled] = await Promise.all([
    prisma.order.aggregate({
      where: {
        createdAt: { gte: monthStart },
        status: { notIn: ["CANCELLED", "REFUNDED"] },
      },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { status: "REFUNDED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
  ]);

  const totalPaid = await prisma.order.count({
    where: { status: { in: ["DELIVERED", "SHIPPED", "PROCESSING"] } },
  });

  const mrr = monthRevenue._sum.total ?? 0;
  const arr = mrr * 12;
  const churnRate =
    totalPaid + cancelled + refunded > 0
      ? Math.round((cancelled / (totalPaid + cancelled + refunded)) * 100)
      : 0;
  const avgOrder = monthRevenue._count
    ? (monthRevenue._sum.total ?? 0) / monthRevenue._count
    : 0;

  return jsonResponse({
    subscriptions: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customer: `${o.customer.firstName} ${o.customer.lastName}`,
      email: o.customer.email,
      status: o.status,
      amount: o.total,
      renewalDate: o.createdAt,
      stripeId: o.stripeId,
      items: o.items.length,
    })),
    metrics: {
      mrr,
      arr,
      churnRate,
      ltv: Math.round(avgOrder * 3),
      totalRevenue: totalRevenue._sum.total ?? 0,
      refundedCount: refunded,
    },
  });
});

async function stripeRefund(sessionId: string): Promise<boolean> {
  if (!process.env.STRIPE_SECRET_KEY) return false;
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paymentIntent = session.payment_intent;
    if (!paymentIntent) return false;
    const piId =
      typeof paymentIntent === "string" ? paymentIntent : paymentIntent.id;
    await stripe.refunds.create({ payment_intent: piId });
    return true;
  } catch (err) {
    console.error("[msvee:billing] Stripe refund failed:", err);
    return false;
  }
}

export const PATCH = withApiHandler(
  "admin.billing.update",
  async (request: NextRequest) => {
    const limited = requireRateLimit(request, "billing-update", 20);
    if (limited) return limited;

    const { session, error } = await requireAdmin("billing:write");
    if (error) return error;

    const { orderId, action } = (await request.json()) as {
      orderId: string;
      action: "cancel" | "refund";
    };

    if (!orderId || !action) {
      return errorResponse("orderId and action required");
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return errorResponse("Order not found", 404);

    let newStatus: OrderStatus;
    let stripeRefunded = false;

    if (action === "cancel") {
      if (["CANCELLED", "REFUNDED"].includes(order.status)) {
        return errorResponse("Order already cancelled or refunded");
      }
      newStatus = "CANCELLED";
    } else {
      if (order.status === "REFUNDED") {
        return errorResponse("Order already refunded");
      }
      if (order.stripeId) {
        stripeRefunded = await stripeRefund(order.stripeId);
      }
      newStatus = "REFUNDED";
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: {
        customer: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    await logAdminAction({
      adminId: session!.user!.id,
      adminEmail: session!.user!.email ?? "",
      adminRole: (session!.user as { role?: string }).role ?? "",
      action: action === "refund" ? "REFUND" : "UPDATE",
      entity: "Order",
      entityId: orderId,
      metadata: {
        action,
        previousStatus: order.status,
        newStatus,
        stripeRefunded,
        orderNumber: order.orderNumber,
      },
      ipAddress: getClientIp(request),
    });

    return jsonResponse({
      order: updated,
      stripeRefunded,
    });
  }
);
