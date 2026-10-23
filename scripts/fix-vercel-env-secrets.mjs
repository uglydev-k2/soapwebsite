#!/usr/bin/env node
/**
 * Removes deprecated public Square/maintenance env keys and re-upserts secrets as Vercel "sensitive".
 * Does not print secret values. Requires VERCEL_TOKEN or `vercel login`.
 *
 *   node scripts/fix-vercel-env-secrets.mjs
 *   node scripts/fix-vercel-env-secrets.mjs --redeploy
 */
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  VERCEL_DEPRECATED_ENV_KEYS,
  vercelApiEnvType,
} from "./vercel-env-types.mjs";

const TEAM_ID = process.env.VERCEL_TEAM_ID ?? "team_o5SfD9J7DXBQHEAbO5MMahF0";
const PROJECT_ID = process.env.VERCEL_PROJECT_ID ?? "prj_JnVlKIC313nE3Swh54UVTPyoxRAF";
const TARGETS = ["production", "preview", "development"];
const redeploy = process.argv.includes("--redeploy");

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

async function deleteKey(token, envs, key) {
  for (const e of envs.filter((x) => x.key === key)) {
    await api(token, `/v9/projects/${PROJECT_ID}/env/${e.id}`, { method: "DELETE" });
    console.log(`Removed ${key} (${e.target?.join(",") ?? "?"})`);
  }
}

async function upsertSensitive(token, envs, key, value) {
  const apiType = vercelApiEnvType(key);
  if (!apiType) return;

  await deleteKey(token, envs, key);
  await api(token, `/v10/projects/${PROJECT_ID}/env`, {
    method: "POST",
    body: {
      key,
      value,
      type: apiType,
      target: TARGETS,
    },
  });
  console.log(`Set ${key} as ${apiType}`);
}

const token = loadToken();
console.log("Fetching Vercel env vars…");
const { envs = [] } = await api(token, `/v9/projects/${PROJECT_ID}/env`);

for (const key of VERCEL_DEPRECATED_ENV_KEYS) {
  const entries = envs.filter((e) => e.key === key);
  if (entries.length === 0) continue;

  if (key === "NEXT_PUBLIC_SQUARE_APPLICATION_ID") {
    const value = entries[0]?.value;
    const hasServerKey = envs.some((e) => e.key === "SQUARE_APPLICATION_ID");
    if (value && !hasServerKey) {
      await upsertSensitive(token, envs, "SQUARE_APPLICATION_ID", value);
    }
  }

  await deleteKey(token, envs, key);
}

const { envs: envsAfter = [] } = await api(token, `/v9/projects/${PROJECT_ID}/env`);

for (const e of envsAfter) {
  const desired = vercelApiEnvType(e.key);
  if (!desired || desired === "plain") continue;
  if (e.type === "sensitive" || e.type === "encrypted") continue;
  if (!e.value) continue;

  console.log(`Re-marking ${e.key} (${e.type} → sensitive)…`);
  await upsertSensitive(token, envsAfter, e.key, e.value);
}

console.log("\nDone. Redeploy production for runtime changes.");

if (redeploy) {
  console.log("Triggering production redeploy…");
  const deploy = await api(token, `/v13/deployments`, {
    method: "POST",
    body: {
      name: "msvee-soaps",
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
}
