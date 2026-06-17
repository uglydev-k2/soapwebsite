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

function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function renderOrderConfirmationItems(items: EmailOrderItem[]): string {
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

      const imageCell = imageUrl
        ? `<a href="${escapeHtml(productUrl)}" style="text-decoration:none;"><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(item.name)}" width="80" height="80" style="display:block;width:80px;height:80px;object-fit:cover;border:1px solid #e8e2d9;background:#f5f0e8;" /></a>`
        : `<div style="width:80px;height:80px;background:linear-gradient(135deg,#3D6454,#2C4A3E);border:1px solid #e8e2d9;"></div>`;

      const metaParts: string[] = [];
      if (item.categoryLabel) metaParts.push(escapeHtml(item.categoryLabel));
      if (item.fragrance) metaParts.push(escapeHtml(item.fragrance));
      const metaLine = metaParts.length
        ? `<p style="margin:4px 0 0;font-size:12px;color:#555;">${metaParts.join(" · ")}</p>`
        : "";

      return `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #e8e2d9;vertical-align:top;width:92px;">${imageCell}</td>
          <td style="padding:16px 0 16px 16px;border-bottom:1px solid #e8e2d9;vertical-align:top;">
            <p style="margin:0;font-size:15px;font-weight:bold;color:#000;">
              <a href="${escapeHtml(productUrl)}" style="color:#000;text-decoration:none;">${escapeHtml(item.name)}</a>
            </p>
            ${metaLine}
            <p style="margin:8px 0 0;font-size:13px;color:#000;">
              Qty ${item.quantity} · ${unitPrice} each · <strong>${formatUsd(lineTotal)}</strong>
            </p>
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    <p style="margin:0 0 8px;font-size:14px;font-weight:bold;color:#000;">Order summary</p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin:0 0 16px;">
      <tbody>${rows}</tbody>
    </table>
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
