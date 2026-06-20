/** Routes where the fixed mobile "Shop Now" bar should not appear. */
export function shouldHideMobileShopCta(pathname: string): boolean {
  if (pathname === "/cart" || pathname.startsWith("/checkout")) return true;
  if (/^\/collections\/[^/]+$/.test(pathname)) return true;
  return false;
}
