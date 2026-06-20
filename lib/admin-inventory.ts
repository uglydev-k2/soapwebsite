import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/db";
import { adminProductSelect } from "@/lib/admin-product-select";

const LOW_STOCK_THRESHOLD = 10;

export type LowStockItem = {
  id: string;
  name: string;
  slug: string;
  stock: number;
  kind: "product" | "scent";
  productId?: string;
  scentLabel?: string;
};

export async function getLowStockProducts(threshold = LOW_STOCK_THRESHOLD) {
  return safeDbQuery(
    "getLowStockProducts",
    () =>
      prisma.product.findMany({
        where: { active: true, stock: { lte: threshold } },
        orderBy: [{ stock: "asc" }, { name: "asc" }],
        select: adminProductSelect,
      }),
    []
  );
}

export async function getLowStockItems(threshold = LOW_STOCK_THRESHOLD): Promise<LowStockItem[]> {
  return safeDbQuery(
    "getLowStockItems",
    async () => {
      const [products, scentOptions] = await Promise.all([
        prisma.product.findMany({
          where: { active: true, stock: { lte: threshold } },
          select: { id: true, name: true, slug: true, stock: true },
          orderBy: [{ stock: "asc" }, { name: "asc" }],
        }),
        prisma.productScentOption.findMany({
          where: { active: true, stock: { lte: threshold } },
          select: {
            id: true,
            label: true,
            stock: true,
            product: { select: { id: true, name: true, slug: true } },
          },
          orderBy: [{ stock: "asc" }, { label: "asc" }],
        }),
      ]);

      const items: LowStockItem[] = [
        ...products.map((product) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          stock: product.stock,
          kind: "product" as const,
        })),
        ...scentOptions.map((option) => ({
          id: option.id,
          name: `${option.product.name} (${option.label})`,
          slug: option.product.slug,
          stock: option.stock,
          kind: "scent" as const,
          productId: option.product.id,
          scentLabel: option.label,
        })),
      ];

      return items.sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name));
    },
    []
  );
}

export async function countLowStockItems(threshold = LOW_STOCK_THRESHOLD): Promise<number> {
  const items = await getLowStockItems(threshold);
  return items.length;
}

export async function getPendingFulfillmentOrders(limit = 8) {
  return safeDbQuery(
    "getPendingFulfillmentOrders",
    () =>
      prisma.order.findMany({
        where: { status: { in: ["PENDING", "PROCESSING"] } },
        take: limit,
        orderBy: { createdAt: "asc" },
        include: {
          customer: { select: { firstName: true, lastName: true, email: true } },
          items: true,
        },
      }),
    []
  );
}

export { LOW_STOCK_THRESHOLD };
