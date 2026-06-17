import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";
import {
  sendAdminNewOrderAlert,
  sendAdminLowStockAlert,
} from "@/lib/resend";
import { sendPushToAllAdmins, type PushPayload } from "@/lib/push-notifications";

import type { OrderConfirmationEmailPayload } from "@/lib/email-templates";

export type NewOrderNotificationInput = OrderConfirmationEmailPayload & {
  orderId?: string;
  customerName: string;
  phone?: string;
  paymentProvider?: string;
};

async function getNotificationSettings() {
  if (!isDatabaseConfigured()) return null;
  try {
    return await prisma.storeSettings.findUnique({ where: { id: "default" } });
  } catch {
    return null;
  }
}

async function getAdminRecipientEmails(storeEmail: string): Promise<string[]> {
  const emails = new Set<string>();
  if (storeEmail) emails.add(storeEmail.toLowerCase());

  const contact = process.env.STORE_CONTACT_EMAIL?.trim();
  if (contact) emails.add(contact.toLowerCase());

  if (isDatabaseConfigured()) {
    try {
      const admins = await prisma.adminUser.findMany({
        where: { active: true },
        select: { email: true },
      });
      for (const admin of admins) {
        emails.add(admin.email.toLowerCase());
      }
    } catch {
      /* ignore */
    }
  }

  return Array.from(emails);
}

export async function notifyAdminsOfNewOrder(
  input: NewOrderNotificationInput
): Promise<void> {
  const settings = await getNotificationSettings();
  const orderUrl = input.orderId
    ? `/admin/orders/${input.orderId}`
    : "/admin/orders?status=PENDING";

  const pushPayload: PushPayload = {
    title: "New order received",
    body: `${input.orderNumber} · $${input.total.toFixed(2)} from ${input.customerName}`,
    url: orderUrl,
    tag: `order-${input.orderNumber}`,
  };

  await sendPushToAllAdmins(pushPayload);

  if (settings?.notifyNewOrder === false) return;

  const recipients = await getAdminRecipientEmails(settings?.email ?? "");
  if (recipients.length === 0) return;

  await sendAdminNewOrderAlert({
    recipients,
    orderNumber: input.orderNumber,
    firstName: input.firstName,
    email: input.email,
    items: input.items,
    subtotal: input.subtotal,
    shipping: input.shipping,
    tax: input.tax,
    total: input.total,
    shippingAddress: input.shippingAddress,
    recipientName: input.recipientName,
    customerName: input.customerName,
    phone: input.phone,
    paymentProvider: input.paymentProvider,
    orderUrl: `${process.env.NEXTAUTH_URL ?? ""}${orderUrl}`,
  });
}

export async function notifyAdminsOfLowStock(
  products: { name: string; stock: number; slug: string }[]
): Promise<void> {
  if (products.length === 0) return;

  const settings = await getNotificationSettings();
  if (settings?.notifyLowStock === false) return;

  const pushPayload: PushPayload = {
    title: "Low stock alert",
    body: `${products.length} product${products.length > 1 ? "s" : ""} need restocking`,
    url: "/admin/inventory",
    tag: "low-stock",
  };

  await sendPushToAllAdmins(pushPayload);

  const recipients = await getAdminRecipientEmails(settings?.email ?? "");
  if (recipients.length === 0) return;

  await sendAdminLowStockAlert({ recipients, products });
}
