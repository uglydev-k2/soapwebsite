import { prisma } from "@/lib/prisma";
import type { Product, Category } from "@prisma/client";

/** Shown when DATABASE_URL is missing or the DB is unreachable */
export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "fallback-1",
    name: "Forest Cedar Body Wash",
    slug: "forest-cedar-body-wash",
    description:
      "A grounding botanical wash with cedarwood, pine needle, and wild moss.",
    price: 28,
    comparePrice: null,
    category: "BODY_WASH" as Category,
    stock: 45,
    images: [],
    ingredients: null,
    fragrance: "Forest & Cedar",
    featured: true,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "fallback-2",
    name: "Citrus Bloom Bar Soap (3-pack)",
    slug: "citrus-bloom-bar-soap",
    description: "Bright citrus layered with neroli and white florals.",
    price: 22,
    comparePrice: null,
    category: "SOAP" as Category,
    stock: 8,
    images: [],
    ingredients: null,
    fragrance: "Citrus Bloom",
    featured: true,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "fallback-3",
    name: "Warm Amber Body Lotion",
    slug: "warm-amber-body-lotion",
    description: "Silky hydration with amber resin and shea butter.",
    price: 34,
    comparePrice: null,
    category: "LOTION" as Category,
    stock: 31,
    images: [],
    ingredients: null,
    fragrance: "Warm Amber",
    featured: true,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "fallback-4",
    name: "The Full Ritual Gift Set",
    slug: "full-ritual-gift-set",
    description: "Our complete botanical ritual in a hand-wrapped gift box.",
    price: 89,
    comparePrice: 110,
    category: "GIFT_SET" as Category,
    stock: 12,
    images: [],
    ingredients: null,
    fragrance: "Warm Amber",
    featured: true,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!process.env.DATABASE_URL) {
    console.warn("[msvee] DATABASE_URL is not set — using fallback data");
    return fallback;
  }
  try {
    return await fn();
  } catch (error) {
    console.error("[msvee] Database query failed:", error);
    return fallback;
  }
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const products = await safeQuery(
    () =>
      prisma.product.findMany({
        where: { featured: true, active: true },
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    [] as Product[]
  );
  return products.length > 0
    ? products
    : FALLBACK_PRODUCTS.slice(0, limit);
}

export async function getActiveProducts(): Promise<Product[]> {
  const products = await safeQuery(
    () =>
      prisma.product.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
      }),
    [] as Product[]
  );
  return products.length > 0 ? products : FALLBACK_PRODUCTS;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await safeQuery(
    () =>
      prisma.product.findUnique({
        where: { slug, active: true },
      }),
    null
  );
  if (product) return product;
  return FALLBACK_PRODUCTS.find((p) => p.slug === slug) ?? null;
}
