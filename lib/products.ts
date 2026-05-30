import { prisma } from "@/lib/prisma";
import type { Product } from "@prisma/client";
import { safeDbQuery } from "@/lib/db";
import { STATIC_FEATURED, STATIC_PRODUCTS } from "@/lib/catalog";

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const products = await safeDbQuery(
    "getFeaturedProducts",
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
    : (STATIC_FEATURED.slice(0, limit) as Product[]);
}

export async function getActiveProducts(): Promise<Product[]> {
  const products = await safeDbQuery(
    "getActiveProducts",
    () =>
      prisma.product.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
      }),
    [] as Product[]
  );
  return products.length > 0 ? products : (STATIC_PRODUCTS as Product[]);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await safeDbQuery(
    "getProductBySlug",
    () => prisma.product.findUnique({ where: { slug, active: true } }),
    null
  );
  if (product) return product;
  return (STATIC_PRODUCTS.find((p) => p.slug === slug) as Product) ?? null;
}
