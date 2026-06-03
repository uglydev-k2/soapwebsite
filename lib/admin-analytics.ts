import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/db";

export type ProductSkuMetric = {
  productId: string;
  name: string;
  slug: string;
  category: string;
  stock: number;
  price: number;
  unitsSold: number;
  revenue: number;
  orderCount: number;
};

export async function getProductSkuMetrics(since: Date) {
  return safeDbQuery(
    "getProductSkuMetrics",
    () => fetchProductSkuMetrics(since),
    [] as ProductSkuMetric[]
  );
}

async function fetchProductSkuMetrics(since: Date) {
  const [products, orderItems] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        stock: true,
        price: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: since },
          status: { notIn: ["CANCELLED", "REFUNDED"] },
        },
      },
      select: {
        productId: true,
        quantity: true,
        price: true,
        orderId: true,
      },
    }),
  ]);

  const stats = new Map<
    string,
    { unitsSold: number; revenue: number; orderIds: Set<string> }
  >();

  for (const item of orderItems) {
    const current = stats.get(item.productId) ?? {
      unitsSold: 0,
      revenue: 0,
      orderIds: new Set<string>(),
    };
    current.unitsSold += item.quantity;
    current.revenue += item.price * item.quantity;
    current.orderIds.add(item.orderId);
    stats.set(item.productId, current);
  }

  return products
    .map((product) => {
      const metric = stats.get(product.id);
      return {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        category: product.category,
        stock: product.stock,
        price: product.price,
        unitsSold: metric?.unitsSold ?? 0,
        revenue: metric?.revenue ?? 0,
        orderCount: metric?.orderIds.size ?? 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue || b.unitsSold - a.unitsSold);
}
