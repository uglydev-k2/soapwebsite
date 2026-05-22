"use client";

import { useEffect, useState } from "react";
import {
  AnalyticsCharts,
  type AnalyticsData,
} from "@/components/admin/AnalyticsCharts";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AnalyticsPageClient() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?range=${range}`)
      .then((r) => r.json())
      .then((res) => {
        setData(res.data);
        setLoading(false);
      });
  }, [range]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {["7d", "30d", "90d"].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`label-caps px-4 py-2 border transition-colors ${
              range === r
                ? "border-terra text-terra bg-terra/5"
                : "border-green/20 text-muted hover:border-green"
            }`}
          >
            Last {r.replace("d", " days")}
          </button>
        ))}
      </div>
      {data && <AnalyticsCharts data={data} />}
    </div>
  );
}
