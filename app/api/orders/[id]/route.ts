import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, jsonResponse, errorResponse } from "@/lib/api-helpers";
import { orderUpdateSchema } from "@/lib/validations";
import { sendDeliveredEmail, sendTrackingEmail, sendReorderEmail } from "@/lib/resend";
import { logAdminAction } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";
import {
  buildDeliveredEmailPayload,
  buildShippingEmailPayload,
} from "@/lib/shipping-email";
import { mergeOrderNotes } from "@/lib/order-notes";

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

  const trackingInfo =
    typeof body.trackingInfo === "string" ? body.trackingInfo : undefined;

  const existing = await prisma.order.findUnique({
    where: { id: params.id },
    select: { notes: true },
  });

  const updateData: { status?: typeof parsed.data.status; notes?: string } = {};
  if (parsed.data.status) updateData.status = parsed.data.status;
  if (parsed.data.notes !== undefined) {
    updateData.notes = mergeOrderNotes(existing?.notes, {
      internalNotes: parsed.data.notes || undefined,
    });
  }

  let order = await prisma.order.update({
    where: { id: params.id },
    data: updateData,
    include: { customer: true, items: { include: { product: true } } },
  });

  if (trackingInfo) {
    order = await prisma.order.update({
      where: { id: params.id },
      data: {
        notes: mergeOrderNotes(order.notes, { trackingNumber: trackingInfo }),
      },
      include: { customer: true, items: { include: { product: true } } },
    });
  }

  if (parsed.data.status === "SHIPPED" && order.customer.email) {
    await sendTrackingEmail(
      order.customer.email,
      buildShippingEmailPayload(order, { trackingInfo })
    );
  }

  if (parsed.data.status === "DELIVERED" && order.customer.email) {
    await sendDeliveredEmail(buildDeliveredEmailPayload(order));
    await sendReorderEmail({
      email: order.customer.email,
      firstName: order.customer.firstName,
      orderNumber: order.orderNumber,
      items: order.items.map((item) => ({
        name: item.product.name,
        slug: item.product.slug,
        quantity: item.quantity,
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
  const action = body.action;
  if (action !== "send-tracking" && action !== "send-delivered") {
    return errorResponse("Invalid action", 400);
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      items: {
        include: {
          product: {
            select: {
              name: true,
              images: true,
              slug: true,
              fragrance: true,
              category: true,
            },
          },
        },
      },
    },
  });

  if (!order) return errorResponse("Order not found", 404);
  if (!order.customer.email) {
    return errorResponse("Customer has no email address", 400);
  }

  if (action === "send-tracking") {
    const trackingInfo =
      typeof body.trackingInfo === "string" ? body.trackingInfo : undefined;

    if (trackingInfo) {
      await prisma.order.update({
        where: { id: params.id },
        data: {
          notes: mergeOrderNotes(order.notes, { trackingNumber: trackingInfo }),
        },
      });
    }

    await sendTrackingEmail(
      order.customer.email,
      buildShippingEmailPayload(order, { trackingInfo })
    );

    await logAdminAction({
      adminId: session!.user!.id,
      adminEmail: session!.user!.email ?? "",
      adminRole: (session!.user as { role?: string }).role ?? "",
      action: "NOTIFY",
      entity: "Order",
      entityId: params.id,
      metadata: { orderNumber: order.orderNumber, trackingInfo, type: "tracking" },
      ipAddress: getClientIp(request),
    });

    return jsonResponse({ success: true });
  }

  await sendDeliveredEmail(buildDeliveredEmailPayload(order));
  await sendReorderEmail({
    email: order.customer.email,
    firstName: order.customer.firstName,
    orderNumber: order.orderNumber,
    items: order.items.map((item) => ({
      name: item.product.name,
      slug: item.product.slug,
      quantity: item.quantity,
    })),
  });

  await logAdminAction({
    adminId: session!.user!.id,
    adminEmail: session!.user!.email ?? "",
    adminRole: (session!.user as { role?: string }).role ?? "",
    action: "NOTIFY",
    entity: "Order",
    entityId: params.id,
    metadata: { orderNumber: order.orderNumber, type: "delivered" },
    ipAddress: getClientIp(request),
  });

  return jsonResponse({ success: true });
}
