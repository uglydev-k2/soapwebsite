"use client";

import Link from "next/link";
import type { Customer, Order, OrderItem, Product } from "@prisma/client";
import { cn, formatDate, formatPrice, statusColors } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

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
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-green/10">
            {selectable && (
              <th className="px-4 py-3 w-10">
                <input type="checkbox" onChange={onSelectAll} />
              </th>
            )}
            <th className="label-caps px-4 py-3 text-muted">Order #</th>
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
  );
}
