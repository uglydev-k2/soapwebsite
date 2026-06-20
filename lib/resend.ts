import {
  renderAdminNewOrderEmailHtml,
  renderDeliveredEmailHtml,
  renderOrderConfirmationEmailHtml,
  renderShippingEmailHtml,
  type AdminNewOrderEmailPayload,
  type OrderConfirmationEmailPayload,
} from "@/lib/email-templates";
import { sendEmail, type SendEmailResult } from "@/lib/email-send";
import { BRAND_EMAIL } from "@/lib/brand";

export async function sendWelcomeEmail(email: string): Promise<SendEmailResult> {
  return sendEmail({
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
  payload: OrderConfirmationEmailPayload
): Promise<SendEmailResult> {
  return sendEmail({
    to: payload.email,
    subject: `Thanks for your order — ${payload.orderNumber}`,
    html: renderOrderConfirmationEmailHtml(payload),
    replyTo: BRAND_EMAIL,
  });
}

export async function sendTrackingEmail(
  email: string,
  payload: Parameters<typeof renderShippingEmailHtml>[0]
): Promise<SendEmailResult> {
  return sendEmail({
    to: email,
    subject: `Your Order Has Shipped — ${payload.orderNumber}`,
    html: renderShippingEmailHtml(payload),
    replyTo: BRAND_EMAIL,
  });
}

export async function sendDeliveredEmail(
  payload: Parameters<typeof renderDeliveredEmailHtml>[0]
): Promise<SendEmailResult> {
  return sendEmail({
    to: payload.email,
    subject: `Your Order Has Been Delivered — ${payload.orderNumber}`,
    html: renderDeliveredEmailHtml(payload),
    replyTo: BRAND_EMAIL,
  });
}

export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const to = process.env.STORE_CONTACT_EMAIL || process.env.RESEND_FROM_EMAIL || BRAND_EMAIL;
  const result = await sendEmail({
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
  if (!result.ok) console.info("[msvee:contact]", data);
  return result;
}

export async function sendStockNotifyRequest(data: {
  email: string;
  productName: string;
  productSlug: string;
  scentLabel?: string;
}) {
  const to = process.env.STORE_CONTACT_EMAIL || process.env.RESEND_FROM_EMAIL || BRAND_EMAIL;
  const scentLine = data.scentLabel ? ` (${data.scentLabel})` : "";
  const result = await sendEmail({
    to,
    subject: `[Back in stock] ${data.productName}${scentLine}`,
    html: `<p><strong>${data.email}</strong> wants to know when <strong>${data.productName}${scentLine}</strong> (${data.productSlug}) is back in stock.</p>`,
  });
  if (!result.ok) console.info("[msvee:stock-notify]", data);
  return result;
}

export async function sendBackInStockEmail(data: {
  email: string;
  productName: string;
  productUrl: string;
}) {
  const siteUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? "";
  return sendEmail({
    to: data.email,
    subject: `${data.productName} is back in stock`,
    html: `
      <div style="font-family: Georgia, serif; color: #1C1C1C; max-width: 560px; margin: 0 auto;">
        <h1 style="color: #2C4A3E; font-weight: 400;">Good news — it's back</h1>
        <p><strong>${data.productName}</strong> is back in stock at mvlusciouslather.</p>
        <p><a href="${data.productUrl || siteUrl}" style="color:#963f1a;">Shop now →</a></p>
      </div>
    `,
    replyTo: BRAND_EMAIL,
  });
}

export async function sendReorderEmail(data: {
  email: string;
  firstName: string;
  orderNumber: string;
  items: { name: string; slug?: string; quantity: number }[];
}) {
  const siteUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? "";
  const list = data.items
    .map((item) => {
      const href = item.slug ? `${siteUrl}/collections/${item.slug}` : `${siteUrl}/collections`;
      return `<li><a href="${href}" style="color:#963f1a;">${item.name}</a> × ${item.quantity}</li>`;
    })
    .join("");

  return sendEmail({
    to: data.email,
    subject: `Ready for your next ritual? — ${data.orderNumber}`,
    html: `
      <div style="font-family: Georgia, serif; color: #1C1C1C; max-width: 560px; margin: 0 auto;">
        <h1 style="color: #2C4A3E; font-weight: 400;">Time to restock</h1>
        <p>Hi ${data.firstName}, hope you're loving your last order. Reorder your favorites in one click:</p>
        <ul style="line-height: 1.8;">${list}</ul>
        <p><a href="${siteUrl}/collections" style="color:#963f1a;">Browse all collections →</a></p>
      </div>
    `,
    replyTo: BRAND_EMAIL,
  });
}

export async function sendWholesaleInquiry(data: {
  businessName: string;
  contactName: string;
  email: string;
  website?: string;
  message: string;
}) {
  const to = process.env.STORE_CONTACT_EMAIL || process.env.RESEND_FROM_EMAIL || BRAND_EMAIL;
  const result = await sendEmail({
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
  if (!result.ok) console.info("[msvee:wholesale]", data);
  return result;
}

export async function sendAdminInvite(email: string, name: string) {
  return sendEmail({
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

export async function sendAdminNewOrderAlert(
  data: AdminNewOrderEmailPayload & { recipients: string[] }
) {
  const { recipients, ...orderData } = data;
  if (recipients.length === 0) {
    console.info("[msvee:new-order-alert]", orderData);
    return { ok: false as const, error: "No recipients" };
  }

  const siteUrl = process.env.NEXTAUTH_URL ?? "";
  const href = orderData.orderUrl.startsWith("http")
    ? orderData.orderUrl
    : `${siteUrl}${orderData.orderUrl}`;

  const payload: AdminNewOrderEmailPayload = {
    ...orderData,
    orderUrl: href,
  };

  return sendEmail({
    to: recipients,
    subject: `[New Order] ${payload.orderNumber} — $${payload.total.toFixed(2)}`,
    html: renderAdminNewOrderEmailHtml(payload),
    replyTo: payload.email,
  });
}

export async function sendAdminLowStockAlert(data: {
  recipients: string[];
  products: { name: string; stock: number; slug: string }[];
}) {
  if (data.recipients.length === 0) {
    console.info("[msvee:low-stock-alert]", data);
    return { ok: false as const, error: "No recipients" };
  }

  const siteUrl = process.env.NEXTAUTH_URL ?? "";
  const list = data.products
    .map((p) => `<li>${p.name} — ${p.stock} left</li>`)
    .join("");

  return sendEmail({
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
