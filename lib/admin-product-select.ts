import type { Prisma } from "@prisma/client";

/** Fields needed by admin product UIs — avoids failures when optional DB columns are missing. */
export const adminProductSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  comparePrice: true,
  category: true,
  stock: true,
  images: true,
  ingredients: true,
  fragrance: true,
  variantGroup: true,
  variantLabel: true,
  weightOz: true,
  featured: true,
  active: true,
  createdAt: true,
  updatedAt: true,
  scentOptions: {
    select: {
      id: true,
      label: true,
      fragrance: true,
      stock: true,
      images: true,
      sortOrder: true,
      active: true,
    },
    orderBy: { sortOrder: "asc" as const },
  },
} satisfies Prisma.ProductSelect;

export type AdminProduct = Prisma.ProductGetPayload<{
  select: typeof adminProductSelect;
}>;
