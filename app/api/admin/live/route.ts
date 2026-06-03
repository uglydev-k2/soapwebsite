import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, jsonResponse } from "@/lib/api-helpers";
import { getAdminOverview } from "@/lib/admin-overview";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin("dashboard:read");
  if (error) return error;

  const sinceParam = request.nextUrl.searchParams.get("since");
  const since = sinceParam ? new Date(sinceParam) : null;

  const [pendingOrders, overview] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    getAdminOverview(),
  ]);

  let newOrders = 0;
  if (since && !Number.isNaN(since.getTime())) {
    newOrders = await prisma.order.count({
      where: {
        createdAt: { gt: since },
        status: { in: ["PENDING", "PROCESSING"] },
      },
    });
  }

  const latestOrder = await prisma.order.findFirst({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      createdAt: true,
    },
  });

  return jsonResponse({
    pendingOrders,
    newOrdersSince: newOrders,
    lowStockCount: overview.lowStockCount,
    flaggedProducts: overview.flaggedProducts,
    alerts: overview.alerts,
    latestOrder,
    serverTime: new Date().toISOString(),
  });
}
