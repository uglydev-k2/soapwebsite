import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/db";
import { startOfDay, subDays } from "date-fns";

export type VisitorStats = {
  visitorsToday: number;
  visitorsYesterday: number;
  visitors7d: number;
  pageViewsToday: number;
  changeVsYesterday: number;
  sparkline: number[];
};

const EMPTY: VisitorStats = {
  visitorsToday: 0,
  visitorsYesterday: 0,
  visitors7d: 0,
  pageViewsToday: 0,
  changeVsYesterday: 0,
  sparkline: [],
};

async function distinctVisitors(gte: Date, lt?: Date): Promise<number> {
  const groups = await prisma.pageView.groupBy({
    by: ["visitorId"],
    where: { createdAt: lt ? { gte, lt } : { gte } },
  });
  return groups.length;
}

export async function getVisitorStats(): Promise<VisitorStats> {
  return safeDbQuery("getVisitorStats", fetchVisitorStats, EMPTY);
}

async function fetchVisitorStats(): Promise<VisitorStats> {
  const todayStart = startOfDay(new Date());
  const yesterdayStart = subDays(todayStart, 1);
  const weekStart = subDays(todayStart, 6);

  const [visitorsToday, visitorsYesterday, visitors7d, pageViewsToday] =
    await Promise.all([
      distinctVisitors(todayStart),
      distinctVisitors(yesterdayStart, todayStart),
      distinctVisitors(weekStart),
      prisma.pageView.count({ where: { createdAt: { gte: todayStart } } }),
    ]);

  const sparkline: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = subDays(todayStart, i);
    const dayEnd = subDays(todayStart, i - 1);
    sparkline.push(await distinctVisitors(dayStart, dayEnd));
  }

  const changeVsYesterday = visitorsYesterday
    ? Math.round(
        ((visitorsToday - visitorsYesterday) / visitorsYesterday) * 100
      )
    : 0;

  return {
    visitorsToday,
    visitorsYesterday,
    visitors7d,
    pageViewsToday,
    changeVsYesterday,
    sparkline,
  };
}

export type TrafficAnalytics = {
  overTime: { date: string; views: number; visitors: number }[];
  topPages: { path: string; views: number }[];
  topReferrers: { referrer: string; count: number }[];
  totalViews: number;
  uniqueVisitors: number;
};

const EMPTY_TRAFFIC: TrafficAnalytics = {
  overTime: [],
  topPages: [],
  topReferrers: [],
  totalViews: 0,
  uniqueVisitors: 0,
};

function referrerHost(raw: string): string | null {
  try {
    const host = new URL(raw).hostname.replace(/^www\./, "");
    if (!host) return null;
    // Ignore internal navigation (our own site) — that's not a real referrer.
    if (host.includes("mvlusciouslather")) return null;
    return host;
  } catch {
    return null;
  }
}

export async function getTrafficAnalytics(
  since: Date
): Promise<TrafficAnalytics> {
  return safeDbQuery(
    "getTrafficAnalytics",
    () => fetchTrafficAnalytics(since),
    EMPTY_TRAFFIC
  );
}

async function fetchTrafficAnalytics(since: Date): Promise<TrafficAnalytics> {
  const [daily, pageGroups, referrerRows, totalViews, visitorGroups] =
    await Promise.all([
      prisma.$queryRaw<{ day: Date; views: bigint; visitors: bigint }[]>`
        SELECT date_trunc('day', "createdAt") AS day,
               count(*) AS views,
               count(DISTINCT "visitorId") AS visitors
        FROM "public"."PageView"
        WHERE "createdAt" >= ${since}
        GROUP BY 1
        ORDER BY 1 ASC`,
      prisma.pageView.groupBy({
        by: ["path"],
        where: { createdAt: { gte: since } },
        _count: { path: true },
        orderBy: { _count: { path: "desc" } },
        take: 10,
      }),
      prisma.pageView.findMany({
        where: { createdAt: { gte: since }, referrer: { not: null } },
        select: { referrer: true },
      }),
      prisma.pageView.count({ where: { createdAt: { gte: since } } }),
      prisma.pageView.groupBy({
        by: ["visitorId"],
        where: { createdAt: { gte: since } },
      }),
    ]);

  const overTime = daily.map((row) => ({
    date: new Date(row.day).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    views: Number(row.views),
    visitors: Number(row.visitors),
  }));

  const topPages = pageGroups.map((g) => ({
    path: g.path,
    views: g._count.path,
  }));

  const referrerCounts: Record<string, number> = {};
  for (const row of referrerRows) {
    const host = row.referrer ? referrerHost(row.referrer) : null;
    if (!host) continue;
    referrerCounts[host] = (referrerCounts[host] || 0) + 1;
  }
  const topReferrers = Object.entries(referrerCounts)
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    overTime,
    topPages,
    topReferrers,
    totalViews,
    uniqueVisitors: visitorGroups.length,
  };
}
