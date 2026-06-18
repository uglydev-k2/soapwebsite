import { PrismaClient } from "@prisma/client";
import { inferProductVariantMeta } from "../lib/product-variants";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      fragrance: true,
      variantGroup: true,
      variantLabel: true,
    },
  });

  let updated = 0;
  for (const product of products) {
    const meta = inferProductVariantMeta(product);
    if (!meta) continue;

    if (
      product.variantGroup === meta.group &&
      product.variantLabel === meta.label
    ) {
      continue;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: {
        variantGroup: meta.group,
        variantLabel: meta.label,
      },
    });
    updated += 1;
  }

  console.log(`[backfill-product-variants] Updated ${updated} products`);
}

main()
  .catch((error) => {
    console.error("[backfill-product-variants] Failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
