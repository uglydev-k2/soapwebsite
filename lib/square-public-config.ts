/**
 * Square IDs served to the browser via /api/checkout/config.
 * Keep server-only env names (no NEXT_PUBLIC_) so values are not baked into client bundles.
 */
export function getSquareApplicationId(): string | null {
  return (
    process.env.SQUARE_APPLICATION_ID?.trim() ||
    process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID?.trim() ||
    null
  );
}
