import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, jsonResponse, errorResponse } from "@/lib/api-helpers";
import { orderUpdateSchema } from "@/lib/validations";
import { sendTrackingEmail } from "@/lib/resend";
import { logAdminAction } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      items: { include: { product: true } },
    },
  });
  if (!order) return errorResponse("Order not found", 404);
  return jsonResponse(order);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const parsed = orderUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message || "Invalid data");
  }

  const order = await prisma.order.update({
    where: { id: params.id },
    data: parsed.data,
    include: { customer: true, items: { include: { product: true } } },
  });

  if (parsed.data.status === "SHIPPED" && order.customer.email) {
    await sendTrackingEmail(order.customer.email, order.orderNumber);
  }

  await logAdminAction({
    adminId: session!.user!.id,
    adminEmail: session!.user!.email ?? "",
    adminRole: (session!.user as { role?: string }).role ?? "",
    action: "UPDATE",
    entity: "Order",
    entityId: params.id,
    metadata: { status: parsed.data.status, orderNumber: order.orderNumber },
    ipAddress: getClientIp(request),
  });

  return jsonResponse(order);
}
