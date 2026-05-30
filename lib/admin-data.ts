import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function getAdminProducts(
  where: Prisma.ProductWhereInput = {}
) {
  return safeDbQuery(
    "adminProducts",
    () => prisma.product.findMany({ where, orderBy: { updatedAt: "desc" } }),
    []
  );
}

export async function getAdminProduct(id: string) {
  return safeDbQuery(
    "adminProduct",
    () => prisma.product.findUnique({ where: { id } }),
    null
  );
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
