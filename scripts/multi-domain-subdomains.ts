#!/usr/bin/env bun
// Multi-domain trick: цепляем поддомены к существующим Pages projects.
// Не упирается в лимит 100 projects, но даёт отдельные хосты в Yandex.
// 7 ниш × 16 городов = 112 поддоменов + 9 dom-stroy = 121 новый хост.

const CF_TOKEN = process.env.CF_TOKEN!;
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID!;
const YA_TOKEN = process.env.YANDEX_OAUTH_TOKEN!;
const YA_USER = process.env.YANDEX_WEBMASTER_USER_ID!;

const PLAN = [
  // 9 missing dom-stroy
  { domain: 'dom-stroy-online.ru', existingProject: 'kalkremont-dom-stroy-online', missing: ['chel','ufa','sam','rnd','vrn','perm','vlg','tyumen','brn'] },
  // 7 niches × 16 cities
  { domain: 'natyazhnoi-master24.ru', existingProject: 'kalkremont-natyazhnoi-master24', missing: ['moskva','spb','ekb','kzn','nsk','krd','nn','chel','ufa','sam','rnd','vrn','perm','vlg','tyumen','brn'] },
  { domain: 'okna-pvh-online.ru', existingProject: 'kalkremont-okna-pvh-online', missing: ['moskva','spb','ekb','kzn','nsk','krd','nn','chel','ufa','sam','rnd','vrn','perm','vlg','tyumen','brn'] },
  { domain: 'kupeshkafy24.ru', existingProject: 'kalkremont-kupeshkafy24', missing: ['moskva','spb','ekb','kzn','nsk','krd','nn','chel','ufa','sam','rnd','vrn','perm','vlg','tyumen','brn'] },
  { domain: 'dveri-stalnye24.ru', existingProject: 'kalkremont-dveri-stalnye24', missing: ['moskva','spb','ekb','kzn','nsk','krd','nn','chel','ufa','sam','rnd','vrn','perm','vlg','tyumen','brn'] },
  { domain: 'perevodkvartiry.ru', existingProject: 'kalkremont-perevodkvartiry', missing: ['moskva','spb','ekb','kzn','nsk','krd','nn','chel','ufa','sam','rnd','vrn','perm','vlg','tyumen','brn'] },
  { domain: 'dizayn-interyera-online.ru', existingProject: 'kalkremont-dizayn-interyera-online', missing: ['moskva','spb','ekb','kzn','nsk','krd','nn','chel','ufa','sam','rnd','vrn','perm','vlg','tyumen','brn'] },
  { domain: 'kamin-zakaz24.ru', existingProject: 'kalkremont-kamin-zakaz24', missing: ['moskva','spb','ekb','kzn','nsk','krd','nn','chel','ufa','sam','rnd','vrn','perm','vlg','tyumen','brn'] }
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

async function getZoneId(domain: string): Promise<string> {
  const r = await cf('GET', `/zones?name=${domain}`);
  return r.result?.[0]?.id || '';
}

let totalOk = 0, totalFail = 0;
const results: any[] = [];

for (const niche of PLAN) {
  const zoneId = await getZoneId(niche.domain);
  console.log(`\n══════════ ${niche.domain} (zone ${zoneId.slice(0, 8)}) ══════════`);
  if (!zoneId) { console.log('  ✗ zone not found'); continue; }

  for (const city of niche.missing) {
    const host = `${city}.${niche.domain}`;
    process.stdout.write(`  ${host.padEnd(40)}`);

    // 1. CNAME → existing project
    const cname = await cf('POST', `/zones/${zoneId}/dns_records`, {
      type: 'CNAME',
      name: city,
      content: `${niche.existingProject}.pages.dev`,
      ttl: 1,
      proxied: true
    });
    const cnameOk = cname.success || cname.errors?.some((e: any) => /already/i.test(e.message + e.code));
    process.stdout.write(cnameOk ? ' CNAME✓' : ' CNAME✗');

    // 2. Add custom domain to existing project
    const dom = await cf('POST', `/accounts/${CF_ACCOUNT_ID}/pages/projects/${niche.existingProject}/domains`, {
      name: host
    });
    const domOk = dom.success || dom.errors?.some((e: any) => /already/i.test(e.message));
    process.stdout.write(domOk ? ' Domain✓' : ' Domain✗');

    // 3. Yandex Webmaster
    const yaAdd = await ya('POST', `/user/${YA_USER}/hosts`, { host_url: `https://${host}/` });
    const hostId = yaAdd.host_id || `https:${host}:443`;
    process.stdout.write(' Ya✓');

    // 4. Get UIN + add TXT
    const v = await ya('GET', `/user/${YA_USER}/hosts/${hostId}/verification`) as { verification_uin?: string };
    if (v.verification_uin) {
      await cf('POST', `/zones/${zoneId}/dns_records`, {
        type: 'TXT',
        name: city,
        content: `yandex-verification: ${v.verification_uin}`,
        ttl: 300
      });
      process.stdout.write(' TXT✓');
    }

    // 5. Submit sitemap (главный домена — общий для всех)
    await ya('POST', `/user/${YA_USER}/hosts/${hostId}/user-added-sitemaps`, {
      url: `https://${host}/sitemap.xml`
    });
    process.stdout.write(' SM✓');

    console.log('');
    results.push({ domain: niche.domain, host, hostId, project: niche.existingProject });

    if (cnameOk && domOk) totalOk++; else totalFail++;
    await new Promise((r) => setTimeout(r, 300));
  }
}

console.log('\n\n📊 ИТОГИ:');
console.log(`  ✓ OK: ${totalOk}`);
console.log(`  ✗ FAIL: ${totalFail}`);
console.log(`  Hosts added: ${results.length}`);

await Bun.write('/tmp/multi-domain-results.json', JSON.stringify(results, null, 2));
console.log('\n✅ Сохранено в /tmp/multi-domain-results.json');
