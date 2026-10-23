"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrafficAnalytics } from "@/lib/visitors";

const tooltipStyle = {
  background: "#fffef9",
  border: "1px solid rgba(44,74,62,0.15)",
  borderRadius: 0,
  fontFamily: "var(--font-sans)",
  fontSize: 13,
};

export function TrafficCharts({ traffic }: { traffic: TrafficAnalytics }) {
  const hasData = traffic.totalViews > 0;

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
        <div className="admin-card">
          <p className="label-caps text-muted">Unique Visitors</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-green">
            {traffic.uniqueVisitors.toLocaleString("en-US")}
          </p>
        </div>
        <div className="admin-card">
          <p className="label-caps text-muted">Page Views</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-green">
            {traffic.totalViews.toLocaleString("en-US")}
          </p>
        </div>
      </div>

      <div className="admin-card">
        <h3 className="label-caps mb-4 text-muted">Traffic Over Time</h3>
        {hasData ? (
          <div className="h-[220px] w-full sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={traffic.overTime}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2c4a3e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2c4a3e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="visitorsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c9a96e" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#c9a96e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(44,74,62,0.08)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b5e52", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b5e52", fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  iconType="square"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, color: "#6b5e52" }}
                />
                <Area
                  type="monotone"
                  name="Page views"
                  dataKey="views"
                  stroke="#2c4a3e"
                  strokeWidth={2}
                  fill="url(#viewsFill)"
                />
                <Area
                  type="monotone"
                  name="Unique visitors"
                  dataKey="visitors"
                  stroke="#c9a96e"
                  strokeWidth={2}
                  fill="url(#visitorsFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-muted">
            No visitor data yet for this period. Data appears as customers browse
            the storefront.
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="admin-card">
          <h3 className="label-caps mb-4 text-muted">Top Pages</h3>
          {traffic.topPages.length > 0 ? (
            <ul className="divide-y divide-green/10">
              {traffic.topPages.map((p) => (
                <li
                  key={p.path}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                >
                  <span className="truncate text-green" title={p.path}>
                    {p.path}
                  </span>
                  <span className="shrink-0 font-medium text-muted">
                    {p.views.toLocaleString("en-US")}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted">No data yet.</p>
          )}
        </div>

        <div className="admin-card">
          <h3 className="label-caps mb-4 text-muted">Top Referrers</h3>
          {traffic.topReferrers.length > 0 ? (
            <ul className="divide-y divide-green/10">
              {traffic.topReferrers.map((r) => (
                <li
                  key={r.referrer}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                >
                  <span className="truncate text-green" title={r.referrer}>
                    {r.referrer}
                  </span>
                  <span className="shrink-0 font-medium text-muted">
                    {r.count.toLocaleString("en-US")}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted">
              No external referrers yet — most visits are direct.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
