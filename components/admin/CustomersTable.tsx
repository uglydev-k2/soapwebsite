"use client";

import { cn, formatDate, formatPrice } from "@/lib/utils";

export interface CustomerRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  ordersCount: number;
  totalSpent: number;
  createdAt: Date | string;
}

interface CustomersTableProps {
  customers: CustomerRow[];
  onView?: (customer: CustomerRow) => void;
  className?: string;
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export function CustomersTable({
  customers,
  onView,
  className,
}: CustomersTableProps) {
  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="font-serif text-xl text-green/60">No customers yet</p>
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-green/10">
            <th className="label-caps px-4 py-3 text-muted">Customer</th>
            <th className="label-caps px-4 py-3 text-muted">Email</th>
            <th className="label-caps px-4 py-3 text-muted">Orders</th>
            <th className="label-caps px-4 py-3 text-muted">Spent</th>
            <th className="label-caps px-4 py-3 text-muted">Joined</th>
            <th className="label-caps px-4 py-3 text-muted">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr
              key={customer.id}
              onClick={() => onView?.(customer)}
              className={cn(
                "border-b border-green/5 transition-colors hover:bg-cream/50",
                onView && "cursor-pointer"
              )}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terra/15 font-sans text-xs font-medium text-terra">
                    {getInitials(customer.firstName, customer.lastName)}
                  </div>
                  <p className="font-medium text-green">
                    {customer.firstName} {customer.lastName}
                  </p>
                </div>
              </td>
              <td className="px-4 py-3 text-muted">{customer.email}</td>
              <td className="px-4 py-3">{customer.ordersCount}</td>
              <td className="px-4 py-3 font-medium">
                {formatPrice(customer.totalSpent)}
              </td>
              <td className="px-4 py-3 text-muted">
                {formatDate(customer.createdAt)}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView?.(customer);
                  }}
                  className="text-xs text-terra underline-offset-2 transition-colors hover:text-terra-2 hover:underline"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
