import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.log("[vercel-db-push] DATABASE_URL not set — skipping schema push");
  process.exit(0);
}

function run(cmd) {
  try {
    execSync(cmd, { stdio: "inherit" });
    return true;
  } catch {
    return false;
  }
}

const initSql = join(process.cwd(), "scripts", "init-prisma-tables.sql");
const weightSql = join(process.cwd(), "scripts", "add-product-weight.sql");
const backfillWeightSql = join(process.cwd(), "scripts", "backfill-product-weights.sql");

const variantSql = join(process.cwd(), "scripts", "add-product-variants.sql");
const backfillVariantScript = join(
  process.cwd(),
  "scripts",
  "backfill-product-variants.ts"
);

const scentOptionsSql = join(process.cwd(), "scripts", "add-product-scent-options.sql");
const roadmapSql = join(process.cwd(), "scripts", "add-roadmap-tables.sql");
const customerSubscriptionsSql = join(
  process.cwd(),
  "scripts",
  "add-customer-subscriptions.sql"
);

const pageViewsSql = join(process.cwd(), "scripts", "add-page-views.sql");

if (existsSync(customerSubscriptionsSql)) {
  run(
    "npx prisma db execute --file scripts/add-customer-subscriptions.sql --schema prisma/schema.prisma"
  );
}

if (existsSync(pageViewsSql)) {
  run(
    "npx prisma db execute --file scripts/add-page-views.sql --schema prisma/schema.prisma"
  );
}

if (existsSync(roadmapSql)) {
  run(
    "npx prisma db execute --file scripts/add-roadmap-tables.sql --schema prisma/schema.prisma"
  );
}

if (existsSync(scentOptionsSql)) {
  run(
    "npx prisma db execute --file scripts/add-product-scent-options.sql --schema prisma/schema.prisma"
  );
}

if (existsSync(variantSql)) {
  run(
    "npx prisma db execute --file scripts/add-product-variants.sql --schema prisma/schema.prisma"
  );
}

if (existsSync(backfillVariantScript)) {
  run("npx tsx scripts/backfill-product-variants.ts");
}

if (existsSync(weightSql)) {
  run(
    "npx prisma db execute --file scripts/add-product-weight.sql --schema prisma/schema.prisma"
  );
}

if (existsSync(backfillWeightSql)) {
  run(
    "npx prisma db execute --file scripts/backfill-product-weights.sql --schema prisma/schema.prisma"
  );
}

const onVercel = process.env.VERCEL === "1";

// Full init + db push are for fresh local DBs. Production Supabase already has schema;
// re-running init errors on existing enums (Category already exists) and db push hits P4002.
if (!onVercel && existsSync(initSql)) {
  console.log("[vercel-db-push] Applying Prisma tables via SQL (Supabase-compatible)…");
  if (
    run(
      "npx prisma db execute --file scripts/init-prisma-tables.sql --schema prisma/schema.prisma"
    )
  ) {
    process.exit(0);
  }
  console.log("[vercel-db-push] SQL init skipped (tables likely already exist)");
}

if (!onVercel) {
  console.log("[vercel-db-push] Trying prisma db push…");
  if (run("npx prisma db push --skip-generate")) {
    process.exit(0);
  }
  console.log("[vercel-db-push] Schema step finished with warnings — continuing build");
} else {
  console.log(
    "[vercel-db-push] Skipping full init and db push on Vercel (incremental SQL above is enough)"
  );
}

process.exit(0);
