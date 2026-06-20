"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { KpiCard } from "@/components/admin/KpiCard";

interface BillingData {
  metrics: {
    mrr: number;
    arr: number;
    churnRate: number;
    ltv: number;
    totalRevenue: number;
    refundedCount: number;
    activeSubscriptions: number;
  };
}

export default function BillingPageClient() {
  const [data, setData] = useState<BillingData | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/billing")
      .then((r) => r.json())
      .then((res) => setData(res.data));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!data) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-cream-2" />
        <div className="h-64 bg-cream-2" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Monthly Revenue"
          value={formatPrice(data.metrics.mrr)}
          change="Current calendar month"
          changeType="positive"
        />
        <KpiCard
          label="Annual Run Rate"
          value={formatPrice(data.metrics.arr)}
          change="Projected from monthly"
          changeType="positive"
        />
        <KpiCard
          label="Refund Rate"
          value={`${data.metrics.churnRate}%`}
          change="Cancelled / paid orders"
          changeType={data.metrics.churnRate > 10 ? "warning" : "positive"}
        />
        <KpiCard
          label="Avg Order Value"
          value={formatPrice(data.metrics.ltv)}
          change="Per completed order"
          changeType="neutral"
        />
      </div>

      <div className="admin-card flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-green">Recurring Subscriptions</h2>
          <p className="mt-1 text-sm text-muted">
            {data.metrics.activeSubscriptions} active subscription
            {data.metrics.activeSubscriptions === 1 ? "" : "s"} — manage recurring
            billing profiles. Initial subscription checkouts still appear in{" "}
            <Link href="/admin/orders?type=subscription" className="text-terra hover:underline">
              Orders
            </Link>
            .
          </p>
        </div>
        <Link
          href="/admin/subscriptions"
          className="inline-flex min-h-11 items-center border border-green/20 bg-transparent px-6 py-3 text-sm text-text transition-colors hover:border-green sm:min-h-0"
        >
          View Subscriptions
        </Link>
      </div>
    </div>
  );
}
