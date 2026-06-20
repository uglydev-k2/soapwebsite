import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, jsonResponse, errorResponse } from "@/lib/api-helpers";
import { logAdminAction } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";
import type { ModerationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin("content:read");
  if (error) return error;

  const status = request.nextUrl.searchParams.get("status") as ModerationStatus | null;

  const reviews = await prisma.productReview.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return jsonResponse(reviews);
}

export async function PATCH(request: NextRequest) {
  const { session, error } = await requireAdmin("content:moderate");
  if (error) return error;

  const body = await request.json();
  const id = typeof body.id === "string" ? body.id : "";
  const status = body.status as ModerationStatus | undefined;

  if (!id || !status) {
    return errorResponse("id and status are required");
  }

  if (!["APPROVED", "REJECTED", "FLAGGED", "PENDING"].includes(status)) {
    return errorResponse("Invalid status");
  }

  const review = await prisma.productReview.update({
    where: { id },
    data: { status },
  });

  await logAdminAction({
    adminId: session!.user!.id,
    adminEmail: session!.user!.email ?? "",
    adminRole: (session!.user as { role?: string }).role ?? "",
    action: "UPDATE",
    entity: "ProductReview",
    entityId: id,
    metadata: { status, productSlug: review.productSlug },
    ipAddress: getClientIp(request),
  });

  return jsonResponse(review);
}
