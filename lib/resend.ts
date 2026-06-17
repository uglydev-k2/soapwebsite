import { Resend } from "resend";
import {
  renderShippingEmailHtml,
} from "@/lib/email-templates";

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendWelcomeEmail(email: string) {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "hello@mvlusciouslather.com",
    to: email,
    subject: "Welcome to mvlusciouslather",
    html: `
      <div style="font-family: Georgia, serif; color: #1C1C1C; max-width: 560px; margin: 0 auto;">
        <h1 style="color: #2C4A3E; font-weight: 300;">Welcome to mvlusciouslather</h1>
        <p>Thank you for joining our botanical ritual. You'll be the first to know about new collections, seasonal scents, and artisanal releases.</p>
        <p style="color: #6B5E52;">With warmth,<br/>The mvlusciouslather team</p>
      </div>
    `,
  });
}

export async function sendOrderConfirmation(
  email: string,
  orderNumber: string,
  total: number
) {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "hello@mvlusciouslather.com",
    to: email,
    subject: `Order Confirmed — ${orderNumber}`,
    html: `
      <div style="font-family: Georgia, serif; color: #1C1C1C; max-width: 560px; margin: 0 auto;">
        <h1 style="color: #2C4A3E; font-weight: 300;">Your Ritual Awaits</h1>
        <p>Order <strong>${orderNumber}</strong> has been confirmed.</p>
        <p>Total: <strong>$${total.toFixed(2)}</strong></p>
        <p style="color: #6B5E52;">We'll notify you when your order ships.</p>
      </div>
    `,
  });
}

export async function sendTrackingEmail(
  email: string,
  payload: Parameters<typeof renderShippingEmailHtml>[0]
) {
  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "hello@mvlusciouslather.com",
    to: email,
    subject: `Your Order Has Shipped — ${payload.orderNumber}`,
    html: renderShippingEmailHtml(payload),
  });
}

export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const resend = getResend();
  const to = process.env.STORE_CONTACT_EMAIL || process.env.RESEND_FROM_EMAIL || "hello@mvlusciouslather.com";
  if (!resend) {
    console.info("[msvee:contact]", data);
    return;
  }
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "hello@mvlusciouslather.com",
    to,
    replyTo: data.email,
    subject: `[mvlusciouslather Contact] ${data.subject}`,
    html: `
      <div style="font-family: Georgia, serif; color: #1C1C1C;">
        <p><strong>From:</strong> ${data.name} &lt;${data.email}&gt;</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p style="white-space: pre-wrap;">${data.message}</p>
      </div>
    `,
  });
}

export async function sendStockNotifyRequest(data: {
  email: string;
  productName: string;
  productSlug: string;
}) {
  const resend = getResend();
  const to = process.env.STORE_CONTACT_EMAIL || process.env.RESEND_FROM_EMAIL || "hello@mvlusciouslather.com";
  if (!resend) {
    console.info("[msvee:stock-notify]", data);
    return;
  }
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "hello@mvlusciouslather.com",
    to,
    subject: `[Back in stock] ${data.productName}`,
    html: `<p><strong>${data.email}</strong> wants to know when <strong>${data.productName}</strong> (${data.productSlug}) is back in stock.</p>`,
  });
}

export async function sendWholesaleInquiry(data: {
  businessName: string;
  contactName: string;
  email: string;
  website?: string;
  message: string;
}) {
  const resend = getResend();
  const to = process.env.STORE_CONTACT_EMAIL || process.env.RESEND_FROM_EMAIL || "hello@mvlusciouslather.com";
  if (!resend) {
    console.info("[msvee:wholesale]", data);
    return;
  }
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "hello@mvlusciouslather.com",
    to,
    replyTo: data.email,
    subject: `[Wholesale] ${data.businessName}`,
    html: `
      <p><strong>Business:</strong> ${data.businessName}</p>
      <p><strong>Contact:</strong> ${data.contactName} &lt;${data.email}&gt;</p>
      ${data.website ? `<p><strong>Website:</strong> ${data.website}</p>` : ""}
      <p style="white-space: pre-wrap;">${data.message}</p>
    `,
  });
}

export async function sendAdminInvite(email: string, name: string) {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "hello@mvlusciouslather.com",
    to: email,
    subject: "You've been invited to mvlusciouslather Admin",
    html: `
      <div style="font-family: Georgia, serif; color: #1C1C1C;">
        <h1 style="color: #2C4A3E;">Admin Invitation</h1>
        <p>Hi ${name}, you've been invited to manage mvlusciouslather.</p>
        <p>Sign in at <a href="${process.env.NEXTAUTH_URL}/admin/login">${process.env.NEXTAUTH_URL}/admin/login</a></p>
      </div>
    `,
  });
}

export async function sendAdminNewOrderAlert(data: {
  recipients: string[];
  orderNumber: string;
  total: number;
  customerEmail: string;
  customerName: string;
  itemCount: number;
  orderUrl: string;
}) {
  const resend = getResend();
  if (!resend || data.recipients.length === 0) {
    console.info("[msvee:new-order-alert]", data);
    return;
  }

  const siteUrl = process.env.NEXTAUTH_URL ?? "";
  const href = data.orderUrl.startsWith("http")
    ? data.orderUrl
    : `${siteUrl}${data.orderUrl}`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "hello@mvlusciouslather.com",
    to: data.recipients,
    subject: `[New Order] ${data.orderNumber} — $${data.total.toFixed(2)}`,
    html: `
      <div style="font-family: Georgia, serif; color: #1C1C1C; max-width: 560px; margin: 0 auto;">
        <h1 style="color: #2C4A3E; font-weight: 500;">New Order Received</h1>
        <p><strong>${data.orderNumber}</strong> just came in.</p>
        <ul style="color: #3a3530; line-height: 1.7;">
          <li>Customer: ${data.customerName} (${data.customerEmail})</li>
          <li>Items: ${data.itemCount}</li>
          <li>Total: <strong>$${data.total.toFixed(2)}</strong></li>
        </ul>
        <p><a href="${href}" style="color: #963f1a;">Open order in admin →</a></p>
      </div>
    `,
  });
}

export async function sendAdminLowStockAlert(data: {
  recipients: string[];
  products: { name: string; stock: number; slug: string }[];
}) {
  const resend = getResend();
  if (!resend || data.recipients.length === 0) {
    console.info("[msvee:low-stock-alert]", data);
    return;
  }

  const siteUrl = process.env.NEXTAUTH_URL ?? "";
  const list = data.products
    .map((p) => `<li>${p.name} — ${p.stock} left</li>`)
    .join("");

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "hello@mvlusciouslather.com",
    to: data.recipients,
    subject: `[Low Stock] ${data.products.length} product${data.products.length > 1 ? "s" : ""} need attention`,
    html: `
      <div style="font-family: Georgia, serif; color: #1C1C1C; max-width: 560px;">
        <h1 style="color: #2C4A3E; font-weight: 500;">Low Stock Alert</h1>
        <ul style="line-height: 1.7;">${list}</ul>
        <p><a href="${siteUrl}/admin/inventory" style="color: #963f1a;">Review inventory →</a></p>
      </div>
    `,
  });
}
