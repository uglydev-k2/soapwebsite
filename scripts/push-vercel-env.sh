#!/usr/bin/env bash
# Push .env.local variables to Vercel (requires: vercel login OR VERCEL_TOKEN)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env.local ]]; then
  echo "Missing .env.local"
  exit 1
fi

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  if ! npx vercel@latest whoami &>/dev/null; then
    echo "Not logged in to Vercel. Run: npx vercel login"
    echo "Or set VERCEL_TOKEN from https://vercel.com/account/tokens"
    exit 1
  fi
fi

set -a
# shellcheck disable=SC1091
source .env.local
set +a

VARS=(
  DATABASE_URL
  DIRECT_URL
  AUTH_SECRET
  NEXTAUTH_URL
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
)

ENVIRONMENTS="production preview development"

echo "Linking project (if needed)…"
npx vercel@latest link --yes 2>/dev/null || npx vercel@latest link

for key in "${VARS[@]}"; do
  val="${!key:-}"
  if [[ -z "$val" ]]; then
    echo "Skip $key (empty in .env.local)"
    continue
  fi
  echo "→ Adding $key to Vercel…"
  for env in $ENVIRONMENTS; do
    printf '%s' "$val" | npx vercel@latest env add "$key" "$env" --force
  done
done

echo ""
echo "Done. Redeploy: npx vercel --prod"
