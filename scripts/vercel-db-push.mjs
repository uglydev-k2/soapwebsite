import { execSync } from "node:child_process";

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.log("[vercel-db-push] DATABASE_URL not set — skipping schema push");
  process.exit(0);
}

console.log("[vercel-db-push] Applying Prisma schema to database…");
execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
