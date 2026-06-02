import { Resend } from "resend";

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendWelcomeEmail(email: string) {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "hello@msvee.co",
    to: email,
    subject: "Welcome to MsVee Soaps",
    html: `
      <div style="font-family: Georgia, serif; color: #1C1C1C; max-width: 560px; margin: 0 auto;">
        <h1 style="color: #2C4A3E; font-weight: 300;">Welcome to MsVee Soaps</h1>
        <p>Thank you for joining our botanical ritual. You'll be the first to know about new collections, seasonal scents, and artisanal releases.</p>
        <p style="color: #6B5E52;">With warmth,<br/>The MsVee Team</p>
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
    from: process.env.RESEND_FROM_EMAIL || "hello@msvee.co",
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
  orderNumber: string,
  trackingInfo?: string
) {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "hello@msvee.co",
    to: email,
    subject: `Your Order Has Shipped — ${orderNumber}`,
    html: `
      <div style="font-family: Georgia, serif; color: #1C1C1C; max-width: 560px; margin: 0 auto;">
        <h1 style="color: #2C4A3E; font-weight: 300;">On Its Way</h1>
        <p>Order <strong>${orderNumber}</strong> has shipped.</p>
        ${trackingInfo ? `<p>Tracking: ${trackingInfo}</p>` : ""}
        <p style="color: #6B5E52;">Your botanical ritual is en route.</p>
      </div>
    `,
  });
}

export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const resend = getResend();
  const to = process.env.STORE_CONTACT_EMAIL || process.env.RESEND_FROM_EMAIL || "hello@msvee.co";
  if (!resend) {
    console.info("[msvee:contact]", data);
    return;
  }
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "hello@msvee.co",
    to,
    replyTo: data.email,
    subject: `[MsVee Contact] ${data.subject}`,
    html: `
      <div style="font-family: Georgia, serif; color: #1C1C1C;">
        <p><strong>From:</strong> ${data.name} &lt;${data.email}&gt;</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p style="white-space: pre-wrap;">${data.message}</p>
      </div>
    `,
  });
}

export async function sendAdminInvite(email: string, name: string) {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "hello@msvee.co",
    to: email,
    subject: "You've been invited to MsVee Soaps Admin",
    html: `
      <div style="font-family: Georgia, serif; color: #1C1C1C;">
        <h1 style="color: #2C4A3E;">Admin Invitation</h1>
        <p>Hi ${name}, you've been invited to manage MsVee Soaps.</p>
        <p>Sign in at <a href="${process.env.NEXTAUTH_URL}/admin/login">${process.env.NEXTAUTH_URL}/admin/login</a></p>
      </div>
    `,
  });
}
