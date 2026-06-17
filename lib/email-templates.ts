import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import type { ShippingAddress } from "@/lib/checkout";
import { formatShippingAddressBlock } from "@/lib/order-notes";

export type EmailOrderItem = {
  name: string;
  quantity: number;
  price: number;
  image?: string | null;
  /** Product slug or SKU shown in the Item # column. */
  itemNumber?: string;
};

function getSiteUrl(): string {
  return (
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
    "https://www.mvlusciouslather.com"
  );
}

export function toAbsoluteImageUrl(image?: string | null): string | null {
  if (!image?.trim()) return null;
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  const base = getSiteUrl();
  return `${base}${image.startsWith("/") ? image : `/${image}`}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

  const itemsTable = renderShipmentItemsTable(data.items);

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
