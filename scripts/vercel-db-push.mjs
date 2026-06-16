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

if (existsSync(initSql)) {
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

console.log("[vercel-db-push] Trying prisma db push…");
if (run("npx prisma db push --skip-generate")) {
  process.exit(0);
}

console.log("[vercel-db-push] Schema step finished with warnings — continuing build");
process.exit(0);
