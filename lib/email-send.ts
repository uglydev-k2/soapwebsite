import { Resend } from "resend";
import { BRAND_DISPLAY_NAME, BRAND_EMAIL } from "@/lib/brand";

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export function getFromEmail(): string {
  const configured = process.env.RESEND_FROM_EMAIL?.trim();
  if (configured?.includes("<")) return configured;
  const address = configured || BRAND_EMAIL;
  return `${BRAND_DISPLAY_NAME} <${address}>`;
}

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<SendEmailResult> {
  const resend = getResendClient();
  if (!resend) {
    const error = "RESEND_API_KEY is not configured";
    console.error(`[msvee:email] ${error}`);
    return { ok: false, error };
  }

  const { data, error } = await resend.emails.send({
    from: getFromEmail(),
    to: params.to,
    subject: params.subject,
    html: params.html,
    replyTo: params.replyTo,
  });

  if (error) {
    console.error("[msvee:email] Send failed:", error);
    return { ok: false, error: error.message };
  }

  return { ok: true, id: data?.id ?? "" };
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}
