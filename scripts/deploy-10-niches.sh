#!/usr/bin/env bash
# Полный деплой 10 новых ниш на CF Pages + привязка custom domain.
set -e
cd "$(dirname "$0")/.."
set -a && source .env.local && set +a
export CLOUDFLARE_API_TOKEN="$CF_TOKEN" CLOUDFLARE_ACCOUNT_ID="$CF_ACCOUNT_ID"
export PATH="/opt/homebrew/bin:$PATH"

APPS=(
  ipoteka-remont
  kuhni-zakaz-online
  dom-stroy-online
  natyazhnoi-master24
  okna-pvh-online
  kupeshkafy24
  dveri-stalnye24
  perevodkvartiry
  dizayn-interyera-online
  kamin-zakaz24
)

# Mapping app -> custom domain
declare -A DOMAINS=(
  [ipoteka-remont]="ipoteka-remont.ru"
  [kuhni-zakaz-online]="kuhni-zakaz-online.ru"
  [dom-stroy-online]="dom-stroy-online.ru"
  [natyazhnoi-master24]="natyazhnoi-master24.ru"
  [okna-pvh-online]="okna-pvh-online.ru"
  [kupeshkafy24]="kupeshkafy24.ru"
  [dveri-stalnye24]="dveri-stalnye24.ru"
  [perevodkvartiry]="perevodkvartiry.ru"
  [dizayn-interyera-online]="dizayn-interyera-online.ru"
  [kamin-zakaz24]="kamin-zakaz24.ru"
)

OK=0
FAIL=0

for app in "${APPS[@]}"; do
  domain="${DOMAINS[$app]}"
  project="kalkremont-$app"
  echo ""
  echo "════════════ $app → $domain ════════════"

  # 1. Create CF Pages project if not exists
  exists=$(curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/pages/projects/$project" \
    -H "Authorization: Bearer $CF_TOKEN" | bun -e "
    const j = JSON.parse(require('fs').readFileSync(0,'utf8'));
    console.log(j.success ? 'yes' : 'no');
  ")

  if [ "$exists" = "no" ]; then
    echo "1/3 Создание CF Pages project..."
    create=$(curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/pages/projects" \
      -H "Authorization: Bearer $CF_TOKEN" -H "Content-Type: application/json" \
      -d "{\"name\":\"$project\",\"production_branch\":\"main\"}")
    success=$(echo "$create" | bun -e "
      const j = JSON.parse(require('fs').readFileSync(0,'utf8'));
      console.log(j.success ? 'ok' : (j.errors?.[0]?.message || 'fail'));
    ")
    echo "  $success"
  else
    echo "1/3 Project $project уже существует"
  fi

  # 2. Deploy
  echo "2/3 Deploy..."
  cd "apps/$app"
  result=$(npx -y wrangler@latest pages deploy dist --project-name="$project" --branch=main --commit-dirty=true --commit-message="initial" 2>&1 | tail -2)
  echo "  $result"
  cd ../..

  # 3. Attach custom domain
  echo "3/3 Привязка domain..."
  bind=$(curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/pages/projects/$project/domains" \
    -H "Authorization: Bearer $CF_TOKEN" -H "Content-Type: application/json" \
    -d "{\"name\":\"$domain\"}" | bun -e "
    const j = JSON.parse(require('fs').readFileSync(0,'utf8'));
    if (j.success) console.log('✓ ' + '$domain' + ' привязан');
    else if (j.errors?.some(e => /already exists/i.test(e.message))) console.log('· уже привязан');
    else console.log('✗ ' + JSON.stringify(j.errors).slice(0, 100));
  ")
  echo "  $bind"

  if echo "$result" | grep -q "Deployment complete"; then
    OK=$((OK+1))
  else
    FAIL=$((FAIL+1))
  fi
done

echo ""
echo "════════════ ИТОГО ════════════"
echo "✓ OK: $OK"
echo "✗ FAIL: $FAIL"
