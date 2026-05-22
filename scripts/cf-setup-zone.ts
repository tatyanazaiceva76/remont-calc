#!/usr/bin/env bun
// Настройка CF DNS-зоны после активации (зона должна быть в status=active).
// Что делает:
//   1. Создаёт CNAME www → remont-calc.pages.dev (proxied)
//   2. Создаёт A apex → 192.0.2.1 placeholder (proxied=true, CF потом маршрутизирует на основе Page Rule)
//   3. Создаёт Page Rule: apex → 301 на https://www.kalkremont.ru/$1
//
// Запуск: bun scripts/cf-setup-zone.ts

const CF_TOKEN = process.env.CF_TOKEN;
const DOMAIN = 'kalkremont.ru';

if (!CF_TOKEN) {
  console.error('❌ CF_TOKEN не задан');
  process.exit(1);
}

async function cf(method: string, path: string, body?: unknown) {
  const opts: RequestInit = {
    method,
    headers: { Authorization: `Bearer ${CF_TOKEN}`, 'Content-Type': 'application/json' }
  };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(`https://api.cloudflare.com/client/v4${path}`, opts);
  const text = await r.text();
  try { return JSON.parse(text); } catch { return { _raw: text, _status: r.status }; }
}

async function step(name: string, fn: () => Promise<unknown>) {
  process.stdout.write(`▶ ${name}... `);
  try {
    const r = await fn();
    const json = r as any;
    if (json?.success === false) {
      const errs = json.errors?.map((e: any) => `${e.code}: ${e.message}`).join('; ') || JSON.stringify(json);
      console.log('✗');
      console.log('  !', errs);
      return null;
    }
    console.log('✓');
    return r;
  } catch (e: any) {
    console.log('✗');
    console.log('  !', e.message);
    return null;
  }
}

async function main() {
  console.log(`\n🔧 Настройка CF DNS зоны ${DOMAIN}\n`);

  // 1. Найти zone_id
  const zonesRes = (await step('1. Получить zone_id', () =>
    cf('GET', `/zones?name=${DOMAIN}`)
  )) as any;
  const zone = zonesRes?.result?.[0];
  if (!zone) {
    console.error('Зона не найдена. Сначала добавьте через CF dashboard.');
    process.exit(1);
  }
  const zoneId = zone.id;
  console.log(`  zone_id: ${zoneId}, status: ${zone.status}`);

  if (zone.status !== 'active') {
    console.error(`\n⚠️  Зона ещё не активирована (status=${zone.status}). Подождите 1-24 часа пропагации NS и запустите снова.\n`);
    process.exit(1);
  }

  // 2. Получить существующие DNS-записи
  const recsRes = (await step('2. Получить существующие DNS-записи', () =>
    cf('GET', `/zones/${zoneId}/dns_records?per_page=100`)
  )) as any;
  const existing: Array<{ id: string; name: string; type: string; content: string }> = recsRes?.result ?? [];
  console.log(`  найдено ${existing.length} записей`);

  // 3. Удалить старые A на apex и старые CNAME на www (мы их пересоздадим правильно)
  for (const r of existing) {
    if (r.name === DOMAIN && r.type === 'A') {
      await step(`3. Удалить A ${r.content}`, () =>
        cf('DELETE', `/zones/${zoneId}/dns_records/${r.id}`)
      );
    }
    if (r.name === `www.${DOMAIN}` && (r.type === 'CNAME' || r.type === 'A')) {
      await step(`3. Удалить ${r.type} www → ${r.content}`, () =>
        cf('DELETE', `/zones/${zoneId}/dns_records/${r.id}`)
      );
    }
  }

  // 4. Создать CNAME www → remont-calc.pages.dev (proxied=true)
  await step('4. Создать CNAME www → remont-calc.pages.dev (proxied)', () =>
    cf('POST', `/zones/${zoneId}/dns_records`, {
      type: 'CNAME',
      name: 'www',
      content: 'remont-calc.pages.dev',
      ttl: 1, // 1 = Auto
      proxied: true
    })
  );

  // 5. Создать A apex → 192.0.2.1 (placeholder) с proxied=true
  // CF будет ловить запросы и применять Page Rule / Redirect Rule
  await step('5. Создать A @ → 192.0.2.1 (proxied для редиректа)', () =>
    cf('POST', `/zones/${zoneId}/dns_records`, {
      type: 'A',
      name: '@',
      content: '192.0.2.1',
      ttl: 1,
      proxied: true
    })
  );

  // 6. Создать Single Redirect Rule: kalkremont.ru/* → https://www.kalkremont.ru/$1
  // Через Rulesets API (новый способ)
  const redirectRuleset = {
    name: 'Apex redirect',
    description: `Redirect ${DOMAIN} → www.${DOMAIN}`,
    kind: 'zone',
    phase: 'http_request_dynamic_redirect',
    rules: [
      {
        action: 'redirect',
        action_parameters: {
          from_value: {
            status_code: 301,
            target_url: {
              expression: `concat("https://www.${DOMAIN}", http.request.uri.path)`
            },
            preserve_query_string: true
          }
        },
        expression: `(http.host eq "${DOMAIN}")`,
        description: 'apex → www 301',
        enabled: true
      }
    ]
  };

  await step('6. Создать Redirect Rule apex → www (301)', () =>
    cf('PUT', `/zones/${zoneId}/rulesets/phases/http_request_dynamic_redirect/entrypoint`, redirectRuleset)
  );

  console.log(`\n✅ Готово. Что произошло:`);
  console.log(`   - DNS: www.${DOMAIN} → remont-calc.pages.dev (CF proxy)`);
  console.log(`   - DNS: ${DOMAIN} → CF anycast (proxy)`);
  console.log(`   - Redirect Rule: ${DOMAIN}/* → https://www.${DOMAIN}/* (301)`);
  console.log(`\nПроверьте через 1-5 минут: curl -I https://${DOMAIN}/`);
  console.log(`Должен быть 301 redirect на https://www.${DOMAIN}/`);
}

main().catch((e) => { console.error('❌', e); process.exit(1); });
