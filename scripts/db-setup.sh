#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env.local ]]; then
  echo "Missing .env.local — copy .env.example and add your Supabase URLs."
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env.local
set +a

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is empty in .env.local."
  echo "Add your Supabase connection string (see .env.example)."
  exit 1
fi

echo "→ Pushing Prisma schema…"
npx prisma db push

echo "→ Seeding products, orders, and admin user…"
npm run db:seed

echo ""
echo "Done. Admin login: admin@msvee.co / msvee-admin-2024"
echo "Copy DATABASE_URL, DIRECT_URL, AUTH_SECRET, and Supabase keys to Vercel → Environment Variables, then redeploy."
