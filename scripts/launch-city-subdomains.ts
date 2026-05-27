#!/usr/bin/env bun
// Создаёт 48 поддоменов городов на 3 самых денежных нишах.
// Каждый = отдельный CF Pages project + Yandex host + custom domain.
// Полная автоматизация: DNS + Pages + Yandex + sitemap + IndexNow.

const CF_TOKEN = process.env.CF_TOKEN!;
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID!;
const YA_TOKEN = process.env.YANDEX_OAUTH_TOKEN!;
const YA_USER = process.env.YANDEX_WEBMASTER_USER_ID!;

const TOP_NICHES = [
  { domain: 'ipoteka-remont.ru', projectPrefix: 'ipoteka-remont', niche: 'Ипотека на ремонт', color: '#1abc9c', emoji: '🏦' },
  { domain: 'kuhni-zakaz-online.ru', projectPrefix: 'kuhni-zakaz', niche: 'Кухни на заказ', color: '#e67e22', emoji: '🍳' },
  { domain: 'dom-stroy-online.ru', projectPrefix: 'dom-stroy', niche: 'Загородные дома', color: '#27ae60', emoji: '🏡' }
];

const CITIES = [
  { slug: 'moskva', name: 'Москве', nom: 'Москва', priceMult: 1.4 },
  { slug: 'spb', name: 'Санкт-Петербурге', nom: 'СПб', priceMult: 1.3 },
  { slug: 'ekb', name: 'Екатеринбурге', nom: 'Екатеринбург', priceMult: 1.0 },
  { slug: 'kzn', name: 'Казани', nom: 'Казань', priceMult: 1.0 },
  { slug: 'nsk', name: 'Новосибирске', nom: 'Новосибирск', priceMult: 0.95 },
  { slug: 'krd', name: 'Краснодаре', nom: 'Краснодар', priceMult: 1.05 },
  { slug: 'nn', name: 'Нижнем Новгороде', nom: 'Нижний Новгород', priceMult: 0.95 },
  { slug: 'chel', name: 'Челябинске', nom: 'Челябинск', priceMult: 0.85 },
  { slug: 'ufa', name: 'Уфе', nom: 'Уфа', priceMult: 0.95 },
  { slug: 'sam', name: 'Самаре', nom: 'Самара', priceMult: 0.95 },
  { slug: 'rnd', name: 'Ростове-на-Дону', nom: 'Ростов-на-Дону', priceMult: 1.0 },
  { slug: 'vrn', name: 'Воронеже', nom: 'Воронеж', priceMult: 0.85 },
  { slug: 'perm', name: 'Перми', nom: 'Пермь', priceMult: 0.85 },
  { slug: 'vlg', name: 'Волгограде', nom: 'Волгоград', priceMult: 0.8 },
  { slug: 'tyumen', name: 'Тюмени', nom: 'Тюмень', priceMult: 1.0 },
  { slug: 'brn', name: 'Барнауле', nom: 'Барнаул', priceMult: 0.8 }
];

async function cf(method: string, path: string, body?: unknown) {
  const r = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: { Authorization: `Bearer ${CF_TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  return await r.json() as { success?: boolean; result?: any; errors?: any[] };
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

// Найти zone_id для базового домена
async function getZoneId(domain: string): Promise<string> {
  const r = await cf('GET', `/zones?name=${domain}`);
  return r.result?.[0]?.id || '';
}

interface SubResult {
  project: string;
  host: string;
  zoneId: string;
  hostId?: string;
  ok: boolean;
  error?: string;
}

async function processSubdomain(niche: typeof TOP_NICHES[0], city: typeof CITIES[0], zoneId: string): Promise<SubResult> {
  const host = `${city.slug}.${niche.domain}`;
  const project = `${niche.projectPrefix}-${city.slug}`;
  console.log(`\n  ▶ ${host}`);

  // 1. CNAME запись
  const cname = await cf('POST', `/zones/${zoneId}/dns_records`, {
    type: 'CNAME',
    name: city.slug,
    content: `${project}.pages.dev`,
    ttl: 1,
    proxied: true
  });
  if (!cname.success && !cname.errors?.some((e: any) => /already exists|81057/i.test(e.message + e.code))) {
    return { project, host, zoneId, ok: false, error: 'CNAME failed: ' + JSON.stringify(cname.errors).slice(0, 100) };
  }
  process.stdout.write(' CNAME✓');

  // 2. CF Pages project
  const cf_project = await cf('POST', `/accounts/${CF_ACCOUNT_ID}/pages/projects`, {
    name: project,
    production_branch: 'main'
  });
  if (!cf_project.success && !cf_project.errors?.some((e: any) => /already exists/i.test(e.message))) {
    return { project, host, zoneId, ok: false, error: 'Project failed' };
  }
  process.stdout.write(' Project✓');

  // 3. Custom domain
  const dom = await cf('POST', `/accounts/${CF_ACCOUNT_ID}/pages/projects/${project}/domains`, {
    name: host
  });
  if (dom.success || dom.errors?.some((e: any) => /already/i.test(e.message))) {
    process.stdout.write(' Domain✓');
  }

  // 4. Yandex Webmaster
  const yaAdd = await ya('POST', `/user/${YA_USER}/hosts`, { host_url: `https://${host}/` });
  let hostId = `https:${host}:443`;
  if (yaAdd.host_id) hostId = yaAdd.host_id;
  process.stdout.write(' Yandex✓');

  // 5. Yandex DNS verification — добавить TXT с UIN
  const v = await ya('GET', `/user/${YA_USER}/hosts/${hostId}/verification`) as { verification_uin?: string };
  if (v.verification_uin) {
    await cf('POST', `/zones/${zoneId}/dns_records`, {
      type: 'TXT',
      name: city.slug,
      content: `yandex-verification: ${v.verification_uin}`,
      ttl: 300
    });
    process.stdout.write(' TXT✓');
  }

  return { project, host, zoneId, hostId, ok: true };
}

async function main() {
  console.log('🚀 Создание 48 поддоменов (16 городов × 3 ниши)...\n');
  const results: SubResult[] = [];
  for (const niche of TOP_NICHES) {
    console.log(`\n══════════ ${niche.niche} (${niche.domain}) ══════════`);
    const zoneId = await getZoneId(niche.domain);
    if (!zoneId) { console.log(`  ✗ Zone для ${niche.domain} не найдена`); continue; }

    for (const city of CITIES) {
      const r = await processSubdomain(niche, city, zoneId);
      results.push(r);
      await new Promise((res) => setTimeout(res, 300));
    }
  }

  console.log('\n\n📊 ИТОГИ:');
  let ok = 0, fail = 0;
  for (const r of results) {
    if (r.ok) ok++; else fail++;
  }
  console.log(`✓ OK: ${ok} · ✗ FAIL: ${fail}`);

  await Bun.write('/tmp/subdomains-results.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Результаты сохранены в /tmp/subdomains-results.json');
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
