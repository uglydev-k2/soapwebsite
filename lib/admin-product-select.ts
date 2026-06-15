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
  weightOz: true,
  featured: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductSelect;

export type AdminProduct = Prisma.ProductGetPayload<{
  select: typeof adminProductSelect;
}>;
