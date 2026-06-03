import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, jsonResponse } from "@/lib/api-helpers";
import { withApiHandler } from "@/lib/api-handler";
import { isDatabaseConfigured } from "@/lib/env";
import { getProductSkuMetrics } from "@/lib/admin-analytics";

export const GET = withApiHandler("analytics", async (request: NextRequest) => {
  const { error } = await requireAdmin();
  if (error) return error;

  if (!isDatabaseConfigured()) {
    return jsonResponse({
      revenueOverTime: [],
      ordersByStatus: [],
      topProducts: [],
      customerAcquisition: [],
      categoryBreakdown: [],
      monthlyRevenue: [],
      totalRevenue: 0,
      totalOrders: 0,
      productSkus: [],
    });
  }

  const { searchParams } = request.nextUrl;
  const range = searchParams.get("range") || "30d";
  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: since }, status: { notIn: ["CANCELLED", "REFUNDED"] } },
    include: { items: { include: { product: true } }, customer: true },
  });

  const revenueByDay: Record<string, number> = {};
  const statusCounts: Record<string, number> = {};
  const productRevenue: Record<string, { name: string; revenue: number }> = {};
  const customersByWeek: Record<string, number> = {};

  for (const order of orders) {
    const dayKey = order.createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    revenueByDay[dayKey] = (revenueByDay[dayKey] || 0) + order.total;
    statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;

    for (const item of order.items) {
      const key = item.productId;
      if (!productRevenue[key]) {
        productRevenue[key] = { name: item.product.name, revenue: 0 };
      }
      productRevenue[key].revenue += item.price * item.quantity;
    }
  }

  const newCustomers = await prisma.customer.findMany({
    where: { createdAt: { gte: since } },
  });
  for (const c of newCustomers) {
    const weekKey = c.createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    customersByWeek[weekKey] = (customersByWeek[weekKey] || 0) + 1;
  }

  const products = await prisma.product.findMany({ select: { category: true } });
  const categoryCounts: Record<string, number> = {};
  for (const p of products) {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  }

  const revenueOverTime = Object.entries(revenueByDay).map(([date, revenue]) => ({
    date,
    revenue,
  }));

  const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
  }));

  const totalOrderRevenue = orders.reduce((s, o) => s + o.total, 0);
  const topProducts = Object.values(productRevenue)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
    .map((p) => ({
      name: p.name,
      revenue: p.revenue,
      percent: totalOrderRevenue
        ? Math.round((p.revenue / totalOrderRevenue) * 100)
        : 0,
    }));

  const customerAcquisition = Object.entries(customersByWeek).map(([week, count]) => ({
    week,
    count,
  }));

  const categoryBreakdown = Object.entries(categoryCounts).map(([category, count]) => ({
    category,
    count,
    percent: Math.round((count / products.length) * 100) || 0,
  }));

  const monthlyRevenue = await getMonthlyRevenue();
  const productSkus = await getProductSkuMetrics(since);

  return jsonResponse({
    revenueOverTime,
    ordersByStatus,
    topProducts,
    customerAcquisition,
    categoryBreakdown,
    monthlyRevenue,
    totalRevenue: totalOrderRevenue,
    totalOrders: orders.length,
    productSkus,
  });
});

async function getMonthlyRevenue() {
  const months = [];
  for (let i = 6; i >= 0; i--) {
    const start = new Date();
    start.setMonth(start.getMonth() - i, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const result = await prisma.order.aggregate({
      where: {
        createdAt: { gte: start, lt: end },
        status: { notIn: ["CANCELLED", "REFUNDED"] },
      },
      _sum: { total: true },
    });

    months.push({
      month: start.toLocaleString("en-US", { month: "short" }),
      revenue: result._sum.total || 0,
    });
  }
  return months;
}
