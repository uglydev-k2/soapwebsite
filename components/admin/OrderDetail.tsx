"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Mail, PackageCheck, Printer } from "lucide-react";
import type { Customer, Order, OrderItem, OrderStatus, Product } from "@prisma/client";
import {
  cn,
  formatDateTime,
  formatPrice,
  getCategoryGradient,
  statusColors,
} from "@/lib/utils";
import { useToastStore } from "@/store/toastStore";
import { parseOrderNotes } from "@/lib/order-notes";
import { getCadenceLabel } from "@/lib/subscriptions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export type OrderDetailData = Order & {
  customer: Customer;
  items: (OrderItem & { product: Product })[];
};

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const TIMELINE_STEPS = [
  { key: "placed", label: "Order Placed" },
  { key: "payment", label: "Payment Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
] as const;

function getTimelineIndex(status: OrderStatus, hasStripe: boolean): number {
  if (status === "CANCELLED" || status === "REFUNDED") return 0;
  if (status === "DELIVERED") return 4;
  if (status === "SHIPPED") return 3;
  if (status === "PROCESSING") return 2;
  if (hasStripe || status !== "PENDING") return 1;
  return 0;
}

interface OrderDetailProps {
  order: OrderDetailData;
  onUpdate?: (order: OrderDetailData) => void;
  className?: string;
}

export function OrderDetail({ order: initialOrder, onUpdate, className }: OrderDetailProps) {
  const addToast = useToastStore((s) => s.addToast);
  const orderMeta = parseOrderNotes(initialOrder.notes);
  const [order, setOrder] = useState(initialOrder);
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [notes, setNotes] = useState(orderMeta.internalNotes ?? "");
  const [trackingNumber, setTrackingNumber] = useState(orderMeta.trackingNumber ?? "");
  const [updating, setUpdating] = useState(false);
  const [emailSending, setEmailSending] = useState<"tracking" | "delivered" | null>(
    null
  );

  const timelineIndex = getTimelineIndex(order.status, !!order.paymentId);

  const patchOrder = useCallback(
    async (payload: {
      status?: OrderStatus;
      notes?: string | null;
      trackingInfo?: string;
    }) => {
      setUpdating(true);
      try {
        const res = await fetch(`/api/orders/${order.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) {
          addToast(json.error ?? "Failed to update order", "error");
          return null;
        }
        const updated = json.data as OrderDetailData;
        setOrder(updated);
        onUpdate?.(updated);
        return updated;
      } catch {
        addToast("Failed to update order", "error");
        return null;
      } finally {
        setUpdating(false);
      }
    },
    [order.id, addToast, onUpdate]
  );

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setStatus(newStatus);
    const updated = await patchOrder({
      status: newStatus,
      notes: notes || null,
      trackingInfo: trackingNumber.trim() || undefined,
    });
    if (updated) {
      addToast(`Order status updated to ${newStatus.toLowerCase()}`);
    } else {
      setStatus(order.status);
    }
  };

  const handleNotesBlur = async () => {
    const savedNotes = parseOrderNotes(order.notes).internalNotes ?? "";
    if (notes === savedNotes) return;
    await patchOrder({ status: order.status, notes: notes || null });
    addToast("Notes saved");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendTracking = async () => {
    setEmailSending("tracking");
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send-tracking",
          trackingInfo: trackingNumber.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        addToast(json.error ?? "Failed to send email", "error");
        return;
      }
      addToast("Tracking email sent");
    } catch {
      addToast("Failed to send tracking email", "error");
    } finally {
      setEmailSending(null);
    }
  };

  const handleSendDelivered = async () => {
    setEmailSending("delivered");
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-delivered" }),
      });
      const json = await res.json();
      if (!res.ok) {
        addToast(json.error ?? "Failed to send email", "error");
        return;
      }
      addToast("Delivered email sent");
    } catch {
      addToast("Failed to send delivered email", "error");
    } finally {
      setEmailSending(null);
    }
  };

  return (
    <div className={cn("space-y-8 sm:space-y-6 print:space-y-4", className)}>
      <div className="admin-card flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-4 print:border-0">
        <div>
          <p className="label-caps text-muted">Order</p>
          <h2 className="font-serif text-3xl font-semibold text-green">
            {order.orderNumber}
          </h2>
          <p className="mt-1 text-sm text-muted">{formatDateTime(order.createdAt)}</p>
          <Badge
            variant="status"
            className={cn("mt-3 capitalize", statusColors[order.status])}
          >
            {order.status.toLowerCase()}
          </Badge>
          {orderMeta.purchaseType === "subscription" && (
            <Badge variant="default" className="mt-3 ml-2">
              Subscription
              {orderMeta.subscriptionCadence
                ? ` · ${getCadenceLabel(orderMeta.subscriptionCadence)}`
                : ""}
              {orderMeta.subscriptionStatus === "pending_setup" ? " · setup pending" : ""}
            </Badge>
          )}
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end print:hidden">
          <label className="label-caps text-muted">Update Status</label>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
            disabled={updating}
            className="admin-input w-full sm:min-w-[180px]"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="admin-card lg:col-span-1">
          <h3 className="label-caps mb-4 text-muted">Customer</h3>
          <p className="font-serif text-xl text-green">
            {order.customer.firstName} {order.customer.lastName}
          </p>
          <p className="mt-2 text-sm text-muted">{order.customer.email}</p>
          {order.customer.phone && (
            <p className="text-sm text-muted">{order.customer.phone}</p>
          )}
          <Link
            href={`/admin/customers?highlight=${order.customer.id}`}
            className="mt-4 inline-block text-xs text-terra hover:underline print:hidden"
          >
            View customer profile →
          </Link>
        </div>

        <div className="admin-card lg:col-span-2">
          <h3 className="label-caps mb-4 text-muted">Order Items</h3>

          <ul className="flex flex-col gap-3 lg:hidden">
            {order.items.map((item) => (
              <li key={item.id} className="admin-mobile-card">
                <div className="flex gap-4">
                  <div
                    className={cn(
                      "relative h-16 w-16 shrink-0 bg-gradient-to-br",
                      getCategoryGradient(item.product.category)
                    )}
                  >
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-lg opacity-40">
                        🧴
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-green">{item.product.name}</p>
                    <p className="mt-2 text-sm text-muted">
                      Qty {item.quantity} · {formatPrice(item.price)} each
                    </p>
                    <p className="mt-1 font-medium text-green">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green/10">
                  <th className="pb-2 text-left label-caps text-muted">Product</th>
                  <th className="pb-2 text-right label-caps text-muted">Qty</th>
                  <th className="pb-2 text-right label-caps text-muted">Unit</th>
                  <th className="pb-2 text-right label-caps text-muted">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-green/5">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "relative h-10 w-10 shrink-0 bg-gradient-to-br",
                            getCategoryGradient(item.product.category)
                          )}
                        >
                          {item.product.images[0] ? (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <span className="flex h-full items-center justify-center text-sm opacity-40">
                              🧴
                            </span>
                          )}
                        </div>
                        <span className="font-medium text-green">
                          {item.product.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-right text-muted">{item.quantity}</td>
                    <td className="py-3 text-right">{formatPrice(item.price)}</td>
                    <td className="py-3 text-right font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <dl className="mt-6 space-y-3 border-t border-green/10 pt-5 text-sm sm:space-y-2 sm:pt-4">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd>{formatPrice(order.shipping)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Tax</dt>
              <dd>{formatPrice(order.tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-green/10 pt-2 text-base font-medium">
              <dt>Total</dt>
              <dd className="font-serif text-xl text-green">
                {formatPrice(order.total)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="admin-card">
        <h3 className="label-caps mb-6 text-muted">Order Timeline</h3>
        <ol className="flex flex-col gap-0 sm:flex-row sm:items-start sm:justify-between">
          {TIMELINE_STEPS.map((step, i) => {
            const complete = i <= timelineIndex;
            const current = i === timelineIndex;
            return (
              <li
                key={step.key}
                className="relative flex flex-1 flex-col items-start pb-6 last:pb-0 sm:items-center sm:pb-0"
              >
                {i < TIMELINE_STEPS.length - 1 && (
                  <span
                    className={cn(
                      "absolute left-1/2 top-4 hidden h-0.5 w-full sm:block",
                      complete ? "bg-terra" : "bg-green/15"
                    )}
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex h-10 w-10 items-center justify-center border-2 text-sm font-medium sm:h-8 sm:w-8 sm:text-xs",
                    complete
                      ? "border-terra bg-terra text-white"
                      : "border-green/20 bg-white text-muted"
                  )}
                >
                  {complete ? "✓" : i + 1}
                </span>
                <p
                  className={cn(
                    "mt-2 text-sm sm:text-center sm:text-xs",
                    current ? "font-medium text-green" : "text-muted"
                  )}
                >
                  {step.label}
                </p>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="admin-card">
        <label className="label-caps mb-2 block text-muted">Tracking Number</label>
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="USPS tracking number (included in shipped email)"
          className="admin-input w-full print:hidden"
        />
        <p className="mt-2 text-xs text-muted print:hidden">
          Saved with the order and included when you send the shipping email or mark the order as
          shipped.
        </p>
      </div>

      <div className="admin-card">
        <label className="label-caps mb-2 block text-muted">Internal Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
          rows={4}
          placeholder="Add internal notes about this order…"
          className="admin-input w-full resize-y print:hidden"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap print:hidden">
        <Button type="button" variant="outline" onClick={handlePrint} className="w-full gap-2 sm:w-auto">
          <Printer size={16} />
          Print Invoice
        </Button>
        <Button
          type="button"
          onClick={handleSendTracking}
          disabled={emailSending !== null}
          className="w-full gap-2 sm:w-auto"
        >
          <Mail size={16} />
          {emailSending === "tracking" ? "Sending…" : "Send Tracking Email"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleSendDelivered}
          disabled={emailSending !== null}
          className="w-full gap-2 sm:w-auto"
        >
          <PackageCheck size={16} />
          {emailSending === "delivered" ? "Sending…" : "Send Delivered Email"}
        </Button>
      </div>
    </div>
  );
}
