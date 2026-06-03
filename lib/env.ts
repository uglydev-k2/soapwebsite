/**
 * Server-side environment helpers.
 * Missing vars in production are the #1 cause of "Application error" on Vercel.
 */

const isProd = process.env.NODE_ENV === "production";

export function getAuthSecret(): string | undefined {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
}

export function requireAuthSecret(): string {
  const secret = getAuthSecret();
  if (!secret) {
    if (isProd) {
      throw new Error(
        "AUTH_SECRET (or NEXTAUTH_SECRET) is required in production. Generate one with: openssl rand -base64 32"
      );
    }
    return "development-secret-do-not-use-in-production";
  }
  return secret;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL;
}

/** Env vars required for full production functionality */
export const REQUIRED_PRODUCTION_ENV = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "NEXTAUTH_URL",
] as const;

/** Env vars optional — features degrade gracefully without them */
export const OPTIONAL_ENV = [
  "NEXTAUTH_SECRET",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "UPLOADTHING_SECRET",
  "UPLOADTHING_APP_ID",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
  "VAPID_SUBJECT",
  "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
] as const;

export function getMissingProductionEnv(): string[] {
  return REQUIRED_PRODUCTION_ENV.filter((key) => !process.env[key]?.trim());
}

export function logMissingEnvWarning(context: string): void {
  const missing = getMissingProductionEnv();
  if (missing.length > 0) {
    console.warn(`[msvee:${context}] Missing env vars: ${missing.join(", ")}`);
  }
}
