#!/usr/bin/env node
/**
 * Set Square (and maintenance) env vars on Vercel via API.
 * Usage:
 *   SQUARE_ACCESS_TOKEN=... SQUARE_LOCATION_ID=... node scripts/set-square-vercel-env.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const TEAM_ID = "team_o5SfD9J7DXBQHEAbO5MMahF0";
const PROJECT_ID = "prj_JnVlKIC313nE3Swh54UVTPyoxRAF";
const TARGETS = ["production", "preview", "development"];

const VARS = {
  NEXT_PUBLIC_SQUARE_APPLICATION_ID: "sandbox-sq0idb-6tJVJAAx0DaRrbBkjL3A0g",
  SQUARE_ENVIRONMENT: "sandbox",
  SQUARE_ACCESS_TOKEN: process.env.SQUARE_ACCESS_TOKEN?.trim(),
  SQUARE_LOCATION_ID: process.env.SQUARE_LOCATION_ID?.trim(),
  NEXT_PUBLIC_SQUARE_LOCATION_ID: process.env.SQUARE_LOCATION_ID?.trim(),
  MAINTENANCE_MODE: "true",
  MAINTENANCE_MESSAGE:
    "We're refreshing our shop! Online orders return July 1.",
};

function loadToken() {
  if (process.env.VERCEL_TOKEN?.trim()) return process.env.VERCEL_TOKEN.trim();
  const authPath = join(
    homedir(),
    "Library/Application Support/com.vercel.cli/auth.json"
  );
  if (!existsSync(authPath)) throw new Error("No VERCEL_TOKEN or Vercel CLI auth");
  return JSON.parse(readFileSync(authPath, "utf8")).token;
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
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

const token = loadToken();

if (!VARS.SQUARE_ACCESS_TOKEN || !VARS.SQUARE_LOCATION_ID) {
  console.error(
    "Missing SQUARE_ACCESS_TOKEN or SQUARE_LOCATION_ID.\n" +
      "Run: SQUARE_ACCESS_TOKEN='...' SQUARE_LOCATION_ID='...' node scripts/set-square-vercel-env.mjs"
  );
  process.exit(1);
}

console.log("Fetching existing env vars…");
const { envs = [] } = await api(`/v9/projects/${PROJECT_ID}/env`);

for (const [key, value] of Object.entries(VARS)) {
  if (!value) continue;

  for (const e of envs.filter((x) => x.key === key)) {
    await api(`/v9/projects/${PROJECT_ID}/env/${e.id}`, { method: "DELETE" });
    console.log(`Removed ${key} (${e.target?.join(",")})`);
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
  console.log(`Added ${key} (${value.length} chars)`);
}

console.log("\nDone. Redeploy production for changes to take effect.");
