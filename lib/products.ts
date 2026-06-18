import { prisma } from "@/lib/prisma";
import type { Category, Prisma, Product } from "@prisma/client";
import { safeDbQuery } from "@/lib/db";
import {
  getScentVariantsForProduct,
  inferProductVariantMeta,
  type ScentVariant,
} from "@/lib/product-variants";
import {
  FEATURED_PRODUCT_SLUGS,
  STATIC_FEATURED,
  STATIC_PRODUCTS,
} from "@/lib/catalog";

function orderFeaturedProducts<T extends { id: string; slug: string; featured: boolean }>(
  products: T[],
  limit: number
): T[] {
  const ordered = FEATURED_PRODUCT_SLUGS.map((slug) =>
    products.find((p) => p.slug === slug)
  ).filter((p): p is T => p != null);

  if (ordered.length >= limit) {
    return ordered.slice(0, limit);
  }

  const used = new Set(ordered.map((p) => p.id));
  const rest = products.filter((p) => p.featured && !used.has(p.id));
  return [...ordered, ...rest].slice(0, limit);
}

type ProductSort = "featured" | "newest" | "price-asc" | "price-desc" | "name";

interface ActiveProductOptions {
  category?: Category;
  categories?: Category[];
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
        orderBy: { createdAt: "desc" },
      }),
    [] as Product[]
  );
  return products.length > 0
    ? orderFeaturedProducts(products, limit)
    : (orderFeaturedProducts(STATIC_FEATURED, limit) as Product[]);
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
  { category, categories, scent, sort = "featured", q }: ActiveProductOptions
): Product[] {
  let filtered = products.filter((p) => p.active);

  if (categories?.length) {
    filtered = filtered.filter((p) => categories.includes(p.category));
  } else if (category) {
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
  const { category, categories, scent, sort = "featured", q } = options;
  const categoryFilter = categories?.length
    ? { category: { in: categories } }
    : category
      ? { category }
      : {};

  const products = await safeDbQuery(
    "getActiveProducts",
    () =>
      prisma.product.findMany({
        where: {
          active: true,
          ...categoryFilter,
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

export async function getProductScentVariants(
  product: Product
): Promise<{ baseName: string; variants: ScentVariant[] }> {
  const meta = inferProductVariantMeta(product);
  if (!meta) {
    return { baseName: product.name, variants: [] };
  }

  const groupKey = product.variantGroup ?? meta.group;
  const siblings = await safeDbQuery(
    "getProductScentVariants",
    () =>
      prisma.product.findMany({
        where: {
          active: true,
          variantGroup: groupKey,
        },
        orderBy: [{ variantLabel: "asc" }, { name: "asc" }],
      }),
    [] as Product[]
  );

  if (siblings.length > 1) {
    return {
      baseName: meta.baseName,
      variants: siblings.map((item) => ({
        id: item.id,
        slug: item.slug,
        label: item.variantLabel ?? meta.label,
        fragrance: item.fragrance,
        stock: item.stock,
        price: item.price,
        inStock: item.stock > 0,
      })),
    };
  }

  const catalog = await getActiveProducts({ category: product.category });
  const inferred = getScentVariantsForProduct(product, catalog);
  return {
    baseName: meta.baseName,
    variants: inferred,
  };
}

export async function getActiveProductSlugs(): Promise<
  { slug: string; updatedAt: Date }[]
> {
  const rows = await safeDbQuery(
    "getActiveProductSlugs",
    () =>
      prisma.product.findMany({
        where: { active: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
    [] as { slug: string; updatedAt: Date }[]
  );

  if (rows.length > 0) return rows;

  return STATIC_PRODUCTS.filter((p) => p.active).map((p) => ({
    slug: p.slug,
    updatedAt: p.updatedAt ?? new Date(),
  }));
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
