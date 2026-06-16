export const BRAND_NAME = "mvlusciouslather";
export const BRAND_DISPLAY_NAME = "MV Luscious Lather";
export const BRAND_LOGO_ALT = "MV Luscious Lather logo";
export const BRAND_TAGLINE = "Premium Botanical Bath & Body";
export const BRAND_EMAIL = "hello@mvlusciouslather.com";
export const BRAND_SITE_URL = "https://www.mvlusciouslather.com";
export const ORDER_NUMBER_PREFIX = "MLL";

export function brandTitle(page?: string): string {
  if (!page) return `${BRAND_DISPLAY_NAME} — ${BRAND_TAGLINE}`;
  return `${page} — ${BRAND_DISPLAY_NAME}`;
}
