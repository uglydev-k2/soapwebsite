"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, PackageCheck } from "lucide-react";
import type { Customer, Order, OrderItem } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { useToastStore } from "@/store/toastStore";
import { formatDateTime, formatPrice, cn, statusColors } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

type FulfillmentOrder = Order & {
  customer: Pick<Customer, "firstName" | "lastName" | "email">;
  items: OrderItem[];
};

interface FulfillmentQueueProps {
  orders: FulfillmentOrder[];
}

export function FulfillmentQueue({ orders }: FulfillmentQueueProps) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const updateStatus = async (orderId: string, status: "PROCESSING" | "SHIPPED") => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) {
        addToast(json.error ?? "Failed to update order", "error");
        return;
      }
      addToast(`Order marked ${status.toLowerCase()}`);
      router.refresh();
    } catch {
      addToast("Failed to update order", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="admin-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PackageCheck size={18} className="text-terra" />
          <h2 className="label-caps text-muted">Fulfillment Queue</h2>
        </div>
        <Link href="/admin/orders?status=PENDING" className="text-xs text-terra hover:text-green">
          All pending →
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="border border-green/10 bg-green/5 px-4 py-6 text-center text-sm text-green">
          No orders waiting for fulfillment.
        </p>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => {
            const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
            const isPending = order.status === "PENDING";

            return (
              <li
                key={order.id}
                className="flex flex-col gap-3 border border-green/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-serif text-lg text-green hover:text-terra"
                    >
                      {order.orderNumber}
                    </Link>
                    <Badge
                      variant="status"
                      className={cn("capitalize", statusColors[order.status])}
                    >
                      {order.status.toLowerCase()}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {order.customer.firstName} {order.customer.lastName} ·{" "}
                    {itemCount} item{itemCount > 1 ? "s" : ""} ·{" "}
                    {formatPrice(order.total)}
                  </p>
                  <p className="text-[11px] text-muted">
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {isPending ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={updatingId === order.id}
                      onClick={() => updateStatus(order.id, "PROCESSING")}
                    >
                      Start Processing
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    disabled={updatingId === order.id}
                    onClick={() => updateStatus(order.id, "SHIPPED")}
                  >
                    Mark Shipped
                  </Button>
                  <Link href={`/admin/orders/${order.id}`}>
                    <Button size="sm" variant="ghost" className="gap-1">
                      Open
                      <ArrowRight size={14} />
                    </Button>
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
