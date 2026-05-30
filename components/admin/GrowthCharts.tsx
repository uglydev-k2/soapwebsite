"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice } from "@/lib/utils";

const tooltipStyle = {
  background: "#fffef9",
  border: "1px solid rgba(44,74,62,0.15)",
  borderRadius: 0,
  fontSize: 13,
};

export function CustomerGrowthChart({
  data,
}: {
  data: { month: string; count: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,74,62,0.08)" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B5E52" }} />
        <YAxis tick={{ fontSize: 12, fill: "#6B5E52" }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#2C4A3E"
          strokeWidth={2}
          dot={{ fill: "#B5552A", r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function RevenueBarChart({
  data,
}: {
  data: { month: string; revenue: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,74,62,0.08)" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B5E52" }} />
        <YAxis
          tick={{ fontSize: 12, fill: "#6B5E52" }}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: number) => [formatPrice(value), "Revenue"]}
        />
        <Bar dataKey="revenue" fill="#B5552A" radius={[0, 0, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
