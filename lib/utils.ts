import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Category, OrderStatus } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateLong(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export const categoryLabels: Record<Category, string> = {
  BAR_SOAP: "Bar Soap",
  BATH_BODY: "Bath & Body Products",
  CANDLES: "Candles",
  ACCESSORIES: "Accessories",
  GIFT_SET: "Gift Set",
};

export const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  PROCESSING: "bg-amber-50 text-amber-700",
  SHIPPED: "bg-blue-50 text-blue-700",
  DELIVERED: "bg-green/10 text-green",
  CANCELLED: "bg-red-50 text-red-600",
  REFUNDED: "bg-purple-50 text-purple-600",
};

const categoryGradients: Record<Category, string> = {
  BAR_SOAP: "from-green-3 to-green",
  BATH_BODY: "from-green to-green-2",
  CANDLES: "from-gold/40 to-terra-2",
  ACCESSORIES: "from-green-2 to-gold/30",
  GIFT_SET: "from-gold/50 to-terra",
};

export function getCategoryGradient(category: Category | string): string {
  return categoryGradients[category as Category] ?? "from-green-3 to-green";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateOrderNumber(): string {
  const prefix = "MSV";
  const num = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${num}`;
}

export function getCategoryLabel(category: string): string {
  return category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
