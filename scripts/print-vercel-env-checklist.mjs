#!/usr/bin/env node
/**
 * Prints which env vars are set locally (.env.local) for copying to Vercel.
 * Does not print secret values.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const path = join(process.cwd(), ".env.local");
if (!existsSync(path)) {
  console.error("No .env.local found.");
  process.exit(1);
}

const text = readFileSync(path, "utf8");
const vars = {};
for (const line of text.split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (!m) continue;
  vars[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
}

const required = [
  "DATABASE_URL",
  "DIRECT_URL",
  "AUTH_SECRET",
  "NEXTAUTH_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

console.log("\nVercel Environment Variables checklist\n");
for (const key of required) {
  const v = vars[key] ?? "";
  const status = v.length > 5 ? "✓ ready to paste" : "✗ missing in .env.local";
  console.log(`  ${key}: ${status}`);
}
console.log("\n→ Vercel Dashboard → Project → Settings → Environment Variables");
console.log("→ Add each value from .env.local (Production + Preview)");
console.log("→ Deployments → Redeploy\n");
