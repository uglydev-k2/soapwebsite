import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAdmin,
  jsonResponse,
  errorResponse,
  requireRateLimit,
} from "@/lib/api-helpers";
import { withApiHandler } from "@/lib/api-handler";
import { logAdminAction } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";
import {
  computeSubscriptionMetrics,
  serializeAdminSubscription,
} from "@/lib/admin-subscriptions";
import type { CustomerSubStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export const GET = withApiHandler("admin.subscriptions", async (request: NextRequest) => {
  const { error } = await requireAdmin("billing:read");
  if (error) return error;

  const status = request.nextUrl.searchParams.get("status") as CustomerSubStatus | null;
  const validStatuses: CustomerSubStatus[] = ["ACTIVE", "PAUSED", "CANCELLED"];

  const subscriptions = await prisma.customerSubscription.findMany({
    where:
      status && validStatuses.includes(status) ? { status } : undefined,
    include: {
      customer: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
    orderBy: [{ status: "asc" }, { nextChargeAt: "asc" }],
    take: 200,
  });

  const rows = subscriptions.map(serializeAdminSubscription);

  return jsonResponse({
    subscriptions: rows,
    metrics: computeSubscriptionMetrics(rows),
  });
});

export const PATCH = withApiHandler(
  "admin.subscriptions.update",
  async (request: NextRequest) => {
    const limited = requireRateLimit(request, "subscriptions-update", 30);
    if (limited) return limited;

    const { session, error } = await requireAdmin("billing:write");
    if (error) return error;

    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    const action = body.action as "cancel" | "pause" | "resume";

    if (!id || !action) {
      return errorResponse("id and action are required");
    }

    const subscription = await prisma.customerSubscription.findUnique({
      where: { id },
      include: {
        customer: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!subscription) {
      return errorResponse("Subscription not found", 404);
    }

    if (action === "cancel") {
      if (subscription.status === "CANCELLED") {
        return errorResponse("Subscription is already cancelled");
      }
      const updated = await prisma.customerSubscription.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
        include: {
          customer: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });

      await logAdminAction({
        adminId: session!.user!.id,
        adminEmail: session!.user!.email ?? "",
        adminRole: (session!.user as { role?: string }).role ?? "",
        action: "UPDATE",
        entity: "CustomerSubscription",
        entityId: id,
        metadata: {
          action,
          sourceOrderNumber: subscription.sourceOrderNumber,
        },
        ipAddress: getClientIp(request),
      });

      return jsonResponse({ subscription: serializeAdminSubscription(updated) });
    }

    if (action === "pause") {
      if (subscription.status !== "ACTIVE") {
        return errorResponse("Only active subscriptions can be paused");
      }
      const updated = await prisma.customerSubscription.update({
        where: { id },
        data: {
          status: "PAUSED",
          pausedAt: new Date(),
        },
        include: {
          customer: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });

      await logAdminAction({
        adminId: session!.user!.id,
        adminEmail: session!.user!.email ?? "",
        adminRole: (session!.user as { role?: string }).role ?? "",
        action: "UPDATE",
        entity: "CustomerSubscription",
        entityId: id,
        metadata: { action, sourceOrderNumber: subscription.sourceOrderNumber },
        ipAddress: getClientIp(request),
      });

      return jsonResponse({ subscription: serializeAdminSubscription(updated) });
    }

    if (action === "resume") {
      if (subscription.status !== "PAUSED") {
        return errorResponse("Only paused subscriptions can be resumed");
      }
      const updated = await prisma.customerSubscription.update({
        where: { id },
        data: {
          status: "ACTIVE",
          pausedAt: null,
        },
        include: {
          customer: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });

      await logAdminAction({
        adminId: session!.user!.id,
        adminEmail: session!.user!.email ?? "",
        adminRole: (session!.user as { role?: string }).role ?? "",
        action: "UPDATE",
        entity: "CustomerSubscription",
        entityId: id,
        metadata: { action, sourceOrderNumber: subscription.sourceOrderNumber },
        ipAddress: getClientIp(request),
      });

      return jsonResponse({ subscription: serializeAdminSubscription(updated) });
    }

    return errorResponse("Invalid action", 400);
  }
);
