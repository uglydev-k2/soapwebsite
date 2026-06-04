#!/usr/bin/env node
/**
 * Validates UploadThing env and reminds how to finish setup.
 * Usage: paste token into .env.local as UPLOADTHING_TOKEN=... then:
 *   npm run setup:uploadthing
 *   npm run env:push-vercel
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const envPath = join(process.cwd(), ".env.local");
if (!existsSync(envPath)) {
  console.error("Missing .env.local — copy from .env.example first.");
  process.exit(1);
}

const tokenFromCli = process.argv[2]?.trim();
let text = readFileSync(envPath, "utf8");

if (tokenFromCli) {
  if (/^UPLOADTHING_TOKEN=/m.test(text)) {
    text = text.replace(/^UPLOADTHING_TOKEN=.*$/m, `UPLOADTHING_TOKEN=${tokenFromCli}`);
  } else {
    text += `\nUPLOADTHING_TOKEN=${tokenFromCli}\n`;
  }
  writeFileSync(envPath, text);
  console.log("Saved UPLOADTHING_TOKEN to .env.local");
}

const match = text.match(/^UPLOADTHING_TOKEN=(.*)$/m);
const token = match?.[1]?.replace(/^["']|["']$/g, "").trim() ?? "";

if (token.length < 20) {
  console.log(`
UploadThing is not configured yet.

1. Open https://uploadthing.com/dashboard
2. Create an app (or open your existing app)
3. Go to API Keys → V7 tab → copy the token
4. Add to .env.local:
   UPLOADTHING_TOKEN=your_token_here

Or run:
   npm run setup:uploadthing -- YOUR_TOKEN_HERE

Then:
   npm run env:push-vercel
`);
  process.exit(1);
}

console.log("✓ UPLOADTHING_TOKEN is set in .env.local");
console.log("Next: npm run env:push-vercel");
