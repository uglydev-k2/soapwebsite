import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/db";
import { STATIC_PRODUCTS } from "@/lib/catalog";

/** Normalize a Shopify product handle for slug lookup. */
export function normalizeProductHandle(handle: string): string {
  return decodeURIComponent(handle)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

/** Map a legacy Shopify /products/{handle} URL to a live product slug. */
export async function resolveShopifyProductHandle(
  handle: string
): Promise<string | null> {
  const normalized = normalizeProductHandle(handle);
  if (!normalized) return null;

  const fromDb = await safeDbQuery(
    "resolveShopifyProductHandle",
    () =>
      prisma.product.findFirst({
        where: { active: true, slug: normalized },
        select: { slug: true },
      }),
    null
  );
  if (fromDb) return fromDb.slug;

  const staticMatch = STATIC_PRODUCTS.find((p) => p.slug === normalized);
  return staticMatch?.slug ?? null;
}
