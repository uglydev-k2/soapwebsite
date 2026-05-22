"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { categoryLabels, cn } from "@/lib/utils";

export interface CategorySlice {
  category: string;
  count: number;
  percentage: number;
}

interface CategoryDonutProps {
  data: CategorySlice[];
  className?: string;
}

const CHART_COLORS = [
  "#b5552a",
  "#2c4a3e",
  "#c9a96e",
  "#3d6454",
  "#8c3f1e",
  "#6b5e52",
];

export function CategoryDonut({ data, className }: CategoryDonutProps) {
  const chartData = data.map((d) => ({
    name: categoryLabels[d.category as keyof typeof categoryLabels] ?? d.category,
    value: d.count,
    percentage: d.percentage,
    category: d.category,
  }));

  if (chartData.length === 0) {
    return (
      <div className={cn("flex h-[280px] items-center justify-center", className)}>
        <p className="font-serif text-lg text-green/40">No category data</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#fffef9",
              border: "1px solid rgba(44,74,62,0.15)",
              borderRadius: 0,
              fontFamily: "var(--font-sans)",
              fontSize: 13,
            }}
            formatter={(value: number, _name, props) => {
              const pct = (props.payload as { percentage?: number }).percentage;
              return [`${value} products${pct != null ? ` (${pct}%)` : ""}`, "Count"];
            }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              color: "#6b5e52",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
