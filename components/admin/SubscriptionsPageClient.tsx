"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { formatDate, formatDateTime, formatPrice } from "@/lib/utils";
import { useToastStore } from "@/store/toastStore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { KpiCard } from "@/components/admin/KpiCard";
import { Modal } from "@/components/ui/Modal";
import type {
  AdminSubscriptionMetrics,
  AdminSubscriptionRow,
} from "@/lib/admin-subscriptions";

type StatusFilter = "" | "ACTIVE" | "PAUSED" | "CANCELLED";

type SubscriptionsData = {
  subscriptions: AdminSubscriptionRow[];
  metrics: AdminSubscriptionMetrics;
};

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "", label: "All" },
  { id: "ACTIVE", label: "Active" },
  { id: "PAUSED", label: "Paused" },
  { id: "CANCELLED", label: "Cancelled" },
];

export default function SubscriptionsPageClient() {
  const addToast = useToastStore((s) => s.addToast);
  const [data, setData] = useState<SubscriptionsData | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [selected, setSelected] = useState<AdminSubscriptionRow | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    subscription: AdminSubscriptionRow;
    action: "cancel" | "pause" | "resume";
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    const params = statusFilter ? `?status=${statusFilter}` : "";
    fetch(`/api/admin/subscriptions${params}`)
      .then((r) => r.json())
      .then((res) => setData(res.data));
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async () => {
    if (!confirmAction) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: confirmAction.subscription.id,
          action: confirmAction.action,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        addToast(json.error ?? "Action failed", "error");
        return;
      }
      const labels = {
        cancel: "Subscription cancelled",
        pause: "Subscription paused",
        resume: "Subscription resumed",
      };
      addToast(labels[confirmAction.action]);
      setConfirmAction(null);
      if (selected?.id === confirmAction.subscription.id && confirmAction.action === "cancel") {
        setSelected(null);
      }
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

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Active Subscriptions"
          value={String(data.metrics.activeCount)}
          change="Cart-based recurring profiles"
          changeType="positive"
        />
        <KpiCard
          label="Due This Week"
          value={String(data.metrics.dueThisWeek)}
          change="Next charge within 7 days"
          changeType={data.metrics.dueThisWeek > 0 ? "warning" : "neutral"}
        />
        <KpiCard
          label="Estimated MRR"
          value={formatPrice(data.metrics.estimatedMrr)}
          change="From active subscription totals"
          changeType="positive"
        />
        <KpiCard
          label="Paused"
          value={String(data.metrics.pausedCount)}
          change={`${data.metrics.cancelledCount} cancelled`}
          changeType="neutral"
        />
      </div>

      <div className="admin-card">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl text-green">Subscriptions</h2>
            <p className="mt-1 text-sm text-muted">
              Recurring orders based on each customer&apos;s checkout cart.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.id || "all"}
                type="button"
                onClick={() => setStatusFilter(filter.id)}
                className={`px-4 py-2 text-xs label-caps border ${
                  statusFilter === filter.id
                    ? "border-terra bg-terra text-white"
                    : "border-green/15 text-muted"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <DataTable
          data={data.subscriptions}
          keyExtractor={(s) => s.id}
          onRowClick={setSelected}
          columns={[
            {
              key: "customer",
              header: "Customer",
              mobilePrimary: true,
              render: (s) => (
                <div>
                  <p className="font-medium text-green">{s.customerName}</p>
                  <p className="text-xs text-muted">{s.customerEmail}</p>
                </div>
              ),
            },
            {
              key: "order",
              header: "Source Order",
              render: (s) =>
                s.sourceOrderId ? (
                  <Link
                    href={`/admin/orders/${s.sourceOrderId}`}
                    className="text-terra hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {s.sourceOrderNumber}
                  </Link>
                ) : (
                  s.sourceOrderNumber
                ),
            },
            {
              key: "cadence",
              header: "Cadence",
              render: (s) => s.cadenceLabel,
            },
            {
              key: "items",
              header: "Cart",
              render: (s) => (
                <div>
                  <p className="text-sm">{s.itemSummary}</p>
                  <p className="text-xs text-muted">{s.itemCount} item{s.itemCount === 1 ? "" : "s"}</p>
                </div>
              ),
            },
            {
              key: "total",
              header: "Recurring Total",
              render: (s) => formatPrice(s.total),
            },
            {
              key: "nextCharge",
              header: "Next Charge",
              render: (s) => formatDate(s.nextChargeAt),
            },
            {
              key: "status",
              header: "Status",
              render: (s) => <Badge status={s.status} variant="status" />,
            },
          ]}
        />
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Subscription Details"
      >
        {selected && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="label-caps text-muted">Customer</p>
                <p className="mt-1 text-green">{selected.customerName}</p>
                <p className="text-sm text-muted">{selected.customerEmail}</p>
              </div>
              <div>
                <p className="label-caps text-muted">Status</p>
                <div className="mt-1">
                  <Badge status={selected.status} variant="status" />
                </div>
              </div>
              <div>
                <p className="label-caps text-muted">Cadence</p>
                <p className="mt-1">{selected.cadenceLabel}</p>
              </div>
              <div>
                <p className="label-caps text-muted">Next Charge</p>
                <p className="mt-1">{formatDateTime(selected.nextChargeAt)}</p>
              </div>
            </div>

            <div>
              <p className="label-caps mb-3 text-muted">Recurring Cart</p>
              <ul className="space-y-2 border border-green/10 bg-cream/40 p-4">
                {selected.items.map((item, index) => (
                  <li
                    key={`${item.productId}-${index}`}
                    className="flex items-start justify-between gap-4 text-sm"
                  >
                    <div>
                      <p className="text-green">
                        {item.name ?? "Product"}
                        {item.scentLabel ? ` (${item.scentLabel})` : ""}
                      </p>
                      <p className="text-xs text-muted">Qty {item.quantity}</p>
                    </div>
                    <p>{formatPrice(item.price * item.quantity)}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatPrice(selected.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span>{formatPrice(selected.shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Tax</span>
                <span>{formatPrice(selected.tax)}</span>
              </div>
              <div className="flex justify-between font-medium text-green">
                <span>Total per cycle</span>
                <span>{formatPrice(selected.total)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {selected.status === "ACTIVE" && (
                <Button
                  variant="outline"
                  onClick={() =>
                    setConfirmAction({ subscription: selected, action: "pause" })
                  }
                >
                  Pause
                </Button>
              )}
              {selected.status === "PAUSED" && (
                <Button
                  variant="outline"
                  onClick={() =>
                    setConfirmAction({ subscription: selected, action: "resume" })
                  }
                >
                  Resume
                </Button>
              )}
              {selected.status !== "CANCELLED" && (
                <Button
                  variant="danger"
                  onClick={() =>
                    setConfirmAction({ subscription: selected, action: "cancel" })
                  }
                >
                  Cancel Subscription
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={
          confirmAction?.action === "cancel"
            ? "Cancel subscription?"
            : confirmAction?.action === "pause"
              ? "Pause subscription?"
              : "Resume subscription?"
        }
      >
        {confirmAction && (
          <>
            <p className="mb-4 text-sm text-muted">
              {confirmAction.action === "cancel"
                ? `Stop future charges for ${confirmAction.subscription.sourceOrderNumber}.`
                : confirmAction.action === "pause"
                  ? `Pause recurring billing for ${confirmAction.subscription.customerName}.`
                  : `Resume recurring billing for ${confirmAction.subscription.customerName}.`}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmAction(null)}>
                Back
              </Button>
              <Button
                variant={confirmAction.action === "cancel" ? "danger" : "primary"}
                disabled={loading}
                onClick={runAction}
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
