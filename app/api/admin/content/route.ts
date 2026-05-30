import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAdmin,
  jsonResponse,
  errorResponse,
} from "@/lib/api-helpers";
import { withApiHandler } from "@/lib/api-handler";
import { logAdminAction } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";
import type { ModerationStatus } from "@prisma/client";

export const GET = withApiHandler("admin.content.list", async (request: NextRequest) => {
  const { error } = await requireAdmin("content:read");
  if (error) return error;

  const status = request.nextUrl.searchParams.get("status");
  const search = request.nextUrl.searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (status) where.moderationStatus = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [products, subscribers] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
    prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return jsonResponse({ products, subscribers });
});

export const PATCH = withApiHandler("admin.content.moderate", async (request: NextRequest) => {
  const { session, error } = await requireAdmin("content:moderate");
  if (error) return error;

  const body = await request.json();
  const { ids, moderationStatus, active } = body as {
    ids: string[];
    moderationStatus?: ModerationStatus;
    active?: boolean;
  };

  if (!ids?.length) return errorResponse("Product IDs required");

  await prisma.product.updateMany({
    where: { id: { in: ids } },
    data: {
      ...(moderationStatus && { moderationStatus }),
      ...(active !== undefined && { active }),
    },
  });

  await logAdminAction({
    adminId: session!.user!.id,
    adminEmail: session!.user!.email ?? "",
    adminRole: (session!.user as { role?: string }).role ?? "",
    action: "MODERATE",
    entity: "Product",
    metadata: { ids, moderationStatus, active },
    ipAddress: getClientIp(request),
  });

  return jsonResponse({ success: true, count: ids.length });
});
