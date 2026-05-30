import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAdmin,
  jsonResponse,
  errorResponse,
  requireRateLimit,
} from "@/lib/api-helpers";
import { withApiHandler } from "@/lib/api-handler";
import { customerUpdateSchema } from "@/lib/validations";
import { logAdminAction } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";
import type { CustomerStatus } from "@prisma/client";

export const GET = withApiHandler("customers.list", async (request: NextRequest) => {
  const { error } = await requireAdmin("customers:read");
  if (error) return error;

  const search = request.nextUrl.searchParams.get("search");
  const status = request.nextUrl.searchParams.get("status");
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
    ];
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      include: {
        orders: { select: { total: true } },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.customer.count({ where }),
  ]);

  const data = customers.map((c) => ({
    id: c.id,
    email: c.email,
    firstName: c.firstName,
    lastName: c.lastName,
    phone: c.phone,
    status: c.status,
    bannedAt: c.bannedAt,
    lastActiveAt: c.lastActiveAt,
    createdAt: c.createdAt,
    ordersCount: c._count.orders,
    totalSpent: c.orders.reduce((sum, o) => sum + o.total, 0),
  }));

  return jsonResponse(data, { page, limit, total, totalPages: Math.ceil(total / limit) });
});

export const PATCH = withApiHandler("customers.update", async (request: NextRequest) => {
  const { session, error } = await requireAdmin("customers:write");
  if (error) return error;

  const body = await request.json();
  const { id, status, bannedReason, ...rest } = body as {
    id: string;
    status?: CustomerStatus;
    bannedReason?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };

  const parsed = customerUpdateSchema.safeParse(rest);
  if (!parsed.success && Object.keys(rest).length > 0) {
    return errorResponse(parsed.error.errors[0]?.message || "Invalid data");
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (status) {
    updateData.status = status;
    if (status === "BANNED") {
      updateData.bannedAt = new Date();
      updateData.bannedReason = bannedReason ?? "Banned by admin";
    } else if (status === "ACTIVE") {
      updateData.bannedAt = null;
      updateData.bannedReason = null;
    }
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: updateData,
    include: { orders: { orderBy: { createdAt: "desc" }, take: 10 } },
  });

  await logAdminAction({
    adminId: session!.user!.id,
    adminEmail: session!.user!.email ?? "",
    adminRole: (session!.user as { role?: string }).role ?? "",
    action: status === "BANNED" ? "BAN" : "UPDATE",
    entity: "Customer",
    entityId: id,
    metadata: { status, bannedReason },
    ipAddress: getClientIp(request),
  });

  return jsonResponse(customer);
});

export const DELETE = withApiHandler("customers.delete", async (request: NextRequest) => {
  const limited = requireRateLimit(request, "customers-delete", 10);
  if (limited) return limited;

  const { session, error } = await requireAdmin("customers:delete");
  if (error) return error;

  const { ids } = await request.json();
  if (!ids?.length) return errorResponse("Customer IDs required");

  await prisma.customer.deleteMany({ where: { id: { in: ids } } });

  await logAdminAction({
    adminId: session!.user!.id,
    adminEmail: session!.user!.email ?? "",
    adminRole: (session!.user as { role?: string }).role ?? "",
    action: "DELETE",
    entity: "Customer",
    metadata: { ids },
    ipAddress: getClientIp(request),
  });

  return jsonResponse({ success: true, count: ids.length });
});
