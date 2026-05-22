"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { categoryLabels, cn, formatPrice } from "@/lib/utils";

export interface AnalyticsData {
  revenueOverTime: { date: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  topProducts: { name: string; revenue: number; percent: number }[];
  customerAcquisition: { week: string; count: number }[];
  categoryBreakdown: { category: string; count: number; percent: number }[];
}

interface AnalyticsChartsProps {
  data: AnalyticsData;
  className?: string;
}

const CHART_COLORS = ["#b5552a", "#2c4a3e", "#c9a96e", "#3d6454", "#8c3f1e", "#6b5e52"];

const tooltipStyle = {
  background: "#fffef9",
  border: "1px solid rgba(44,74,62,0.15)",
  borderRadius: 0,
  fontFamily: "var(--font-sans)",
  fontSize: 13,
};

export function AnalyticsCharts({ data, className }: AnalyticsChartsProps) {
  const statusData = data.ordersByStatus.map((d) => ({
    name: d.status.charAt(0) + d.status.slice(1).toLowerCase(),
    count: d.count,
  }));

  const categoryData = data.categoryBreakdown.map((d) => ({
    name: categoryLabels[d.category as keyof typeof categoryLabels] ?? d.category,
    count: d.count,
    percent: d.percent,
  }));

  return (
    <div className={cn("grid gap-6", className)}>
      <div className="admin-card">
        <h3 className="label-caps mb-4 text-muted">Revenue Over Time</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data.revenueOverTime} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#b5552a" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#b5552a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,74,62,0.08)" vertical={false} />
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
              tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number) => [formatPrice(value), "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#b5552a"
              strokeWidth={2}
              fill="url(#revenueFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="admin-card">
          <h3 className="label-caps mb-4 text-muted">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={statusData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,74,62,0.08)" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6b5e52", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b5e52", fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#2c4a3e" maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-card">
          <h3 className="label-caps mb-4 text-muted">New Customers</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.customerAcquisition} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,74,62,0.08)" vertical={false} />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#6b5e52", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b5e52", fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#c9a96e"
                strokeWidth={2}
                dot={{ fill: "#c9a96e", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="admin-card">
          <h3 className="label-caps mb-4 text-muted">Top Products by Revenue</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={data.topProducts}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,74,62,0.08)" horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#6b5e52", fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b5e52", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number) => [formatPrice(value), "Revenue"]}
              />
              <Bar dataKey="revenue" fill="#b5552a" maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-card">
          <h3 className="label-caps mb-4 text-muted">Catalog by Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,74,62,0.08)" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6b5e52", fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b5e52", fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number, _n, props) => {
                  const pct = (props.payload as { percent?: number }).percent;
                  return [`${value}${pct != null ? ` (${pct}%)` : ""}`, "Products"];
                }}
              />
              <Bar dataKey="count" maxBarSize={48}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
              <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#6b5e52" }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
