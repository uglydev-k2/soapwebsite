"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import type { Order } from "@prisma/client";
import {
  customerUpdateSchema,
  type CustomerUpdateData,
} from "@/lib/validations";
import { cn, formatDate, formatPrice, statusColors } from "@/lib/utils";
import { useToastStore } from "@/store/toastStore";
import type { ApiResponse } from "@/types";
import type { CustomerRow } from "@/components/admin/CustomersTable";
import type { OrderRow } from "@/components/admin/OrdersTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface CustomerPanelProps {
  customer: CustomerRow | null;
  open: boolean;
  onClose: () => void;
  onSaved?: (customer: CustomerRow) => void;
}

type CustomerDetail = CustomerRow & {
  orders?: Pick<
    Order,
    "id" | "orderNumber" | "total" | "status" | "createdAt"
  >[];
};

export function CustomerPanel({
  customer,
  open,
  onClose,
  onSaved,
}: CustomerPanelProps) {
  const addToast = useToastStore((s) => s.addToast);
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerUpdateData>({
    resolver: zodResolver(customerUpdateSchema),
  });

  useEffect(() => {
    if (!customer || !open) {
      setDetail(null);
      return;
    }

    const activeCustomer: CustomerRow = customer;

    reset({
      firstName: activeCustomer.firstName,
      lastName: activeCustomer.lastName,
      email: activeCustomer.email,
      phone: activeCustomer.phone ?? "",
    });

    let cancelled = false;
    setLoading(true);

    async function loadOrders() {
      try {
        const ordersRes = await fetch(
          `/api/orders?search=${encodeURIComponent(activeCustomer.email)}&limit=10`
        );
        const ordersJson = (await ordersRes.json()) as ApiResponse<OrderRow[]>;
        if (!cancelled && ordersRes.ok) {
          setDetail({
            ...activeCustomer,
            orders:
              ordersJson.data?.map((o) => ({
                id: o.id,
                orderNumber: o.orderNumber,
                total: o.total,
                status: o.status,
                createdAt: o.createdAt,
              })) ?? [],
          });
        } else if (!cancelled) {
          setDetail(activeCustomer);
        }
      } catch {
        if (!cancelled) setDetail(activeCustomer);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, [customer, open, reset]);

  const onSubmit = async (data: CustomerUpdateData) => {
    if (!customer) return;
    setSaving(true);
    try {
      const res = await fetch("/api/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: customer.id, ...data }),
      });
      const json = await res.json();
      if (!res.ok) {
        addToast(json.error ?? "Failed to update customer", "error");
        return;
      }
      const updated: CustomerRow = {
        id: customer.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        ordersCount: customer.ordersCount,
        totalSpent: customer.totalSpent,
        createdAt: customer.createdAt,
      };
      addToast("Customer updated");
      onSaved?.(updated);
      onClose();
    } catch {
      addToast("Failed to update customer", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!open || !customer) return null;

  const orders = detail?.orders ?? [];

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-green-3/40"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-xl",
          "transform transition-transform duration-300"
        )}
        role="dialog"
        aria-modal
        aria-labelledby="customer-panel-title"
      >
        <div className="flex items-center justify-between border-b border-green/10 px-6 py-5">
          <div>
            <p className="label-caps text-muted">Customer</p>
            <h2
              id="customer-panel-title"
              className="font-serif text-2xl font-medium text-green"
            >
              {customer.firstName} {customer.lastName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-muted transition-colors hover:text-green"
            aria-label="Close panel"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="First Name"
                {...register("firstName")}
                error={errors.firstName?.message}
              />
              <Input
                label="Last Name"
                {...register("lastName")}
                error={errors.lastName?.message}
              />
            </div>
            <Input
              label="Email"
              type="email"
              {...register("email")}
              error={errors.email?.message}
            />
            <Input
              label="Phone"
              {...register("phone")}
              error={errors.phone?.message}
            />

            <dl className="grid grid-cols-2 gap-4 border-t border-green/10 pt-4 text-sm">
              <div>
                <dt className="label-caps text-muted">Orders</dt>
                <dd className="mt-1 font-serif text-xl text-green">
                  {customer.ordersCount}
                </dd>
              </div>
              <div>
                <dt className="label-caps text-muted">Total Spent</dt>
                <dd className="mt-1 font-serif text-xl text-green">
                  {formatPrice(customer.totalSpent)}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="label-caps text-muted">Member Since</dt>
                <dd className="mt-1 text-muted">{formatDate(customer.createdAt)}</dd>
              </div>
            </dl>

            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </form>

          <div className="mt-8">
            <h3 className="label-caps mb-4 text-muted">Recent Orders</h3>
            {loading ? (
              <p className="text-sm text-muted">Loading orders…</p>
            ) : orders.length === 0 ? (
              <p className="font-serif text-lg text-green/40">No orders yet</p>
            ) : (
              <ul className="space-y-3">
                {orders.map((order) => (
                  <li
                    key={order.id}
                    className="flex items-center justify-between border border-green/10 p-3"
                  >
                    <div>
                      <p className="font-medium text-green">{order.orderNumber}</p>
                      <p className="text-xs text-muted">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-medium">
                        {formatPrice(order.total)}
                      </span>
                      <Badge
                        variant="status"
                        className={cn(
                          "capitalize",
                          statusColors[order.status]
                        )}
                      >
                        {order.status.toLowerCase()}
                      </Badge>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-xs text-terra hover:underline"
                        onClick={onClose}
                      >
                        View
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
