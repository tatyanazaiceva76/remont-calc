#!/usr/bin/env bun
// Финализатор сетапа: вызывается после того, как DNS пропагировался.
// Делает: проверка TXT, верификация Webmaster, загрузка sitemap, запрос переобхода.

const YANDEX_OAUTH_TOKEN = process.env.YANDEX_OAUTH_TOKEN;
const YANDEX_WEBMASTER_USER_ID = process.env.YANDEX_WEBMASTER_USER_ID;
const HOST_ID = process.env.YANDEX_WEBMASTER_HOST_ID || 'https:kalkremont.ru:443';
const DOMAIN = 'kalkremont.ru';
const UIN = process.env.YANDEX_WEBMASTER_VERIFICATION_UIN || '';

if (!YANDEX_OAUTH_TOKEN || !YANDEX_WEBMASTER_USER_ID) {
  console.error('❌ YANDEX_OAUTH_TOKEN / YANDEX_WEBMASTER_USER_ID not set');
  process.exit(1);
}

async function ya(method: string, path: string, body?: unknown) {
  const opts: RequestInit = {
    method,
    headers: { Authorization: `OAuth ${YANDEX_OAUTH_TOKEN}`, 'Content-Type': 'application/json' }
  };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(`https://api.webmaster.yandex.net/v4${path}`, opts);
  const text = await r.text();
  try { return JSON.parse(text); } catch { return { _raw: text, _status: r.status }; }
}

async function step(name: string, fn: () => Promise<unknown>) {
  process.stdout.write(`▶ ${name}... `);
  try {
    const r = await fn();
    console.log('✓');
    console.log('  →', JSON.stringify(r).slice(0, 300));
    return r;
  } catch (e: any) {
    console.log('✗');
    console.log('  ! ', e.message);
    return null;
  }
}

async function main() {
  console.log(`\n🚀 Финализация ${DOMAIN}\n`);

  // 1. Запросить верификацию (она перепроверит TXT)
  await step('1. Запрос DNS-верификации в Webmaster', () =>
    ya('POST', `/user/${YANDEX_WEBMASTER_USER_ID}/hosts/${HOST_ID}/verification?verification_type=DNS`)
  );

  // 2. Ждём чтобы Яндекс реально проверил (он делает это асинхронно, обычно сразу)
  await new Promise((r) => setTimeout(r, 5000));

  // 3. Проверить статус верификации
  const verif = (await step('2. Статус верификации', () =>
    ya('GET', `/user/${YANDEX_WEBMASTER_USER_ID}/hosts/${HOST_ID}/verification`)
  )) as any;

  const verified = verif?.verification_state === 'VERIFIED';
  if (!verified) {
    console.log(`\n⚠️  Верификация не прошла (state=${verif?.verification_state}). Возможно DNS ещё не пропагнулся.\n`);
    console.log('Подожди 5-10 минут и запусти ещё раз: bun scripts/finalize.ts\n');
    return;
  }

  // 4. Загрузить sitemap
  await step('3. Загрузка sitemap', () =>
    ya('POST', `/user/${YANDEX_WEBMASTER_USER_ID}/hosts/${HOST_ID}/user-added-sitemaps`, {
      url: `https://${DOMAIN}/sitemap.xml`
    })
  );

  // 5. Запросить переобход ключевых URL
  const importantUrls = [
    `https://${DOMAIN}/`,
    `https://${DOMAIN}/raschet-oboev/`,
    `https://${DOMAIN}/raschet-laminata/`,
    `https://${DOMAIN}/raschet-kraski/`,
    `https://${DOMAIN}/raschet-plitki/`,
    `https://${DOMAIN}/raschet-oboev/na-komnatu-18-kv-m/`,
    `https://${DOMAIN}/raschet-oboev/na-spalnyu/`,
    `https://${DOMAIN}/raschet-laminata/na-komnatu-20-kv-m/`,
    `https://${DOMAIN}/raschet-kraski/na-komnatu-15-kv-m/`,
    `https://${DOMAIN}/raschet-plitki/na-vannuyu/`
  ];

  for (const url of importantUrls) {
    await step(`4. Recrawl: ${url}`, () =>
      ya('POST', `/user/${YANDEX_WEBMASTER_USER_ID}/hosts/${HOST_ID}/recrawl/queue`, { url })
    );
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n✅ Готово. Сайт в системе Яндекса, sitemap загружен, переобход ${importantUrls.length} ключевых URL запрошен.\n`);
  console.log(`📊 Метрика: https://metrika.yandex.ru/dashboard?id=${process.env.YANDEX_METRIKA_COUNTER_ID}`);
  console.log(`🔍 Вебмастер: https://webmaster.yandex.ru/site/${HOST_ID}/`);
}

main().catch((e) => { console.error('❌', e); process.exit(1); });
