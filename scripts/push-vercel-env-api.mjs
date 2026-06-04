#!/usr/bin/env node
/**
 * Push env vars from .env.local to Vercel via API.
 * Requires VERCEL_TOKEN (or reads local Vercel CLI auth.json).
 */
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const TEAM_ID = process.env.VERCEL_TEAM_ID ?? "team_o5SfD9J7DXBQHEAbO5MMahF0";
const PROJECT_ID = process.env.VERCEL_PROJECT_ID ?? "prj_JnVlKIC313nE3Swh54UVTPyoxRAF";

const REQUIRED_KEYS = [
  "DATABASE_URL",
  "DIRECT_URL",
  "AUTH_SECRET",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

/** Pushed when present in .env.local */
const OPTIONAL_KEYS = [
  "UPLOADTHING_SECRET",
  "UPLOADTHING_APP_ID",
  "UPLOADTHING_TOKEN",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
  "VAPID_SUBJECT",
  "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
];

const KEYS = [...REQUIRED_KEYS, ...OPTIONAL_KEYS];

const TARGETS = ["production", "preview", "development"];

function loadToken() {
  if (process.env.VERCEL_TOKEN?.trim()) return process.env.VERCEL_TOKEN.trim();
  const authPath = join(
    homedir(),
    "Library/Application Support/com.vercel.cli/auth.json"
  );
  if (!existsSync(authPath)) throw new Error("No VERCEL_TOKEN or Vercel CLI auth");
  const auth = JSON.parse(readFileSync(authPath, "utf8"));
  if (!auth.token) throw new Error("Invalid Vercel auth.json");
  return auth.token;
}

function parseEnvLocal() {
  const path = join(process.cwd(), ".env.local");
  if (!existsSync(path)) throw new Error("Missing .env.local");
  const vars = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    vars[m[1]] = v;
  }
  if (vars.AUTH_SECRET && !vars.NEXTAUTH_SECRET) {
    vars.NEXTAUTH_SECRET = vars.AUTH_SECRET;
  }
  return vars;
}

async function api(path, { method = "GET", body } = {}) {
  const url = `https://api.vercel.com${path}${path.includes("?") ? "&" : "?"}teamId=${TEAM_ID}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

const token = loadToken();
const local = parseEnvLocal();

console.log("Fetching existing Vercel env vars…");
const { envs = [] } = await api(`/v9/projects/${PROJECT_ID}/env`);

for (const key of KEYS) {
  const value = local[key];
  if (!value) {
    const optional = OPTIONAL_KEYS.includes(key);
    console.log(`Skip ${key} (not in .env.local${optional ? ", optional" : ""})`);
    continue;
  }

  const existing = envs.filter((e) => e.key === key);
  for (const e of existing) {
    await api(`/v9/projects/${PROJECT_ID}/env/${e.id}`, { method: "DELETE" });
    console.log(`Removed old ${key} (${e.target?.join(",")})`);
  }

  await api(`/v10/projects/${PROJECT_ID}/env`, {
    method: "POST",
    body: {
      key,
      value,
      type: "encrypted",
      target: TARGETS,
    },
  });
  console.log(`Added ${key} → ${TARGETS.join(", ")}`);
}

const uploadReady = Boolean(local.UPLOADTHING_TOKEN?.trim());
console.log(
  uploadReady
    ? "\nUploadThing: UPLOADTHING_TOKEN found — product image uploads should work after deploy."
    : "\nUploadThing: add UPLOADTHING_TOKEN to .env.local (see npm run setup:uploadthing), then re-run npm run env:push-vercel."
);

console.log("\nTriggering production redeploy…");
const deploy = await api(`/v13/deployments`, {
  method: "POST",
  body: {
    name: "mzveesoaps",
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
console.log("Deploy:", deploy.url ?? deploy.id ?? "started");
