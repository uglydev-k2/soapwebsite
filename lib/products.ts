import { prisma } from "@/lib/prisma";
import type { Product } from "@prisma/client";

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  if (!process.env.DATABASE_URL) {
    console.warn("[msvee] DATABASE_URL is not set — skipping product fetch");
    return [];
  }
  try {
    return await prisma.product.findMany({
      where: { featured: true, active: true },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("[msvee] Failed to fetch featured products:", error);
    return [];
  }
}

export async function getActiveProducts(): Promise<Product[]> {
  if (!process.env.DATABASE_URL) {
    console.warn("[msvee] DATABASE_URL is not set — skipping product fetch");
    return [];
  }
  try {
    return await prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("[msvee] Failed to fetch products:", error);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    return await prisma.product.findUnique({
      where: { slug, active: true },
    });
  } catch (error) {
    console.error("[msvee] Failed to fetch product:", error);
    return null;
  }
}
