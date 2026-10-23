#!/usr/bin/env node
/**
 * Push production Square non-secret env vars to Vercel (requires `vercel login` locally).
 *
 *   node scripts/push-square-production-env.mjs
 *
 * For the access token (secret), run after Replace in Square Developer:
 *   SQUARE_ACCESS_TOKEN='...' SQUARE_LOCATION_ID='LE5DFKVXGDR9G' node scripts/set-square-vercel-env.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { vercelApiEnvType } from "./vercel-env-types.mjs";

const TEAM_ID = "team_o5SfD9J7DXBQHEAbO5MMahF0";
const PROJECT_ID = "prj_JnVlKIC313nE3Swh54UVTPyoxRAF";
const TARGETS = ["production", "preview", "development"];

const VARS = {
  SQUARE_APPLICATION_ID: "sq0idp-p63YRslhWg8KWRBfQdxbug",
  SQUARE_ENVIRONMENT: "production",
};

function loadToken() {
  if (process.env.VERCEL_TOKEN?.trim()) return process.env.VERCEL_TOKEN.trim();
  const authPath = join(
    homedir(),
    "Library/Application Support/com.vercel.cli/auth.json"
  );
  if (!existsSync(authPath)) throw new Error("Run: npx vercel login");
  return JSON.parse(readFileSync(authPath, "utf8")).token;
}

async function api(token, path, { method = "GET", body } = {}) {
  const url = `https://api.vercel.com${path}${path.includes("?") ? "&" : "?"}teamId=${TEAM_ID}`;
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

async function upsertEnv(token, envs, key, value) {
  for (const e of envs.filter((x) => x.key === key)) {
    await api(token, `/v9/projects/${PROJECT_ID}/env/${e.id}`, { method: "DELETE" });
  }
  const type = vercelApiEnvType(key) ?? "sensitive";
  await api(token, `/v10/projects/${PROJECT_ID}/env`, {
    method: "POST",
    body: { key, value, type, target: TARGETS },
  });
  console.log(`Set ${key} (${type})`);
}

const token = loadToken();
const { envs = [] } = await api(token, `/v9/projects/${PROJECT_ID}/env`);
for (const [key, value] of Object.entries(VARS)) {
  await upsertEnv(token, envs, key, value);
}

for (const key of ["NEXT_PUBLIC_SQUARE_APPLICATION_ID", "NEXT_PUBLIC_SQUARE_LOCATION_ID"]) {
  for (const e of envs.filter((x) => x.key === key)) {
    await api(token, `/v9/projects/${PROJECT_ID}/env/${e.id}`, { method: "DELETE" });
    console.log(`Removed deprecated ${key}`);
  }
}

console.log("\nDone. Redeploy production on Vercel.");
