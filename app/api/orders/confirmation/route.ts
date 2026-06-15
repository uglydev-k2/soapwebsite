import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { getSupabaseOrderByPaymentId } from "@/lib/supabase/orders";
import { isDatabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const paymentId =
    request.nextUrl.searchParams.get("payment_id") ||
    request.nextUrl.searchParams.get("session_id");

  if (!paymentId) {
    return errorResponse("Missing payment_id", 400);
  }

  const supabaseOrder = await getSupabaseOrderByPaymentId(paymentId);
  if (supabaseOrder) {
    return jsonResponse({
      source: "supabase",
      orderNumber: supabaseOrder.order_number,
      email: supabaseOrder.email,
      firstName: supabaseOrder.first_name,
      lastName: supabaseOrder.last_name,
      status: supabaseOrder.status,
      subtotal: Number(supabaseOrder.subtotal),
      shipping: Number(supabaseOrder.shipping),
      tax: Number(supabaseOrder.tax),
      total: Number(supabaseOrder.total),
      shippingAddress: supabaseOrder.shipping_address,
      items: supabaseOrder.order_items.map((item) => ({
        name: item.product_name,
        quantity: item.quantity,
        price: Number(item.unit_price),
        lineTotal: Number(item.line_total),
      })),
      createdAt: supabaseOrder.created_at,
    });
  }

  if (isDatabaseConfigured()) {
    const order = await prisma.order.findFirst({
      where: { paymentId },
      include: {
        items: { include: { product: { select: { name: true } } } },
        customer: true,
      },
    });

    if (order) {
      let shippingAddress = null;
      try {
        shippingAddress = order.notes ? JSON.parse(order.notes).shippingAddress : null;
      } catch {
        /* ignore */
      }

      return jsonResponse({
        source: "prisma",
        orderNumber: order.orderNumber,
        email: order.customer.email,
        firstName: order.customer.firstName,
        lastName: order.customer.lastName,
        status: order.status.toLowerCase(),
        subtotal: order.subtotal,
        shipping: order.shipping,
        tax: order.tax,
        total: order.total,
        shippingAddress,
        items: order.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
          lineTotal: item.price * item.quantity,
        })),
        createdAt: order.createdAt.toISOString(),
      });
    }
  }

  return errorResponse("Order not found yet. It may still be processing.", 404);
}
