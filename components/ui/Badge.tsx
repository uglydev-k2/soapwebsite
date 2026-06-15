import { cn } from "@/lib/utils";
import { getCategoryDisplayLabel } from "@/lib/categories";
import type { OrderStatus } from "@prisma/client";
import type { ReactNode } from "react";

const statusStyles: Record<OrderStatus, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  PROCESSING: "bg-amber-50 text-amber-700",
  SHIPPED: "bg-blue-50 text-blue-700",
  DELIVERED: "bg-green/10 text-green",
  CANCELLED: "bg-red-50 text-red-600",
  REFUNDED: "bg-purple-50 text-purple-600",
};

interface BadgeProps {
  children?: ReactNode;
  status?: OrderStatus | string;
  variant?: "default" | "status" | "terra";
  className?: string;
}

export function Badge({
  children,
  status,
  variant = "default",
  className,
}: BadgeProps) {
  const label =
    children ??
    (status ? String(status).replace(/_/g, " ") : "");

  const variantStyles = {
    default: "bg-cream-2 text-green",
    status: status
      ? statusStyles[status as OrderStatus] ?? "bg-gray-100 text-gray-600"
      : "bg-cream-2 text-green",
    terra: "bg-terra/10 text-terra",
  };

  return (
    <span
      className={cn(
        "label-caps inline-block px-2 py-1",
        variantStyles[variant],
        className
      )}
      style={{ borderRadius: 0 }}
    >
      {label}
    </span>
  );
}

export function CategoryBadge({
  category,
  className,
}: {
  category: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "label-caps inline-block bg-cream-2 px-2 py-1 text-green",
        className
      )}
      style={{ borderRadius: 0 }}
    >
      {getCategoryDisplayLabel(category)}
    </span>
  );
}
