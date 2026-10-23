/**
 * Local runner for catalog cleanup (uses DATABASE_URL from env).
 *
 * Usage: DATABASE_URL="..." npx tsx scripts/fix-product-catalog-data.ts
 */
import { fixProductCatalogData } from "../lib/fix-product-catalog-data";

async function main() {
  const result = await fixProductCatalogData();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
