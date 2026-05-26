#!/usr/bin/env bash
# Деплой всех 30 subdomain apps на CF Pages через wrangler.
# Требует: node + npx + bun (для build).
set -e

cd "$(dirname "$0")/.."
set -a && source .env.local && set +a
export CLOUDFLARE_API_TOKEN="$CF_TOKEN" CLOUDFLARE_ACCOUNT_ID="$CF_ACCOUNT_ID"
export PATH="/opt/homebrew/bin:$PATH"

APPS=(
  moskva spb ekb kzn nsk krd nn chel ufa sam rnd vrn perm vlg tyumen brn
  vannye kuhni okna potolki dveri elektro santehnika dizayn balkony styazhka
  uborka demontazh kondicioner fasad
  price sovety brand
)

# Опц. arg = subset (через пробел)
if [ $# -gt 0 ]; then
  APPS=("$@")
fi

OK=0; FAIL=0; FAILED_APPS=()
for app in "${APPS[@]}"; do
  if [ ! -d "apps/$app" ]; then
    echo "✗ apps/$app не существует, пропускаю"
    continue
  fi
  echo ""
  echo "════════════════════════════════════════"
  echo "▶ $app ($(($OK+$FAIL+1))/${#APPS[@]})"
  echo "════════════════════════════════════════"

  # Build (если dist старый или отсутствует)
  cd "apps/$app"
  if [ ! -d dist ] || [ "$(find src -newer dist -type f 2>/dev/null | head -1)" ]; then
    echo "🔨 build…"
    bun install --silent 2>&1 | tail -2
    bun run build 2>&1 | tail -3
  else
    echo "✓ dist актуален, build пропущен"
  fi

  # Deploy
  echo "🚀 deploy…"
  if npx -y wrangler@latest pages deploy dist --project-name="kalkremont-$app" --branch=main --commit-dirty=true --commit-message="auto $(date +%H%M)" 2>&1 | tail -4; then
    OK=$((OK+1))
  else
    FAIL=$((FAIL+1))
    FAILED_APPS+=("$app")
  fi
  cd ../..
done

echo ""
echo "════════════════════════════════════════"
echo "📊 ИТОГО: OK=$OK · FAIL=$FAIL"
if [ ${#FAILED_APPS[@]} -gt 0 ]; then
  echo "Failed: ${FAILED_APPS[*]}"
fi
