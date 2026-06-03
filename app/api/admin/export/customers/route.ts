import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-helpers";
import { buildCsv, csvResponse } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin("customers:read");
  if (error) return error;

  const search = request.nextUrl.searchParams.get("search");
  const status = request.nextUrl.searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
    ];
  }

  const customers = await prisma.customer.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      orders: { select: { total: true } },
      _count: { select: { orders: true } },
    },
  });

  const csv = buildCsv(
    [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Status",
      "Orders",
      "Total Spent",
      "Joined",
      "Last Active",
    ],
    customers.map((customer) => [
      customer.firstName,
      customer.lastName,
      customer.email,
      customer.phone ?? "",
      customer.status,
      customer._count.orders,
      customer.orders.reduce((sum, order) => sum + order.total, 0),
      customer.createdAt.toISOString(),
      customer.lastActiveAt?.toISOString() ?? "",
    ])
  );

  return csvResponse(
    `customers-${new Date().toISOString().slice(0, 10)}.csv`,
    csv
  );
}
