import { prisma } from "@/lib/prisma";
import type { Category, Prisma, Product } from "@prisma/client";
import { safeDbQuery } from "@/lib/db";
import { STATIC_FEATURED, STATIC_PRODUCTS } from "@/lib/catalog";

type ProductSort = "featured" | "newest" | "price-asc" | "price-desc" | "name";

interface ActiveProductOptions {
  category?: Category;
  scent?: string;
  sort?: ProductSort;
  q?: string;
}

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

function getOrderBy(sort: ProductSort): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "newest":
      return [{ createdAt: "desc" }];
    case "price-asc":
      return [{ price: "asc" }, { name: "asc" }];
    case "price-desc":
      return [{ price: "desc" }, { name: "asc" }];
    case "name":
      return [{ name: "asc" }];
    case "featured":
    default:
      return [{ featured: "desc" }, { name: "asc" }];
  }
}

function matchesSearch(product: Product, query: string): boolean {
  const haystack = `${product.name} ${product.description} ${product.fragrance ?? ""} ${product.ingredients ?? ""}`.toLowerCase();
  return haystack.includes(query);
}

function applyFallbackFilters(
  products: Product[],
  { category, scent, sort = "featured", q }: ActiveProductOptions
): Product[] {
  let filtered = products.filter((p) => p.active);

  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (scent) {
    const query = scent.toLowerCase().trim();
    if (query) {
      filtered = filtered.filter((p) =>
        `${p.name} ${p.fragrance ?? ""}`.toLowerCase().includes(query)
      );
    }
  }

  if (q) {
    const query = q.toLowerCase().trim();
    if (query) {
      filtered = filtered.filter((p) => matchesSearch(p, query));
    }
  }

  const sorted = [...filtered];
  switch (sort) {
    case "newest":
      sorted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      break;
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price || a.name.localeCompare(b.name));
      break;
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "featured":
    default:
      sorted.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name)
      );
      break;
  }

  return sorted;
}

export async function getActiveProducts(
  options: ActiveProductOptions = {}
): Promise<Product[]> {
  const { category, scent, sort = "featured", q } = options;
  const products = await safeDbQuery(
    "getActiveProducts",
    () =>
      prisma.product.findMany({
        where: {
          active: true,
          ...(category ? { category } : {}),
          ...(scent
            ? {
                OR: [
                  { name: { contains: scent, mode: "insensitive" } },
                  { fragrance: { contains: scent, mode: "insensitive" } },
                ],
              }
            : {}),
          ...(q
            ? {
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { description: { contains: q, mode: "insensitive" } },
                  { fragrance: { contains: q, mode: "insensitive" } },
                  { ingredients: { contains: q, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        orderBy: getOrderBy(sort),
      }),
    [] as Product[]
  );

  if (products.length > 0) return products;
  return applyFallbackFilters(STATIC_PRODUCTS as Product[], options);
}

export async function getRelatedProducts(
  category: Category,
  excludeSlug: string,
  limit = 3
): Promise<Product[]> {
  const products = await getActiveProducts({ category, sort: "featured" });
  return products.filter((p) => p.slug !== excludeSlug).slice(0, limit);
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

export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  const results: Product[] = [];
  for (const slug of slugs) {
    const product = await getProductBySlug(slug);
    if (product) results.push(product);
  }
  return results;
}

export async function getProductsByIngredientKeywords(
  keywords: readonly string[],
  limit = 3
): Promise<Product[]> {
  const products = await getActiveProducts({ sort: "featured" });
  const matched = products.filter((product) => {
    const haystack =
      `${product.name} ${product.description} ${product.fragrance ?? ""} ${product.ingredients ?? ""}`.toLowerCase();
    return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
  });
  return matched.slice(0, limit);
}
