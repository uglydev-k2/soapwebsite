import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, jsonResponse, errorResponse } from "@/lib/api-helpers";
import { customerUpdateSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const search = request.nextUrl.searchParams.get("search");

  const customers = await prisma.customer.findMany({
    where: search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: {
      orders: { select: { total: true } },
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const data = customers.map((c) => ({
    id: c.id,
    email: c.email,
    firstName: c.firstName,
    lastName: c.lastName,
    phone: c.phone,
    createdAt: c.createdAt,
    ordersCount: c._count.orders,
    totalSpent: c.orders.reduce((sum, o) => sum + o.total, 0),
  }));

  return jsonResponse(data);
}

export async function PATCH(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const { id, ...rest } = body;
  const parsed = customerUpdateSchema.safeParse(rest);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message || "Invalid data");
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: parsed.data,
    include: { orders: { orderBy: { createdAt: "desc" }, take: 10 } },
  });
  return jsonResponse(customer);
}
