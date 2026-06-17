import { BRAND_DISPLAY_NAME, BRAND_EMAIL, BRAND_SITE_URL } from "@/lib/brand";
import type { ShippingAddress } from "@/lib/checkout";
import { formatShippingAddressBlock } from "@/lib/order-notes";
import { getBundleLineTotal } from "@/lib/bundle-pricing";

export type EmailOrderItem = {
  name: string;
  quantity: number;
  price: number;
  image?: string | null;
  slug?: string;
  fragrance?: string | null;
  categoryLabel?: string;
  /** Product slug or SKU shown in the Item # column. */
  itemNumber?: string;
};

export type OrderConfirmationEmailPayload = {
  orderNumber: string;
  firstName: string;
  email: string;
  items: EmailOrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: ShippingAddress;
  recipientName?: string;
};

function getSiteUrl(): string {
  return (
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
    BRAND_SITE_URL
  );
}

export function toAbsoluteImageUrl(image?: string | null): string | null {
  if (!image?.trim()) return null;
  const trimmed = image.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const base = getSiteUrl();
  return `${base}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

/** Use the same primary image URL stored on the product record (site + cart). */
export function pickProductImage(images?: string[] | null): string | null {
  if (!images?.length) return null;
  const found = images.find((url) => url?.trim());
  return found?.trim() ?? null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function renderEmailProductItems(
  items: EmailOrderItem[],
  heading = "Order summary"
): string {
  if (items.length === 0) return "";

  const siteUrl = getSiteUrl();
  const rows = items
    .map((item) => {
      const lineTotal = getBundleLineTotal(item.price, item.quantity);
      const unitPrice = formatUsd(item.price);
      const imageUrl = toAbsoluteImageUrl(item.image);
      const productUrl = item.slug
        ? `${siteUrl}/collections/${encodeURIComponent(item.slug)}`
        : siteUrl;
      const sku = escapeHtml(
        (item.itemNumber || item.slug?.toUpperCase() || "—").trim()
      );

      const imageCell = imageUrl
        ? `<a href="${escapeHtml(productUrl)}" style="text-decoration:none;"><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(item.name)}" width="64" height="64" style="display:block;width:64px;height:64px;object-fit:cover;border-radius:8px;border:1px solid #e8e2d9;background:#f5f0e8;" /></a>`
        : `<div style="width:64px;height:64px;border-radius:8px;background:linear-gradient(135deg,#3D6454,#2C4A3E);border:1px solid #e8e2d9;"></div>`;

      return `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #e8e2d9;vertical-align:top;width:76px;">${imageCell}</td>
          <td style="padding:16px 12px;border-bottom:1px solid #e8e2d9;vertical-align:top;">
            <p style="margin:0;font-size:14px;font-weight:600;color:#000;text-transform:uppercase;line-height:1.35;">
              <a href="${escapeHtml(productUrl)}" style="color:#000;text-decoration:none;">${escapeHtml(item.name.trim())}</a>
            </p>
            <p style="margin:6px 0 0;font-size:14px;color:#000;">${unitPrice} × ${item.quantity}</p>
            <p style="margin:4px 0 0;font-size:12px;color:#666;">SKU: ${sku}</p>
          </td>
          <td style="padding:16px 0;border-bottom:1px solid #e8e2d9;vertical-align:top;text-align:right;font-size:14px;color:#000;white-space:nowrap;">
            ${formatUsd(lineTotal)}
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    <p style="margin:0 0 12px;font-size:14px;font-weight:bold;color:#000;">${escapeHtml(heading)}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin:0 0 16px;">
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderOrderConfirmationItems(items: EmailOrderItem[]): string {
  return renderEmailProductItems(items, "Order summary");
}

export type DeliveredEmailPayload = {
  orderNumber: string;
  firstName: string;
  email: string;
  items: EmailOrderItem[];
  deliveredAt?: Date;
  shippingAddress?: ShippingAddress;
  recipientName?: string;
};

export function renderDeliveredEmailHtml(data: DeliveredEmailPayload): string {
  const brand = escapeHtml(BRAND_DISPLAY_NAME);
  const orderNumber = escapeHtml(data.orderNumber);
  const firstName = escapeHtml(data.firstName);
  const siteUrl = getSiteUrl();
  const deliveredDate = new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(data.deliveredAt ?? new Date());

  let addressBlock = "";
  if (data.shippingAddress) {
    const lines = formatShippingAddressBlock(
      data.shippingAddress,
      data.recipientName
    );
    addressBlock = `
      <p style="margin:0 0 4px;font-size:14px;font-weight:bold;color:#000;">Delivered to:</p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#000;">
        ${lines.map((line) => escapeHtml(line)).join("<br />")}
      </p>
    `;
  }

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#000;max-width:640px;margin:0 auto;padding:16px 0;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:bold;color:#000;">Your order has been delivered</p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#000;">
        Hi ${firstName}, your order <strong>#${orderNumber}</strong> from <strong>${brand}</strong> was delivered on ${deliveredDate}.
        We hope you enjoy your botanical ritual!
      </p>
      ${addressBlock}
      ${renderEmailProductItems(data.items, "Items in this delivery")}
      <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#000;">
        <a href="${siteUrl}/collections" style="color:#0000EE;text-decoration:underline;">Shop our collections</a>
        for your next ritual.
      </p>
      <p style="margin:0 0 8px;font-size:14px;line-height:1.5;color:#000;">
        Questions about your order? Reply to this email or contact us at
        <a href="mailto:${escapeHtml(BRAND_EMAIL)}" style="color:#0000EE;text-decoration:underline;">${escapeHtml(BRAND_EMAIL)}</a>.
      </p>
      <p style="margin:16px 0 8px;font-size:14px;font-weight:bold;color:#000;">
        Thank you for your business and we look forward to serving you in the future!
      </p>
      <p style="margin:0;font-size:14px;color:#000;">------------------------------------</p>
    </div>
  `;
}

function renderOrderTotalsTable(data: {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 16px;font-size:14px;color:#000;">
      <tr>
        <td style="padding:4px 0;">Subtotal</td>
        <td style="padding:4px 0;text-align:right;">${formatUsd(data.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;">Shipping</td>
        <td style="padding:4px 0;text-align:right;">${formatUsd(data.shipping)}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;">Tax</td>
        <td style="padding:4px 0;text-align:right;">${formatUsd(data.tax)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0 4px;font-weight:bold;border-top:1px solid #000;">Total</td>
        <td style="padding:8px 0 4px;text-align:right;font-weight:bold;border-top:1px solid #000;">${formatUsd(data.total)}</td>
      </tr>
    </table>
  `;
}

export type AdminNewOrderEmailPayload = OrderConfirmationEmailPayload & {
  customerName: string;
  phone?: string;
  orderUrl: string;
  placedAt?: Date;
  paymentProvider?: string;
};

export function renderAdminNewOrderEmailHtml(
  data: AdminNewOrderEmailPayload
): string {
  const brand = escapeHtml(BRAND_DISPLAY_NAME);
  const orderNumber = escapeHtml(data.orderNumber);
  const customerName = escapeHtml(data.customerName);
  const customerEmail = escapeHtml(data.email);
  const phone = data.phone?.trim() ? escapeHtml(data.phone.trim()) : "";
  const paymentLabel = escapeHtml(
    data.paymentProvider === "stripe" ? "Stripe" : "Square"
  );
  const placedAt = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(data.placedAt ?? new Date());

  const addressLines = formatShippingAddressBlock(
    data.shippingAddress,
    data.recipientName
  );

  const phoneLine = phone
    ? `<p style="margin:0 0 4px;font-size:14px;color:#000;"><strong>Phone:</strong> ${phone}</p>`
    : "";

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#000;max-width:640px;margin:0 auto;padding:16px 0;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:#3D6454;">${brand}</p>
      <p style="margin:0 0 8px;font-size:20px;font-weight:bold;color:#000;">New order received</p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#000;">
        Order <strong>#${orderNumber}</strong> · <strong>${formatUsd(data.total)}</strong> · ${escapeHtml(placedAt)}
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;border:1px solid #e8e2d9;background:#faf8f5;">
        <tr>
          <td style="padding:16px;">
            <p style="margin:0 0 8px;font-size:14px;font-weight:bold;color:#000;">Customer</p>
            <p style="margin:0 0 4px;font-size:14px;color:#000;"><strong>${customerName}</strong></p>
            <p style="margin:0 0 4px;font-size:14px;color:#000;">
              <a href="mailto:${customerEmail}" style="color:#0000EE;text-decoration:underline;">${customerEmail}</a>
            </p>
            ${phoneLine}
            <p style="margin:8px 0 0;font-size:13px;color:#555;">Paid via ${paymentLabel}</p>
          </td>
        </tr>
      </table>
      ${renderEmailProductItems(data.items, "Items ordered")}
      ${renderOrderTotalsTable(data)}
      <p style="margin:0 0 4px;font-size:14px;font-weight:bold;color:#000;">Ship to:</p>
      <p style="margin:0 0 20px;font-size:14px;line-height:1.5;color:#000;">
        ${addressLines.map((line) => escapeHtml(line)).join("<br />")}
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
        <tr>
          <td style="background:#2C4A3E;border-radius:4px;">
            <a href="${escapeHtml(data.orderUrl)}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;">View order in admin →</a>
          </td>
        </tr>
      </table>
      <p style="margin:0;font-size:12px;color:#666;">Payment confirmed — ready to pack and ship.</p>
    </div>
  `;
}

export function renderOrderConfirmationEmailHtml(
  data: OrderConfirmationEmailPayload
): string {
  const brand = escapeHtml(BRAND_DISPLAY_NAME);
  const orderNumber = escapeHtml(data.orderNumber);
  const firstName = escapeHtml(data.firstName);
  const siteUrl = getSiteUrl();

  const addressLines = formatShippingAddressBlock(
    data.shippingAddress,
    data.recipientName
  );

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#000;max-width:640px;margin:0 auto;padding:16px 0;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:bold;color:#000;">Thanks for your order</p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#000;">
        Thank you for your order from <strong>${brand}</strong>!
      </p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#000;">
        Hi ${firstName}, we've received order <strong>#${orderNumber}</strong> and are preparing it for shipment.
        You'll get another email when your order ships.
      </p>
      ${renderOrderConfirmationItems(data.items)}
      ${renderOrderTotalsTable(data)}
      <p style="margin:0 0 4px;font-size:14px;font-weight:bold;color:#000;">Shipping to:</p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#000;">
        ${addressLines.map((line) => escapeHtml(line)).join("<br />")}
      </p>
      <p style="margin:0 0 8px;font-size:14px;line-height:1.5;color:#000;">
        Questions about your order? Reply to this email or contact us at
        <a href="mailto:${escapeHtml(BRAND_EMAIL)}" style="color:#0000EE;text-decoration:underline;">${escapeHtml(BRAND_EMAIL)}</a>.
      </p>
      <p style="margin:16px 0 8px;font-size:14px;font-weight:bold;color:#000;">
        Thank you for your business and we look forward to serving you in the future!
      </p>
      <p style="margin:0;font-size:14px;color:#000;">------------------------------------</p>
      <p style="margin:12px 0 0;font-size:12px;color:#666;">
        <a href="${siteUrl}" style="color:#0000EE;text-decoration:underline;">${escapeHtml(BRAND_SITE_URL.replace(/^https?:\/\//, ""))}</a>
      </p>
    </div>
  `;
}

function formatShipDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function renderShipmentItemsTable(items: EmailOrderItem[]): string {
  if (items.length === 0) return "";

  const rows = items
    .map((item) => {
      const itemNumber = escapeHtml(item.itemNumber || "—");
      const description = escapeHtml(item.name);
      return `
        <tr>
          <td style="padding:8px 12px 8px 0;vertical-align:top;font-size:14px;color:#000;">${itemNumber}</td>
          <td style="padding:8px 12px;vertical-align:top;font-size:14px;color:#000;">${description}</td>
          <td style="padding:8px 0 8px 12px;vertical-align:top;font-size:14px;color:#000;text-align:right;">${item.quantity}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <p style="margin:24px 0 12px;font-size:14px;color:#000;">This shipment includes the following items:</p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
      <thead>
        <tr>
          <th align="left" style="padding:8px 12px 8px 0;border-bottom:1px solid #000;font-size:14px;font-weight:bold;color:#000;">Item #</th>
          <th align="left" style="padding:8px 12px;border-bottom:1px solid #000;font-size:14px;font-weight:bold;color:#000;">Description</th>
          <th align="right" style="padding:8px 0 8px 12px;border-bottom:1px solid #000;font-size:14px;font-weight:bold;color:#000;">Qty</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

export function renderShippingEmailHtml(data: {
  orderNumber: string;
  items: EmailOrderItem[];
  shippedAt?: Date;
  carrier?: string;
  carrierService?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  shippingAddress?: ShippingAddress;
  recipientName?: string;
}): string {
  const brand = escapeHtml(BRAND_DISPLAY_NAME);
  const orderNumber = escapeHtml(data.orderNumber);
  const shipDate = formatShipDate(data.shippedAt ?? new Date());
  const carrier = escapeHtml(data.carrier || "USPS");
  const carrierService = escapeHtml(data.carrierService || "USPS Ground Advantage");

  const intro = `
    <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#000;">
      Thank you for your order from <strong>${brand}</strong>! We wanted to let you know that your order
      (#${orderNumber}) was shipped via ${carrier}, ${carrierService} on ${shipDate}. You can track your
      package at any time using the link below.
    </p>
  `;

  let addressBlock = "";
  if (data.shippingAddress) {
    const lines = formatShippingAddressBlock(
      data.shippingAddress,
      data.recipientName
    );
    addressBlock = `
      <p style="margin:0 0 4px;font-size:14px;font-weight:bold;color:#000;">Shipped To:</p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#0000EE;">
        ${lines.map((line) => escapeHtml(line)).join("<br />")}
      </p>
    `;
  }

  let trackingBlock = "";
  if (data.trackingNumber && data.trackingUrl) {
    const trackingNumber = escapeHtml(data.trackingNumber);
    const trackingUrl = escapeHtml(data.trackingUrl);
    trackingBlock = `
      <p style="margin:0 0 16px;font-size:14px;color:#000;">
        <strong>Track Your Shipment:</strong>
        <a href="${trackingUrl}" style="color:#0000EE;text-decoration:underline;">${trackingNumber}</a>
      </p>
    `;
  } else if (data.trackingNumber) {
    trackingBlock = `
      <p style="margin:0 0 16px;font-size:14px;color:#000;">
        <strong>Track Your Shipment:</strong> ${escapeHtml(data.trackingNumber)}
      </p>
    `;
  }

  const itemsTable = renderEmailProductItems(data.items, "Order summary");

  const footer = `
    <p style="margin:24px 0 8px;font-size:14px;font-weight:bold;color:#000;">
      Thank you for your business and we look forward to serving you in the future!
    </p>
    <p style="margin:0;font-size:14px;color:#000;">------------------------------------</p>
  `;

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#000;max-width:640px;margin:0 auto;padding:16px 0;">
      ${intro}
      ${addressBlock}
      ${trackingBlock}
      ${itemsTable}
      ${footer}
    </div>
  `;
}

/** @deprecated Product-image layout kept for reference; shipping emails use the table layout above. */
export function renderOrderItemsHtml(items: EmailOrderItem[]): string {
  return renderShipmentItemsTable(items);
}
