export type EmailOrderItem = {
  name: string;
  quantity: number;
  price: number;
  image?: string | null;
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

function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function renderOrderItemsHtml(items: EmailOrderItem[]): string {
  if (items.length === 0) return "";

  const rows = items
    .map((item) => {
      const imageUrl = toAbsoluteImageUrl(item.image);
      const lineTotal = formatUsd(item.price * item.quantity);
      const imageCell = imageUrl
        ? `<img src="${imageUrl}" alt="${escapeHtml(item.name)}" width="72" height="72" style="display:block;width:72px;height:72px;object-fit:cover;border-radius:4px;background:#f5f0e8;" />`
        : `<div style="width:72px;height:72px;background:linear-gradient(135deg,#3D6454,#2C4A3E);border-radius:4px;"></div>`;

      return `
        <tr>
          <td style="padding:12px 0;vertical-align:top;width:84px;">${imageCell}</td>
          <td style="padding:12px 0 12px 16px;vertical-align:top;">
            <p style="margin:0 0 4px;font-size:15px;font-weight:500;color:#1f342c;">${escapeHtml(item.name)}</p>
            <p style="margin:0;font-size:13px;color:#4f4740;">Qty ${item.quantity} · ${lineTotal}</p>
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0;border-top:1px solid #e8e2d9;border-bottom:1px solid #e8e2d9;">
      <tbody>${rows}</tbody>
    </table>
  `;
}

export function renderShippingEmailHtml(data: {
  orderNumber: string;
  items: EmailOrderItem[];
  trackingInfo?: string;
}): string {
  const siteUrl = getSiteUrl();
  const itemsHtml = renderOrderItemsHtml(data.items);
  const trackingBlock = data.trackingInfo
    ? `<p style="margin:16px 0;padding:14px 16px;background:#f5f0e8;border-radius:6px;font-size:14px;color:#1f342c;"><strong>Tracking:</strong> ${escapeHtml(data.trackingInfo)}</p>`
    : "";

  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; max-width: 560px; margin: 0 auto; padding: 8px 0;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#963f1a;">mvlusciouslather</p>
      <h1 style="color: #1f342c; font-weight: 400; font-size: 28px; margin: 0 0 8px;">On Its Way</h1>
      <p style="margin:0 0 4px;font-size:16px;line-height:1.6;">Order <strong>${escapeHtml(data.orderNumber)}</strong> has shipped.</p>
      <p style="margin:0 0 8px;font-size:15px;color:#4f4740;">Your botanical ritual is en route.</p>
      ${trackingBlock}
      ${itemsHtml}
      <p style="margin:24px 0 0;font-size:14px;color:#4f4740;">
        Questions? Reply to this email or visit
        <a href="${siteUrl}" style="color:#963f1a;text-decoration:none;">${siteUrl.replace(/^https?:\/\//, "")}</a>.
      </p>
    </div>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
