import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-helpers";
import { buildCsv, csvResponse } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin("orders:read");
  if (error) return error;

  const status = request.nextUrl.searchParams.get("status");
  const search = request.nextUrl.searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (status && status !== "ALL") {
    where.status = status;
  }
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { customer: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { firstName: true, lastName: true, email: true } },
      items: true,
    },
  });

  const csv = buildCsv(
    [
      "Order Number",
      "Status",
      "Customer",
      "Email",
      "Items",
      "Subtotal",
      "Shipping",
      "Tax",
      "Total",
      "Created At",
    ],
    orders.map((order) => [
      order.orderNumber,
      order.status,
      `${order.customer.firstName} ${order.customer.lastName}`.trim(),
      order.customer.email,
      order.items.reduce((sum, item) => sum + item.quantity, 0),
      order.subtotal,
      order.shipping,
      order.tax,
      order.total,
      order.createdAt.toISOString(),
    ])
  );

  return csvResponse(
    `orders-${new Date().toISOString().slice(0, 10)}.csv`,
    csv
  );
}
