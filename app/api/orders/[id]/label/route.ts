import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, jsonResponse, errorResponse } from "@/lib/api-helpers";
import { logAdminAction } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";
import { mergeOrderNotes, parseOrderNotes } from "@/lib/order-notes";
import { getOrderWeightOz } from "@/lib/order-weight";
import {
  getDefaultParcel,
  getShipFromAddress,
  isShippoConfigured,
} from "@/lib/ship-from";
import { createShippingLabel, ShippoError } from "@/lib/shippo";
import { sendTrackingEmail } from "@/lib/resend";
import { buildShippingEmailPayload } from "@/lib/shipping-email";

async function loadOrder(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      items: {
        include: {
          product: {
            select: {
              category: true,
              name: true,
              slug: true,
              weightOz: true,
            },
          },
        },
      },
    },
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin("orders:read");
  if (error) return error;

  const order = await loadOrder(params.id);
  if (!order) return errorResponse("Order not found", 404);

  const meta = parseOrderNotes(order.notes);
  const { weightOz, billingTier } = getOrderWeightOz(order.items);

  return jsonResponse({
    configured: isShippoConfigured() && Boolean(getShipFromAddress()),
    labelUrl: meta.labelUrl ?? null,
    trackingNumber: meta.trackingNumber ?? null,
    carrier: meta.carrier ?? "USPS",
    service: meta.shippingService ?? null,
    weightOz: meta.shippingWeightOz ?? weightOz,
    billingTier: meta.shippingBillingTier ?? billingTier,
    shippingAddress: meta.shippingAddress ?? null,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAdmin("orders:write");
  if (error) return error;

  if (!isShippoConfigured()) {
    return errorResponse(
      "Shipping labels are not configured. Add SHIPPO_API_TOKEN to your environment.",
      503
    );
  }

  const shipFrom = getShipFromAddress();
  if (!shipFrom) {
    return errorResponse(
      "Ship-from address is not configured. Add SHIP_FROM_* environment variables.",
      503
    );
  }

  const body = await request.json().catch(() => ({}));
  const markShipped = body.markShipped !== false;
  const sendEmail = body.sendEmail !== false;

  const order = await loadOrder(params.id);
  if (!order) return errorResponse("Order not found", 404);

  const meta = parseOrderNotes(order.notes);
  if (meta.labelUrl && meta.trackingNumber && !body.force) {
    return jsonResponse({
      labelUrl: meta.labelUrl,
      trackingNumber: meta.trackingNumber,
      carrier: meta.carrier ?? "USPS",
      service: meta.shippingService ?? null,
      alreadyExists: true,
    });
  }

  const shippingAddress = meta.shippingAddress;
  if (!shippingAddress) {
    return errorResponse("This order has no shipping address on file.", 400);
  }

  const { weightOz, billingTier } = getOrderWeightOz(order.items);
  const recipientName =
    `${order.customer.firstName} ${order.customer.lastName}`.trim() ||
    order.customer.email;

  try {
    const label = await createShippingLabel({
      shipFrom,
      shipTo: shippingAddress,
      recipientName,
      weightOz,
      parcel: getDefaultParcel(),
      orderNumber: order.orderNumber,
    });

    const notes = mergeOrderNotes(order.notes, {
      trackingNumber: label.trackingNumber,
      carrier: label.carrier,
      labelUrl: label.labelUrl,
      shippoTransactionId: label.transactionId,
      shippingService: label.service,
      shippingWeightOz: label.weightOz,
      shippingBillingTier: billingTier,
      labelCreatedAt: new Date().toISOString(),
    });

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        notes,
        status: markShipped ? "SHIPPED" : order.status,
      },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });

    if (markShipped && sendEmail && updated.customer.email) {
      await sendTrackingEmail(
        updated.customer.email,
        buildShippingEmailPayload(updated, {
          trackingInfo: label.trackingNumber,
        })
      );
    }

    await logAdminAction({
      adminId: session!.user!.id,
      adminEmail: session!.user!.email ?? "",
      adminRole: (session!.user as { role?: string }).role ?? "",
      action: "CREATE",
      entity: "ShippingLabel",
      entityId: order.id,
      metadata: {
        orderNumber: order.orderNumber,
        trackingNumber: label.trackingNumber,
        carrier: label.carrier,
        service: label.service,
        rateAmount: label.rateAmount,
      },
      ipAddress: getClientIp(request),
    });

    return jsonResponse({
      labelUrl: label.labelUrl,
      trackingNumber: label.trackingNumber,
      carrier: label.carrier,
      service: label.service,
      rateAmount: label.rateAmount,
      weightOz: label.weightOz,
      billingTier,
      status: updated.status,
      alreadyExists: false,
    });
  } catch (err) {
    const message =
      err instanceof ShippoError
        ? err.message
        : "Failed to create shipping label.";
    return errorResponse(message, 502);
  }
}
