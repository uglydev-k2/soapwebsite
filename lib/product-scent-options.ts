import { prisma } from "@/lib/prisma";
import type { ProductScentOptionFormData } from "@/lib/validations";

export async function syncProductScentOptions(
  productId: string,
  options: ProductScentOptionFormData[]
) {
  const existing = await prisma.productScentOption.findMany({
    where: { productId },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((row) => row.id));
  const keptIds = new Set<string>();

  for (let index = 0; index < options.length; index++) {
    const option = options[index]!;
    const data = {
      label: option.label.trim(),
      fragrance: option.fragrance?.trim() || null,
      stock: option.stock,
      images: option.images,
      sortOrder: option.sortOrder ?? index,
      active: option.active ?? true,
    };

    if (option.id && existingIds.has(option.id)) {
      keptIds.add(option.id);
      await prisma.productScentOption.update({
        where: { id: option.id },
        data,
      });
      continue;
    }

    await prisma.productScentOption.create({
      data: {
        ...data,
        productId,
      },
    });
  }

  const removeIds = Array.from(existingIds).filter((id) => !keptIds.has(id));
  if (removeIds.length) {
    await prisma.productScentOption.deleteMany({
      where: { id: { in: removeIds } },
    });
  }
}

export const productScentOptionSelect = {
  id: true,
  productId: true,
  label: true,
  fragrance: true,
  stock: true,
  images: true,
  sortOrder: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} as const;
