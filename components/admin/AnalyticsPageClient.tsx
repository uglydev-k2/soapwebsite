"use client";

import { useEffect, useState } from "react";
import {
  AnalyticsCharts,
  type AnalyticsData,
} from "@/components/admin/AnalyticsCharts";
import { ProductSkuTable } from "@/components/admin/ProductSkuTable";
import type { ProductSkuMetric } from "@/lib/admin-analytics";
import { Skeleton } from "@/components/ui/Skeleton";

type AnalyticsPayload = AnalyticsData & {
  productSkus?: ProductSkuMetric[];
  totalRevenue?: number;
  totalOrders?: number;
};

export default function AnalyticsPageClient() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<AnalyticsPayload | null>(null);
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
      <div className="admin-tabs-scroll mb-6">
        {["7d", "30d", "90d"].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`label-caps shrink-0 px-4 py-2.5 border transition-colors ${
              range === r
                ? "border-terra text-terra bg-terra/5"
                : "border-green/20 text-muted hover:border-green"
            }`}
          >
            Last {r.replace("d", " days")}
          </button>
        ))}
      </div>
      {data && (
        <>
          {(data.totalRevenue != null || data.totalOrders != null) && (
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {data.totalRevenue != null && (
                <div className="admin-card p-4">
                  <p className="label-caps text-muted">Period Revenue</p>
                  <p className="mt-2 font-serif text-3xl font-semibold text-green">
                    {data.totalRevenue.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </p>
                </div>
              )}
              {data.totalOrders != null && (
                <div className="admin-card p-4">
                  <p className="label-caps text-muted">Period Orders</p>
                  <p className="mt-2 font-serif text-3xl font-semibold text-green">
                    {data.totalOrders}
                  </p>
                </div>
              )}
            </div>
          )}
          <AnalyticsCharts data={data} />
          {data.productSkus && data.productSkus.length > 0 && (
            <ProductSkuTable skus={data.productSkus} className="mt-6" />
          )}
        </>
      )}
    </div>
  );
}
