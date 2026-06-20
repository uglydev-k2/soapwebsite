"use client";

import Link from "next/link";
import type { Customer, Order, OrderItem, Product } from "@prisma/client";
import { cn, formatDate, formatPrice, statusColors } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { getOrderPurchaseType } from "@/lib/admin-orders";
import { parseOrderNotes } from "@/lib/order-notes";
import { getCadenceLabel } from "@/lib/subscriptions";

export type OrderRow = Order & {
  customer: Pick<Customer, "firstName" | "lastName" | "email"> | Customer;
  items: (OrderItem & { product?: Product })[];
};

interface OrdersTableProps {
  orders: OrderRow[];
  className?: string;
  emptyMessage?: string;
  compact?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelect?: (id: string) => void;
  onSelectAll?: () => void;
}

export function OrdersTable({
  orders,
  className,
  emptyMessage = "No orders yet",
  selectable,
  selectedIds = [],
  onSelect,
  onSelectAll,
}: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="font-serif text-xl text-green/60">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ul className="admin-mobile-list">
        {orders.map((order) => {
          const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
          const purchaseType = getOrderPurchaseType(order.notes);
          const orderMeta = parseOrderNotes(order.notes);
          const isSubscription = purchaseType === "subscription";
          return (
            <li key={order.id} className="admin-mobile-card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-serif text-lg text-green hover:text-terra"
                  >
                    {order.orderNumber}
                  </Link>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant={isSubscription ? "terra" : "default"}>
                      {isSubscription
                        ? orderMeta.subscriptionRenewal
                          ? "Subscription renewal"
                          : "Subscription"
                        : "One-time"}
                    </Badge>
                    {isSubscription && orderMeta.subscriptionCadence ? (
                      <span className="text-xs text-muted">
                        {getCadenceLabel(orderMeta.subscriptionCadence)}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 text-sm text-text">
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <p className="truncate text-sm text-muted">{order.customer.email}</p>
                </div>
                <Badge
                  variant="status"
                  className={cn(
                    "shrink-0 capitalize",
                    statusColors[order.status] ?? statusColors.PENDING
                  )}
                >
                  {order.status.toLowerCase()}
                </Badge>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
                <span>{formatDate(order.createdAt)}</span>
                <span>
                  {itemCount} {itemCount === 1 ? "item" : "items"} ·{" "}
                  <span className="font-medium text-green">{formatPrice(order.total)}</span>
                </span>
              </div>
              <Link
                href={`/admin/orders/${order.id}`}
                className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-terra underline-offset-2 hover:underline"
              >
                View order →
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-green/10">
            {selectable && (
              <th className="px-4 py-3 w-10">
                <input type="checkbox" onChange={onSelectAll} />
              </th>
            )}
            <th className="label-caps px-4 py-3 text-muted">Order #</th>
            <th className="label-caps px-4 py-3 text-muted">Type</th>
            <th className="label-caps px-4 py-3 text-muted">Customer</th>
            <th className="label-caps px-4 py-3 text-muted">Date</th>
            <th className="label-caps px-4 py-3 text-muted">Items</th>
            <th className="label-caps px-4 py-3 text-muted">Total</th>
            <th className="label-caps px-4 py-3 text-muted">Status</th>
            <th className="label-caps px-4 py-3 text-muted">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
            const purchaseType = getOrderPurchaseType(order.notes);
            const orderMeta = parseOrderNotes(order.notes);
            const isSubscription = purchaseType === "subscription";
            return (
              <tr
                key={order.id}
                className="border-b border-green/5 transition-colors hover:bg-cream/50"
              >
                {selectable && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(order.id)}
                      onChange={() => onSelect?.(order.id)}
                    />
                  </td>
                )}
                <td className="px-4 py-3 font-medium text-green">
                  {order.orderNumber}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={isSubscription ? "terra" : "default"}>
                    {isSubscription
                      ? orderMeta.subscriptionRenewal
                        ? "Subscription renewal"
                        : "Subscription"
                      : "One-time"}
                  </Badge>
                  {isSubscription && orderMeta.subscriptionCadence ? (
                    <p className="mt-1 text-xs text-muted">
                      {getCadenceLabel(orderMeta.subscriptionCadence)}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <p className="text-text">
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <p className="text-xs text-muted">{order.customer.email}</p>
                </td>
                <td className="px-4 py-3 text-muted">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-4 py-3 text-muted">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </td>
                <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                <td className="px-4 py-3">
                  <Badge
                    variant="status"
                    className={cn(
                      "capitalize",
                      statusColors[order.status] ?? statusColors.PENDING
                    )}
                  >
                    {order.status.toLowerCase()}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-xs text-terra underline-offset-2 transition-colors hover:text-terra-2 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}
