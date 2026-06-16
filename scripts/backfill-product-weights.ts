/**
 * Set weightOz on products that don't have one, using category defaults.
 *
 * Usage:
 *   DATABASE_URL="..." npx tsx scripts/backfill-product-weights.ts
 */
import { PrismaClient } from "@prisma/client";
import {
  getCategoryDefaultWeightOz,
  isSampleProduct,
  SAMPLE_UNIT_WEIGHT_OZ,
  SAMPLE_EXTRA_OZ,
} from "../lib/product-weight";

const prisma = new PrismaClient();

function defaultWeightForProduct(
  category: Parameters<typeof getCategoryDefaultWeightOz>[0],
  name: string,
  slug: string
): number {
  if (isSampleProduct(name, slug)) {
    return SAMPLE_UNIT_WEIGHT_OZ + SAMPLE_EXTRA_OZ;
  }
  return getCategoryDefaultWeightOz(category);
}

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, slug: true, category: true, weightOz: true },
  });

  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    if (product.weightOz != null && product.weightOz > 0) {
      skipped += 1;
      continue;
    }

    const weightOz = defaultWeightForProduct(
      product.category,
      product.name,
      product.slug
    );

    await prisma.product.update({
      where: { id: product.id },
      data: { weightOz },
    });

    console.log(`  ${product.slug}: ${weightOz} oz (${product.category})`);
    updated += 1;
  }

  console.log(
    `\nDone — updated ${updated}, skipped ${skipped} (already set), ${products.length} total.`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
