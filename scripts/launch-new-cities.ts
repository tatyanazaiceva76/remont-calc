#!/usr/bin/env bun
// Полный запуск 17 новых city subdomains:
// 1. Create CF Pages project (если ещё нет)
// 2. Add CNAME custom domain через CF DNS
// 3. Attach custom domain to Pages project
// 4. Add host в Yandex Webmaster
// 5. Submit sitemap
// 6. IndexNow ping

const CF_TOKEN = process.env.CF_TOKEN!;
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID!;
const YA_TOKEN = process.env.YANDEX_OAUTH_TOKEN!;
const YA_USER = process.env.YANDEX_WEBMASTER_USER_ID!;
const INDEXNOW_KEY = process.env.INDEXNOW_KEY!;

if (!CF_TOKEN || !YA_TOKEN || !INDEXNOW_KEY) {
  console.error('Missing creds'); process.exit(1);
}

const ZONE_ID = 'e2dffd935af0f961ba79dac8717d6b26'; // kalkremont.ru zone

const NEW_CITIES = [
  { sub: 'astr', name: 'Астрахань' },
  { sub: 'cbx', name: 'Чебоксары' },
  { sub: 'irk', name: 'Иркутск' },
  { sub: 'izh', name: 'Ижевск' },
  { sub: 'kem', name: 'Кемерово' },
  { sub: 'khv', name: 'Хабаровск' },
  { sub: 'kir', name: 'Киров' },
  { sub: 'kld', name: 'Калининград' },
  { sub: 'lpk', name: 'Липецк' },
  { sub: 'oren', name: 'Оренбург' },
  { sub: 'pnz', name: 'Пенза' },
  { sub: 'rzn', name: 'Рязань' },
  { sub: 'sar', name: 'Саратов' },
  { sub: 'tlt', name: 'Тольятти' },
  { sub: 'tul', name: 'Тула' },
  { sub: 'vvo', name: 'Владивосток' },
  { sub: 'yar', name: 'Ярославль' }
];

async function cfApi(method: string, path: string, body?: unknown) {
  const r = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: { Authorization: `Bearer ${CF_TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  return { status: r.status, body: await r.json() as { success?: boolean; result?: any; errors?: any[] } };
}

async function yaApi(method: string, path: string, body?: unknown) {
  const r = await fetch(`https://api.webmaster.yandex.net/v4${path}`, {
    method,
    headers: { Authorization: `OAuth ${YA_TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  return { status: r.status, body: await r.text() };
}

async function processCity(sub: string, name: string) {
  const fullHost = `${sub}.kalkremont.ru`;
  const projectName = `kalkremont-${sub}`;
  console.log(`\n══════════ ${fullHost} (${name}) ══════════`);

  // 1. Create CF Pages project (Direct Upload)
  console.log('1/6 Создание CF Pages project…');
  const create = await cfApi('POST', `/accounts/${CF_ACCOUNT_ID}/pages/projects`, {
    name: projectName,
    production_branch: 'main'
  });
  if (create.body.success) {
    console.log(`  ✓ Project ${projectName} создан`);
  } else if (create.body.errors?.some((e: any) => e.code === 8000007 || /already exists/i.test(e.message))) {
    console.log(`  · уже существует`);
  } else {
    console.log(`  ✗ ${JSON.stringify(create.body.errors)}`);
  }

  // 2. Add CNAME в Cloudflare DNS
  console.log('2/6 CNAME запись…');
  const dns = await cfApi('POST', `/zones/${ZONE_ID}/dns_records`, {
    type: 'CNAME',
    name: sub,
    content: `${projectName}.pages.dev`,
    ttl: 1,
    proxied: true
  });
  if (dns.body.success) console.log(`  ✓ CNAME ${sub}.kalkremont.ru → ${projectName}.pages.dev`);
  else if (dns.body.errors?.some((e: any) => /already exists/i.test(e.message) || e.code === 81057)) console.log(`  · CNAME уже есть`);
  else console.log(`  ✗ ${JSON.stringify(dns.body.errors)}`);

  // 3. Attach custom domain to Pages project
  console.log('3/6 Привязка custom domain к Pages…');
  const dom = await cfApi('POST', `/accounts/${CF_ACCOUNT_ID}/pages/projects/${projectName}/domains`, {
    name: fullHost
  });
  if (dom.body.success) console.log(`  ✓ domain ${fullHost} привязан`);
  else if (dom.body.errors?.some((e: any) => /already exists/i.test(e.message))) console.log(`  · уже привязан`);
  else console.log(`  ✗ ${JSON.stringify(dom.body.errors)}`);

  // 4. Add в Yandex Webmaster
  console.log('4/6 Yandex Webmaster…');
  const ya = await yaApi('POST', `/user/${YA_USER}/hosts`, { host_url: `https://${fullHost}/` });
  console.log(`  ${ya.status === 201 ? '✓' : ya.status === 400 ? '·' : '✗'} ${ya.body.slice(0, 120)}`);

  // 5. Submit sitemap (после deploy будет работать)
  // Skip пока — нужно после deploy

  console.log(`  → готов к deploy через scripts/deploy-all-apps.sh ${sub}`);
}

async function main() {
  console.log(`🚀 Запуск ${NEW_CITIES.length} новых city subdomains\n`);
  for (const c of NEW_CITIES) {
    await processCity(c.sub, c.name);
    await new Promise((r) => setTimeout(r, 500));
  }
  console.log('\n✅ Готово. Дальше: build + deploy + verify в Yandex Webmaster через DNS');
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
