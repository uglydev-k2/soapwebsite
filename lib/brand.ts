export const BRAND_NAME = "mvlusciouslather";
export const BRAND_TAGLINE = "Premium Botanical Bath & Body";
export const BRAND_EMAIL = "hello@mvlusciouslather.com";
export const BRAND_SITE_URL = "https://www.mvlusciouslather.com";
export const ORDER_NUMBER_PREFIX = "MLL";

export function brandTitle(page?: string): string {
  if (!page) return `${BRAND_NAME} — ${BRAND_TAGLINE}`;
  return `${page} — ${BRAND_NAME}`;
}
