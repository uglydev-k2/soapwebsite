import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.log("[vercel-db-push] DATABASE_URL not set — skipping schema push");
  process.exit(0);
}

const initSql = join(process.cwd(), "scripts", "init-prisma-tables.sql");
if (existsSync(initSql)) {
  console.log("[vercel-db-push] Applying Prisma tables via SQL (Supabase-compatible)…");
  try {
    execSync(
      "npx prisma db execute --file scripts/init-prisma-tables.sql --schema prisma/schema.prisma",
      { stdio: "inherit" }
    );
    process.exit(0);
  } catch {
    console.log("[vercel-db-push] SQL init failed or partial — trying db push…");
  }
}

console.log("[vercel-db-push] Applying Prisma schema via db push…");
execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
