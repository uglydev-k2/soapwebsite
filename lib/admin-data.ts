import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";
import {
  adminProductSelect,
  type AdminProduct,
} from "@/lib/admin-product-select";
import type { Prisma } from "@prisma/client";

export type AdminProductsResult = {
  products: AdminProduct[];
  error: string | null;
};

export async function getAdminProducts(
  where: Prisma.ProductWhereInput = {}
): Promise<AdminProductsResult> {
  if (!isDatabaseConfigured()) {
    return { products: [], error: "Database is not configured (DATABASE_URL missing)." };
  }

  try {
    const products = await prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      select: adminProductSelect,
    });
    return { products, error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load products from database.";
    console.error("[msvee:db:adminProducts] Query failed:", error);
    return { products: [], error: message };
  }
}

export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  if (!isDatabaseConfigured()) return null;

  try {
    return await prisma.product.findUnique({
      where: { id },
      select: adminProductSelect,
    });
  } catch (error) {
    console.error("[msvee:db:adminProduct] Query failed:", error);
    return null;
  }
}

export async function getAdminOrders(where: Prisma.OrderWhereInput = {}) {
  return safeDbQuery(
    "adminOrders",
    () =>
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { firstName: true, lastName: true, email: true } },
          items: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    []
  );
}

export async function getAdminOrder(id: string) {
  return safeDbQuery(
    "adminOrder",
    () =>
      prisma.order.findUnique({
        where: { id },
        include: {
          customer: true,
          items: { include: { product: true } },
        },
      }),
    null
  );
}

export async function getAdminCustomers() {
  return safeDbQuery(
    "adminCustomers",
    () =>
      prisma.customer.findMany({
        include: {
          orders: { select: { total: true } },
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    []
  );
}

export async function getAdminSettings() {
  return safeDbQuery(
    "adminSettings",
    async () => {
      const [settings, admins] = await Promise.all([
        prisma.storeSettings.findUnique({ where: { id: "default" } }),
        prisma.adminUser.findMany({
          select: { id: true, email: true, name: true, role: true, createdAt: true },
        }),
      ]);
      return { settings, admins };
    },
    { settings: null, admins: [] }
  );
}
