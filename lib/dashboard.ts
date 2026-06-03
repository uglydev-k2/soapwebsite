import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/db";
import { subDays, startOfDay } from "date-fns";
import { getRecentActivity } from "@/lib/audit";

const EMPTY = {
  kpis: {
    totalCustomers: 0,
    activeCustomers: 0,
    totalRevenue: 0,
    newSignupsToday: 0,
    totalOrders: 0,
    mrr: 0,
    totalProducts: 0,
    lowStockCount: 0,
    revenueChange: 0,
    ordersChange: 0,
  },
  customerGrowth: [] as { month: string; count: number }[],
  revenueByMonth: [] as { month: string; revenue: number }[],
  customersByStatus: [] as { status: string; count: number }[],
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
  categoryBreakdown: [] as { category: string; count: number; percentage: number }[],
  recentActivity: [] as Awaited<ReturnType<typeof getRecentActivity>>,
  pendingCount: 0,
  orderSparkline: [] as number[],
  revenueSparkline: [] as number[],
};

export async function getDashboardData() {
  return safeDbQuery("getDashboardData", fetchDashboardData, EMPTY);
}

async function fetchDashboardData() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const weekStart = subDays(startOfDay(now), 7);
  const todayStart = startOfDay(now);
  const thirtyDaysAgo = subDays(todayStart, 30);

  const [
    totalRevenue,
    lastMonthRevenue,
    totalOrders,
    weekOrders,
    products,
    lowStockProducts,
    totalCustomers,
    activeCustomers,
    newCustomersToday,
    recentOrders,
    categoryCounts,
    pendingCount,
    customerGrowth,
    revenueByMonth,
    activeStatusCount,
    bannedStatusCount,
    recentActivity,
    orderSparkline,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: {
        status: { notIn: ["CANCELLED", "REFUNDED"] },
        createdAt: { gte: lastMonthStart, lt: monthStart },
      },
      _sum: { total: true },
    }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.product.count({ where: { active: true } }),
    prisma.product.count({ where: { stock: { lt: 10 }, active: true } }),
    prisma.customer.count(),
    prisma.customer.count({
      where: {
        OR: [
          { lastActiveAt: { gte: thirtyDaysAgo } },
          {
            lastActiveAt: null,
            createdAt: { gte: thirtyDaysAgo },
          },
        ],
      },
    }),
    prisma.customer.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { firstName: true, lastName: true, email: true } },
        items: true,
      },
    }),
    prisma.product.groupBy({ by: ["category"], _count: true }),
    prisma.order.count({ where: { status: "PENDING" } }),
    getCustomerGrowth(),
    getMonthlyRevenue(),
    prisma.customer.count({ where: { status: "ACTIVE" } }),
    prisma.customer.count({ where: { status: "BANNED" } }),
    getRecentActivity(10),
    getOrderSparkline(),
  ]);

  const monthRevenue = await prisma.order.aggregate({
    where: {
      status: { notIn: ["CANCELLED", "REFUNDED"] },
      createdAt: { gte: monthStart },
    },
    _sum: { total: true },
  });

  const revenue = totalRevenue._sum.total || 0;
  const lastRev = lastMonthRevenue._sum.total || 1;
  const thisMonthRev = monthRevenue._sum.total || 0;
  const revenueChange = Math.round(((thisMonthRev - lastRev) / lastRev) * 100);
  const mrr = thisMonthRev;

  const totalCat = categoryCounts.reduce((s, c) => s + c._count, 0) || 1;

  return {
    kpis: {
      totalCustomers,
      activeCustomers,
      totalRevenue: revenue,
      newSignupsToday: newCustomersToday,
      totalOrders,
      mrr,
      totalProducts: products,
      lowStockCount: lowStockProducts,
      revenueChange,
      ordersChange: weekOrders,
    },
    customerGrowth,
    revenueByMonth,
    customersByStatus: [
      { status: "Active", count: activeStatusCount },
      { status: "Banned", count: bannedStatusCount },
      {
        status: "Inactive",
        count: totalCustomers - activeStatusCount - bannedStatusCount,
      },
    ].filter((s) => s.count > 0),
    recentOrders,
    categoryBreakdown: categoryCounts.map((c) => ({
      category: c.category,
      count: c._count,
      percentage: Math.round((c._count / totalCat) * 100),
    })),
    recentActivity,
    pendingCount,
    orderSparkline,
    revenueSparkline: revenueByMonth.slice(-6).map((m) => m.revenue),
  };
}

async function getOrderSparkline() {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date();
    start.setMonth(start.getMonth() - i, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    const count = await prisma.order.count({
      where: { createdAt: { gte: start, lt: end } },
    });
    months.push(count);
  }
  return months;
}

async function getCustomerGrowth() {
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const start = new Date();
    start.setMonth(start.getMonth() - i, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    const count = await prisma.customer.count({
      where: { createdAt: { gte: start, lt: end } },
    });
    months.push({
      month: start.toLocaleString("en-US", { month: "short" }),
      count,
    });
  }
  return months;
}

async function getMonthlyRevenue() {
  const months = [];
  for (let i = 11; i >= 0; i--) {
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
