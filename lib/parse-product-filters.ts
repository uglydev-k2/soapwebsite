import type { Category, Prisma } from "@prisma/client";
import { PRODUCT_CATEGORIES } from "@/lib/categories";

const VALID_CATEGORIES = new Set<Category>(
  PRODUCT_CATEGORIES.map((c) => c.value)
);

export function parseProductListFilters(
  input: URLSearchParams | Record<string, string | undefined | null>
): Prisma.ProductWhereInput {
  const get = (key: string): string | null | undefined =>
    input instanceof URLSearchParams ? input.get(key) : input[key];

  const where: Prisma.ProductWhereInput = {};

  const category = get("category");
  if (category && VALID_CATEGORIES.has(category as Category)) {
    where.category = category as Category;
  }

  const status = get("status");
  if (status === "active") where.active = true;
  if (status === "inactive") where.active = false;

  const search = get("search")?.trim();
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }

  return where;
}
