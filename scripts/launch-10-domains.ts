#!/usr/bin/env bun
// Полный автоматический запуск 10 новых доменов:
// 1. Создать зоны в Cloudflare
// 2. Сменить NS в reg.ru через API
// 3. Добавить yandex-verification TXT на каждый домен
// 4. Добавить домены в Yandex Webmaster
// 5. Verify через DNS

const CF_TOKEN = process.env.CF_TOKEN!;
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID!;
const REGRU_USERNAME = process.env.REGRU_USERNAME!;
const REGRU_PASSWORD = process.env.REGRU_PASSWORD!;
const REGRU_URL = process.env.REGRU_API_URL || 'https://api.reg.ru/api/regru2';
const YA_TOKEN = process.env.YANDEX_OAUTH_TOKEN!;
const YA_USER = process.env.YANDEX_WEBMASTER_USER_ID!;

if (!CF_TOKEN || !REGRU_USERNAME || !YA_TOKEN) {
  console.error('Missing creds'); process.exit(1);
}

const DOMAINS = [
  { domain: 'ipoteka-remont.ru', niche: 'Ипотека на ремонт' },
  { domain: 'kuhni-zakaz-online.ru', niche: 'Кухни на заказ' },
  { domain: 'dom-stroy-online.ru', niche: 'Загородные дома' },
  { domain: 'natyazhnoi-master24.ru', niche: 'Натяжные потолки' },
  { domain: 'okna-pvh-online.ru', niche: 'Окна ПВХ' },
  { domain: 'kupeshkafy24.ru', niche: 'Шкафы-купе' },
  { domain: 'dveri-stalnye24.ru', niche: 'Двери стальные' },
  { domain: 'perevodkvartiry.ru', niche: 'Перепланировка' },
  { domain: 'dizayn-interyera-online.ru', niche: 'Дизайн интерьера' },
  { domain: 'kamin-zakaz24.ru', niche: 'Камины и печи' }
];

async function cf(method: string, path: string, body?: unknown) {
  const r = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: { Authorization: `Bearer ${CF_TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  return await r.json() as { success?: boolean; result?: any; errors?: any[] };
}

async function regru(method: string, params: Record<string, unknown>) {
  const allParams = {
    username: REGRU_USERNAME,
    password: REGRU_PASSWORD,
    output_format: 'json',
    ...params
  };
  const formData = new URLSearchParams();
  for (const [k, v] of Object.entries(allParams)) {
    formData.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
  }
  const r = await fetch(`${REGRU_URL}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString()
  });
  return await r.json() as { result?: string; answer?: any; error_text?: string; error_code?: string };
}

async function ya(method: string, path: string, body?: unknown) {
  const r = await fetch(`https://api.webmaster.yandex.net/v4${path}`, {
    method,
    headers: { Authorization: `OAuth ${YA_TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await r.text();
  try { return { status: r.status, ...JSON.parse(text) }; } catch { return { status: r.status, raw: text }; }
}

async function processDomain(d: { domain: string; niche: string }) {
  console.log(`\n══════════ ${d.domain} (${d.niche}) ══════════`);

  // 1. Create CF zone
  console.log('1/5 Создание CF зоны...');
  const cfZone = await cf('POST', '/zones', {
    name: d.domain,
    account: { id: CF_ACCOUNT_ID },
    type: 'full'
  });

  let zoneId = '';
  let nameServers: string[] = [];

  if (cfZone.success) {
    zoneId = cfZone.result.id;
    nameServers = cfZone.result.name_servers;
    console.log(`  ✓ Zone ${zoneId.slice(0, 8)}... · NS: ${nameServers.join(', ')}`);
  } else if (cfZone.errors?.some((e: any) => e.code === 1061 || /already exists/i.test(e.message))) {
    // Уже существует — получим её
    const list = await cf('GET', `/zones?name=${d.domain}`);
    if (list.result?.[0]) {
      zoneId = list.result[0].id;
      nameServers = list.result[0].name_servers;
      console.log(`  · Zone уже есть: ${zoneId.slice(0, 8)}...`);
    }
  } else {
    console.log(`  ✗ ${JSON.stringify(cfZone.errors)}`);
    return { domain: d.domain, success: false };
  }

  if (!zoneId || nameServers.length === 0) {
    console.log('  ✗ Нет zoneId или NS');
    return { domain: d.domain, success: false };
  }

  // 2. Update NS in reg.ru
  console.log('2/5 Обновление NS в reg.ru...');
  const nsUpdate = await regru('domain/update_nss', {
    domains: [{ dname: d.domain }],
    nss: nameServers.map((ns) => ({ ns }))
  });
  if (nsUpdate.result === 'success') {
    console.log(`  ✓ NS обновлены: ${nameServers.join(' / ')}`);
  } else {
    console.log(`  ✗ ${JSON.stringify(nsUpdate).slice(0, 200)}`);
  }

  // 3. Add yandex-verification TXT (используем тот же UIN что и для apex)
  // Получим UIN сначала через добавление хоста в Webmaster
  console.log('3/5 Добавление в Yandex Webmaster...');
  const yaAdd = await ya('POST', `/user/${YA_USER}/hosts`, { host_url: `https://${d.domain}/` });
  let hostId = `https:${d.domain}:443`;
  if (yaAdd.status === 201 && yaAdd.host_id) {
    hostId = yaAdd.host_id;
    console.log(`  ✓ Host добавлен: ${hostId}`);
  } else {
    console.log(`  · ${yaAdd.status}: ${yaAdd.raw?.slice(0,100) || JSON.stringify(yaAdd).slice(0,100)}`);
  }

  // Get verification UIN
  const v = await ya('GET', `/user/${YA_USER}/hosts/${hostId}/verification`) as { verification_uin?: string };
  const uin = v.verification_uin;
  if (uin) {
    console.log(`  ✓ UIN: ${uin}`);

    // 4. Add TXT record in CF
    console.log('4/5 DNS TXT yandex-verification...');
    const dns = await cf('POST', `/zones/${zoneId}/dns_records`, {
      type: 'TXT',
      name: '@',
      content: `yandex-verification: ${uin}`,
      ttl: 300
    });
    if (dns.success) console.log(`  ✓ TXT добавлен`);
    else console.log(`  ✗ ${JSON.stringify(dns.errors).slice(0, 100)}`);
  }

  return { domain: d.domain, success: true, zoneId, nameServers, hostId, uin };
}

async function main() {
  console.log(`🚀 Запуск ${DOMAINS.length} новых доменов\n`);
  const results: Array<{ domain: string; success: boolean; zoneId?: string; nameServers?: string[]; hostId?: string; uin?: string }> = [];
  for (const d of DOMAINS) {
    const r = await processDomain(d);
    results.push(r);
    await new Promise((res) => setTimeout(res, 500));
  }

  console.log('\n\n📊 ИТОГ:');
  let ok = 0, fail = 0;
  for (const r of results) {
    if (r.success) { ok++; console.log(`  ✓ ${r.domain}`); }
    else { fail++; console.log(`  ✗ ${r.domain}`); }
  }
  console.log(`\n${ok} ok / ${fail} fail`);

  // Сохраним результаты для следующих шагов
  await Bun.write('/tmp/launch-10-results.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Результаты в /tmp/launch-10-results.json');
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
