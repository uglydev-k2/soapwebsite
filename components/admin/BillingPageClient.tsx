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
  stripeId: string | null;
  items: number;
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
          ? json.data?.stripeRefunded
            ? "Order refunded via Stripe"
            : "Order marked refunded"
          : "Order cancelled";
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
          label="MRR"
          value={formatPrice(data.metrics.mrr)}
          changeType="positive"
          progress={75}
        />
        <KpiCard
          label="ARR"
          value={formatPrice(data.metrics.arr)}
          changeType="positive"
          progress={80}
        />
        <KpiCard
          label="Churn Rate"
          value={`${data.metrics.churnRate}%`}
          changeType={data.metrics.churnRate > 10 ? "warning" : "positive"}
          progress={data.metrics.churnRate}
        />
        <KpiCard
          label="Avg LTV"
          value={formatPrice(data.metrics.ltv)}
          changeType="neutral"
          progress={60}
        />
      </div>

      <div className="admin-card p-6">
        <h2 className="label-caps mb-4 text-muted">All Orders / Subscriptions</h2>
        <DataTable
          data={data.subscriptions}
          keyExtractor={(s) => s.id}
          columns={[
            {
              key: "orderNumber",
              header: "Order #",
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
              render: (s) => <Badge status={s.status} />,
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
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setConfirm({ order: s, action: "cancel" })
                      }
                      className="text-xs text-muted hover:text-green"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setConfirm({ order: s, action: "refund" })
                      }
                      className="text-xs text-terra hover:underline"
                    >
                      Refund
                    </button>
                  </div>
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
          confirm?.action === "refund"
            ? "Refund order?"
            : "Cancel order?"
        }
      >
        {confirm && (
          <>
            <p className="mb-4 text-sm text-muted">
              {confirm.action === "refund"
                ? `Refund ${confirm.order.orderNumber} (${formatPrice(confirm.order.amount)})?${confirm.order.stripeId ? " Stripe will be charged back if configured." : ""}`
                : `Cancel ${confirm.order.orderNumber}? This cannot be undone.`}
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
