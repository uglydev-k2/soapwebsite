#!/usr/bin/env node
/**
 * Sync soapwebsite with settings from the legacy mzveesoaps project:
 * - .env.local (database, auth, Supabase, etc.)
 * - Optional overrides via environment (never written to disk)
 *
 * Usage:
 *   VERCEL_TOKEN=... node scripts/sync-legacy-project-to-soapwebsite.mjs
 *
 * Optional env overrides (legacy values not in .env.local):
 *   SQUARE_ACCESS_TOKEN, RESEND_API_KEY, UPLOADTHING_TOKEN, CRON_SECRET
 */
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { vercelApiEnvType } from "./vercel-env-types.mjs";

const TEAM_ID = process.env.VERCEL_TEAM_ID ?? "team_v59NmJZ5yPRmZnDb3ev4mVqY";
const PROJECT_ID =
  process.env.VERCEL_PROJECT_ID ?? "prj_EobuO0mPGfZ0xbZECkgT0SuWZvhD";
const TARGETS = ["production", "preview", "development"];

const KEYS = [
  "DATABASE_URL",
  "DIRECT_URL",
  "AUTH_SECRET",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "UPLOADTHING_TOKEN",
  "UPLOADTHING_SECRET",
  "UPLOADTHING_APP_ID",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "STORE_CONTACT_EMAIL",
  "NEXT_PUBLIC_GA_MEASUREMENT_ID",
  "SQUARE_ACCESS_TOKEN",
  "SQUARE_APPLICATION_ID",
  "SQUARE_LOCATION_ID",
  "SQUARE_ENVIRONMENT",
  "CRON_SECRET",
  "MAINTENANCE_MODE",
  "MAINTENANCE_MESSAGE",
];

function loadToken() {
  if (process.env.VERCEL_TOKEN?.trim()) return process.env.VERCEL_TOKEN.trim();
  const authPath = join(
    homedir(),
    "Library/Application Support/com.vercel.cli/auth.json"
  );
  if (!existsSync(authPath)) throw new Error("Set VERCEL_TOKEN");
  return JSON.parse(readFileSync(authPath, "utf8")).token;
}

function parseEnvLocal() {
  const path = join(process.cwd(), ".env.local");
  if (!existsSync(path)) return {};
  const vars = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (v) vars[m[1]] = v;
  }
  if (vars.AUTH_SECRET && !vars.NEXTAUTH_SECRET) {
    vars.NEXTAUTH_SECRET = vars.AUTH_SECRET;
  }
  return vars;
}

async function api(token, path, { method = "GET", body } = {}) {
  const url = `https://api.vercel.com${path}${
    path.includes("?") ? "&" : "?"
  }teamId=${TEAM_ID}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

const token = loadToken();
const local = parseEnvLocal();
if (/localhost|127\.0\.0\.1/i.test(local.NEXTAUTH_URL ?? "")) {
  delete local.NEXTAUTH_URL;
}

const legacyDefaults = {
  NEXTAUTH_URL: "https://www.mvlusciouslather.com",
  RESEND_FROM_EMAIL: "hello@mvlusciouslather.com",
  STORE_CONTACT_EMAIL: "mvlusciouslather@gmail.com",
  MAINTENANCE_MODE: "false",
  SQUARE_APPLICATION_ID: "sq0idp-p63YRslhWg8KWRBfQdxbug",
  SQUARE_LOCATION_ID: "LE5DFKVXGDR9G",
  SQUARE_ENVIRONMENT: "production",
};

const toPush = { ...legacyDefaults, ...local };
for (const key of KEYS) {
  const fromEnv = process.env[key]?.trim();
  if (fromEnv) toPush[key] = fromEnv;
}

for (const key of KEYS) {
  if (!toPush[key]?.trim()) delete toPush[key];
}

const { envs = [] } = await api(token, `/v9/projects/${PROJECT_ID}/env`);

console.log(`Pushing ${Object.keys(toPush).length} vars to soapwebsite…`);
for (const [key, value] of Object.entries(toPush)) {
  for (const e of envs.filter((x) => x.key === key)) {
    await api(token, `/v9/projects/${PROJECT_ID}/env/${e.id}`, {
      method: "DELETE",
    });
  }
  const type = vercelApiEnvType(key) ?? "sensitive";
  await api(token, `/v10/projects/${PROJECT_ID}/env`, {
    method: "POST",
    body: { key, value, type, target: TARGETS },
  });
  console.log(`  ${key}`);
}

for (const key of [
  "NEXT_PUBLIC_SQUARE_APPLICATION_ID",
  "NEXT_PUBLIC_SQUARE_LOCATION_ID",
]) {
  for (const e of envs.filter((x) => x.key === key)) {
    await api(token, `/v9/projects/${PROJECT_ID}/env/${e.id}`, {
      method: "DELETE",
    });
    console.log(`  removed deprecated ${key}`);
  }
}

const deploy = await api(token, "/v13/deployments", {
  method: "POST",
  body: {
    name: "soapwebsite",
    project: PROJECT_ID,
    target: "production",
    gitSource: {
      type: "github",
      org: "uglydev-k2",
      repo: "soapwebsite",
      ref: "master",
    },
  },
});

console.log("\nRedeploy:", deploy.url ?? deploy.id);
console.log("\nDomains (Cloudflare DNS still required if not verified):");
console.log("  npm run domains:verify-soapwebsite");
