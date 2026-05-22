"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice } from "@/lib/utils";

export interface RevenueMonth {
  month: string;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueMonth[];
  className?: string;
}

export function RevenueChart({ data, className }: RevenueChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,74,62,0.08)" vertical={false} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b5e52", fontSize: 12, fontFamily: "var(--font-sans)" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b5e52", fontSize: 11, fontFamily: "var(--font-sans)" }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            cursor={{ fill: "rgba(181,85,42,0.08)" }}
            contentStyle={{
              background: "#fffef9",
              border: "1px solid rgba(44,74,62,0.15)",
              borderRadius: 0,
              fontFamily: "var(--font-sans)",
              fontSize: 13,
            }}
            formatter={(value: number) => [formatPrice(value), "Revenue"]}
          />
          <Bar dataKey="revenue" fill="#b5552a" radius={[2, 2, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
