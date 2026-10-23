/** Vercel env `type` hints for scripts that sync env vars. */

/** Must be marked sensitive/encrypted in Vercel — never NEXT_PUBLIC_. */
export const VERCEL_SENSITIVE_ENV_KEYS = new Set([
  "DATABASE_URL",
  "DIRECT_URL",
  "AUTH_SECRET",
  "NEXTAUTH_SECRET",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GOOGLE_CLIENT_SECRET",
  "SQUARE_ACCESS_TOKEN",
  "SQUARE_APPLICATION_ID",
  "SQUARE_LOCATION_ID",
  "SQUARE_WEBHOOK_SIGNATURE_KEY",
  "CRON_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "UPLOADTHING_TOKEN",
  "UPLOADTHING_SECRET",
  "VAPID_PRIVATE_KEY",
  "SHIPPO_API_TOKEN",
  "VERCEL_TOKEN",
]);

/** Safe to expose in browser bundles (NEXT_PUBLIC_ or publishable keys). */
export const VERCEL_PLAIN_ENV_KEYS = new Set([
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_GA_MEASUREMENT_ID",
  "NEXTAUTH_URL",
  "SQUARE_ENVIRONMENT",
  "MAINTENANCE_MODE",
  "MAINTENANCE_MESSAGE",
  "RESEND_FROM_EMAIL",
  "VAPID_PUBLIC_KEY",
  "VAPID_SUBJECT",
  "GOOGLE_CLIENT_ID",
]);

/** Deprecated — remove from Vercel if present (use server-only names instead). */
export const VERCEL_DEPRECATED_ENV_KEYS = new Set([
  "NEXT_PUBLIC_SQUARE_APPLICATION_ID",
  "NEXT_PUBLIC_SQUARE_LOCATION_ID",
  "NEXT_PUBLIC_MAINTENANCE_MODE",
]);

export function vercelEnvType(key) {
  if (VERCEL_DEPRECATED_ENV_KEYS.has(key)) return "deprecated";
  if (VERCEL_SENSITIVE_ENV_KEYS.has(key)) return "sensitive";
  if (VERCEL_PLAIN_ENV_KEYS.has(key)) return "plain";
  if (key.startsWith("NEXT_PUBLIC_")) return "plain";
  return "sensitive";
}

export function vercelApiEnvType(key) {
  const kind = vercelEnvType(key);
  if (kind === "deprecated") return null;
  return kind === "plain" ? "plain" : "sensitive";
}
