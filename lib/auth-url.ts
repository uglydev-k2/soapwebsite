const PRODUCTION_SITE_URL = "https://www.mvlusciouslather.com";

function isLocalAuthUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

/** NextAuth must not use localhost in production (breaks admin login on custom domain). */
export function ensureProductionAuthUrl(): void {
  if (process.env.NODE_ENV !== "production") return;

  const current =
    process.env.AUTH_URL?.trim() ??
    process.env.NEXTAUTH_URL?.trim() ??
    "";

  if (!current || isLocalAuthUrl(current)) {
    process.env.AUTH_URL = PRODUCTION_SITE_URL;
    process.env.NEXTAUTH_URL = PRODUCTION_SITE_URL;
  }
}
