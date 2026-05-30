import type { Category, OrderStatus, Product, Role } from "@prisma/client";

export type { Category, OrderStatus, Role };

export type ProductWithMeta = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  category: Category;
  stock: number;
  images: string[];
  ingredients: string | null;
  fragrance: string | null;
  featured: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image?: string;
  quantity: number;
}

export interface DashboardKpis {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalProducts: number;
  lowStockCount: number;
  totalCustomers: number;
  newCustomersToday: number;
}
