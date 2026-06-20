"use client";

import { useCallback, useEffect, useState } from "react";
import { formatPrice, formatDate } from "@/lib/utils";
import { useToastStore } from "@/store/toastStore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { KpiCard } from "@/components/admin/KpiCard";
import { Modal } from "@/components/ui/Modal";

interface Subscription {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  status: string;
  amount: number;
  renewalDate: string;
  paymentId: string | null;
  items: number;
  purchaseType?: string;
  subscriptionCadence?: string;
  subscriptionStatus?: string;
}

interface BillingData {
  subscriptions: Subscription[];
  metrics: {
    mrr: number;
    arr: number;
    churnRate: number;
    ltv: number;
    totalRevenue: number;
    refundedCount: number;
  };
}

export default function BillingPageClient() {
  const addToast = useToastStore((s) => s.addToast);
  const [data, setData] = useState<BillingData | null>(null);
  const [confirm, setConfirm] = useState<{
    order: Subscription;
    action: "cancel" | "refund";
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    fetch("/api/admin/billing")
      .then((r) => r.json())
      .then((res) => setData(res.data));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateOrder = async () => {
    if (!confirm) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/billing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: confirm.order.id,
          action: confirm.action,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        addToast(json.error ?? "Action failed", "error");
        return;
      }
      const msg =
        confirm.action === "refund"
          ? json.data?.paymentRefunded
            ? "Order refunded via Stripe"
            : "Order marked refunded"
          : "Subscription cancelled";
      addToast(msg);
      setConfirm(null);
      load();
    } catch {
      addToast("Action failed", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-cream-2" />
        <div className="h-64 bg-cream-2" />
      </div>
    );
  }

  const canAct = (status: string) =>
    !["CANCELLED", "REFUNDED"].includes(status);

  return (
    <div>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <div className="admin-card">
        <h2 className="label-caps mb-4 text-muted">All Orders / Subscriptions</h2>
        <DataTable
          data={data.subscriptions}
          keyExtractor={(s) => s.id}
          columns={[
            {
              key: "orderNumber",
              header: "Order #",
              mobilePrimary: true,
              render: (s) => s.orderNumber,
            },
            {
              key: "customer",
              header: "Customer",
              render: (s) => (
                <div>
                  <p>{s.customer}</p>
                  <p className="text-xs text-muted">{s.email}</p>
                </div>
              ),
            },
            {
              key: "amount",
              header: "Amount",
              render: (s) => formatPrice(s.amount),
            },
            {
              key: "items",
              header: "Items",
              render: (s) => String(s.items),
            },
            {
              key: "status",
              header: "Status",
              render: (s) => (
                <div className="space-y-1">
                  <Badge status={s.status} />
                  {s.subscriptionCadence ? (
                    <p className="text-xs text-muted capitalize">
                      {s.subscriptionCadence}
                    </p>
                  ) : null}
                </div>
              ),
            },
            {
              key: "date",
              header: "Date",
              render: (s) => formatDate(s.renewalDate),
            },
            {
              key: "actions",
              header: "Actions",
              render: (s) =>
                canAct(s.status) ? (
                  <button
                    type="button"
                    onClick={() =>
                      setConfirm({ order: s, action: "cancel" })
                    }
                    className="text-xs text-muted hover:text-green"
                  >
                    Cancel subscription
                  </button>
                ) : (
                  <span className="text-xs text-muted">—</span>
                ),
            },
          ]}
        />
      </div>

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={
          "Cancel subscription?"
        }
      >
        {confirm && (
          <>
            <p className="mb-4 text-sm text-muted">
              {`Cancel subscription for ${confirm.order.orderNumber}? Future recurring charges will stop.`}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirm(null)}>
                Back
              </Button>
              <Button
                variant="danger"
                disabled={loading}
                onClick={updateOrder}
              >
                {loading ? "Processing…" : "Confirm"}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
