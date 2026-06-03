import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/db";

const LOW_STOCK_THRESHOLD = 10;

export async function getLowStockProducts(threshold = LOW_STOCK_THRESHOLD) {
  return safeDbQuery(
    "getLowStockProducts",
    () =>
      prisma.product.findMany({
        where: { active: true, stock: { lte: threshold } },
        orderBy: [{ stock: "asc" }, { name: "asc" }],
      }),
    []
  );
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
