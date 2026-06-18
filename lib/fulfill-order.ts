import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { sendOrderConfirmation } from "@/lib/resend";
import { notifyAdminsOfNewOrder, notifyAdminsOfLowStock } from "@/lib/order-notifications";
import { buildOrderConfirmationPayload, refreshCartItemImages } from "@/lib/order-email";
import { LOW_STOCK_THRESHOLD } from "@/lib/admin-inventory";
import { saveOrderToSupabase } from "@/lib/supabase/orders";
import type { ShippingAddress, ValidatedCartItem } from "@/lib/checkout";
import { isDatabaseConfigured } from "@/lib/env";
import { getBundleLineTotal } from "@/lib/bundle-pricing";

export type FulfillOrderInput = {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userId?: string | null;
  shippingAddress: ShippingAddress;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentId: string;
  paymentProvider?: "square" | "stripe";
  purchaseType?: "one_time" | "subscription";
  subscriptionCadence?: "monthly" | "bimonthly" | "quarterly";
  squareSubscriptionId?: string;
  squareCustomerId?: string;
  subscriptionStatus?: "active" | "pending_setup";
  cartItems: ValidatedCartItem[];
  orderNumber?: string;
};

export type FulfillOrderResult = {
  orderNumber: string;
  orderId?: string;
  alreadyExists: boolean;
};

export async function fulfillOrder(
  input: FulfillOrderInput
): Promise<FulfillOrderResult> {
  const paymentProvider = input.paymentProvider ?? "square";

  if (isDatabaseConfigured()) {
    const existing = await prisma.order.findFirst({
      where: { paymentId: input.paymentId },
      select: { id: true, orderNumber: true },
    });
    if (existing) {
      return {
        orderNumber: existing.orderNumber,
        orderId: existing.id,
        alreadyExists: true,
      };
    }
  }

  const orderNumber = input.orderNumber ?? generateOrderNumber();
  const cartItems = await refreshCartItemImages(input.cartItems);

  await saveOrderToSupabase({
    orderNumber,
    userId: input.userId ?? null,
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    subtotal: input.subtotal,
    shipping: input.shipping,
    tax: input.tax,
    total: input.total,
    paymentExternalId: input.paymentId,
    paymentProvider,
    shippingAddress: input.shippingAddress,
    items: cartItems,
  });

  let createdOrderId: string | undefined;
  const newlyLowStock: { name: string; stock: number; slug: string }[] = [];

  if (isDatabaseConfigured()) {
    try {
      const customer = await prisma.customer.upsert({
        where: { email: input.email },
        create: {
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
        },
        update: {
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
        },
      });

      const orderItems = [];
      for (const item of input.cartItems) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        if (product) {
          const lineTotal = getBundleLineTotal(item.price, item.quantity);
          orderItems.push({
            productId: product.id,
            quantity: item.quantity,
            price: Math.round((lineTotal / item.quantity) * 100) / 100,
          });
          const previousStock = product.stock;
          const updated = await prisma.product.update({
            where: { id: product.id },
            data: { stock: { decrement: item.quantity } },
          });
          if (
            previousStock > LOW_STOCK_THRESHOLD &&
            updated.stock <= LOW_STOCK_THRESHOLD
          ) {
            newlyLowStock.push({
              name: updated.name,
              stock: updated.stock,
              slug: updated.slug,
            });
          }
        }
      }

      const created = await prisma.order.create({
        data: {
          orderNumber,
          status: "PROCESSING",
          customerId: customer.id,
          subtotal: input.subtotal,
          shipping: input.shipping,
          tax: input.tax,
          total: input.total,
          paymentId: input.paymentId,
          notes: JSON.stringify({
            shippingAddress: input.shippingAddress,
            supabaseUserId: input.userId,
            paymentProvider,
            purchaseType: input.purchaseType ?? "one_time",
            subscriptionCadence: input.subscriptionCadence,
            squareSubscriptionId: input.squareSubscriptionId,
            squareCustomerId: input.squareCustomerId,
            subscriptionStatus: input.subscriptionStatus,
          }),
          items: { create: orderItems },
        },
      });
      createdOrderId = created.id;
    } catch (error) {
      console.error("[msvee:fulfill-order] Database error:", error);
    }
  }

  const confirmationPayload = buildOrderConfirmationPayload({
    orderNumber,
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    shippingAddress: input.shippingAddress,
    subtotal: input.subtotal,
    shipping: input.shipping,
    tax: input.tax,
    total: input.total,
    cartItems,
  });

  const emailResult = await sendOrderConfirmation(confirmationPayload);
  if (!emailResult.ok) {
    console.error(
      "[msvee:fulfill-order] Order confirmation email failed:",
      emailResult.error
    );
  }

  try {
    await notifyAdminsOfNewOrder({
      orderId: createdOrderId,
      ...confirmationPayload,
      customerName: `${input.firstName} ${input.lastName}`.trim() || input.email,
      phone: input.phone,
      paymentProvider,
    });
  } catch (error) {
    console.error("[msvee:fulfill-order] Admin notification failed:", error);
  }

  if (newlyLowStock.length > 0) {
    try {
      await notifyAdminsOfLowStock(newlyLowStock);
    } catch (error) {
      console.error("[msvee:fulfill-order] Low stock alert failed:", error);
    }
  }

  return { orderNumber, orderId: createdOrderId, alreadyExists: false };
}
