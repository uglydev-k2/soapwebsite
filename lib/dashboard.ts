import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/db";
import { subDays, startOfDay } from "date-fns";
import type { OrderStatus } from "@prisma/client";

const EMPTY_DASHBOARD = {
  kpis: {
    totalRevenue: 0,
    revenueChange: 0,
    totalOrders: 0,
    ordersChange: 0,
    totalProducts: 0,
    lowStockCount: 0,
    totalCustomers: 0,
    newCustomersToday: 0,
  },
  recentOrders: [] as Awaited<
    ReturnType<
      typeof prisma.order.findMany<{
        include: {
          customer: { select: { firstName: true; lastName: true; email: true } };
          items: true;
        };
      }>
    >
  >,
  monthlyRevenue: [] as { month: string; revenue: number }[],
  categoryBreakdown: [] as { category: string; count: number; percentage: number }[],
  pendingCount: 0,
  lowStockProducts: 0,
};

export async function getDashboardData() {
  return safeDbQuery("getDashboardData", fetchDashboardData, EMPTY_DASHBOARD);
}

async function fetchDashboardData() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const weekStart = subDays(startOfDay(now), 7);
  const todayStart = startOfDay(now);

  const [
    totalRevenue,
    lastMonthRevenue,
    totalOrders,
    weekOrders,
    products,
    lowStockProducts,
    totalCustomers,
    newCustomersToday,
    recentOrders,
    monthlyRevenue,
    categoryCounts,
    pendingCount,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { notIn: ["CANCELLED", "REFUNDED"] as OrderStatus[] } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: {
        status: { notIn: ["CANCELLED", "REFUNDED"] as OrderStatus[] },
        createdAt: { gte: lastMonthStart, lt: monthStart },
      },
      _sum: { total: true },
    }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.product.count({ where: { active: true } }),
    prisma.product.count({ where: { stock: { lt: 10 }, active: true } }),
    prisma.customer.count(),
    prisma.customer.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { firstName: true, lastName: true, email: true } },
        items: true,
      },
    }),
    getMonthlyRevenue(),
    prisma.product.groupBy({ by: ["category"], _count: true }),
    prisma.order.count({ where: { status: "PENDING" } }),
  ]);

  const monthRevenue = await prisma.order.aggregate({
    where: {
      status: { notIn: ["CANCELLED", "REFUNDED"] as OrderStatus[] },
      createdAt: { gte: monthStart },
    },
    _sum: { total: true },
  });

  const revenue = totalRevenue._sum.total || 0;
  const lastRev = lastMonthRevenue._sum.total || 1;
  const thisMonthRev = monthRevenue._sum.total || 0;
  const revenueChange = Math.round(((thisMonthRev - lastRev) / lastRev) * 100);

  return {
    kpis: {
      totalRevenue: revenue,
      revenueChange,
      totalOrders,
      ordersChange: weekOrders,
      totalProducts: products,
      lowStockCount: lowStockProducts,
      totalCustomers,
      newCustomersToday,
    },
    recentOrders,
    monthlyRevenue,
    categoryBreakdown: (() => {
      const total = categoryCounts.reduce((s, c) => s + c._count, 0) || 1;
      return categoryCounts.map((c) => ({
        category: c.category,
        count: c._count,
        percentage: Math.round((c._count / total) * 100),
      }));
    })(),
    pendingCount,
    lowStockProducts,
  };
}

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
        status: { notIn: ["CANCELLED", "REFUNDED"] as OrderStatus[] },
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
