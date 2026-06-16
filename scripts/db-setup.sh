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

echo "→ Applying Prisma schema (Supabase-safe SQL)…"
npx prisma db execute --file scripts/init-prisma-tables.sql --schema prisma/schema.prisma 2>/dev/null || {
  echo "→ SQL init skipped (tables may already exist); trying prisma db push…"
  npx prisma db push || true
}

echo "→ Seeding products, orders, and admin user…"
npm run db:seed

echo ""
echo "Done. Admin login: mvlusciouslather@gmail.com / (your admin password)"
echo "Copy env vars to Vercel → Environment Variables, then redeploy."
