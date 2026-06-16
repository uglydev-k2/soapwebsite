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
    await sendTrackingEmail(order.customer.email, order.orderNumber, {
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        image: item.product.images[0] ?? null,
      })),
    });
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAdmin("orders:write");
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  if (body.action !== "send-tracking") {
    return errorResponse("Invalid action", 400);
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      items: { include: { product: { select: { name: true, images: true } } } },
    },
  });

  if (!order) return errorResponse("Order not found", 404);
  if (!order.customer.email) {
    return errorResponse("Customer has no email address", 400);
  }

  const trackingInfo =
    typeof body.trackingInfo === "string" ? body.trackingInfo : undefined;

  await sendTrackingEmail(order.customer.email, order.orderNumber, {
    trackingInfo,
    items: order.items.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      price: item.price,
      image: item.product.images[0] ?? null,
    })),
  });

  await logAdminAction({
    adminId: session!.user!.id,
    adminEmail: session!.user!.email ?? "",
    adminRole: (session!.user as { role?: string }).role ?? "",
    action: "NOTIFY",
    entity: "Order",
    entityId: params.id,
    metadata: { orderNumber: order.orderNumber, trackingInfo },
    ipAddress: getClientIp(request),
  });

  return jsonResponse({ success: true });
}
