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

const optional = [
  "UPLOADTHING_TOKEN",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "OPENAI_API_KEY",
];

function status(key) {
  const v = vars[key] ?? "";
  return v.length > 5 ? "✓ ready to paste" : "✗ missing in .env.local";
}

console.log("\nVercel Environment Variables checklist\n");
console.log("Required:");
for (const key of required) {
  console.log(`  ${key}: ${status(key)}`);
}
console.log("\nOptional (enables extra features):");
for (const key of optional) {
  console.log(`  ${key}: ${status(key)}`);
}

const uploadReady = vars.UPLOADTHING_TOKEN?.length > 20;
console.log(
  uploadReady
    ? "\nProduct image uploads: configured locally — run npm run env:push-vercel to sync."
    : "\nProduct image uploads: add UploadThing keys from https://uploadthing.com/dashboard"
);

console.log("\n→ Or: npm run env:push-vercel");
console.log("→ Vercel Dashboard → Project → Settings → Environment Variables");
console.log("→ Deployments → Redeploy\n");
