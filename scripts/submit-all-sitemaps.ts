#!/usr/bin/env bun
// Submit/проверяет все sitemap'ы в Yandex Webmaster для всех хостов сети.
// Безопасно вызывать многократно — Webmaster вернёт sitemap_id (уже добавленный или новый).

const TOKEN = process.env.YANDEX_OAUTH_TOKEN;
const USER_ID = process.env.YANDEX_WEBMASTER_USER_ID;
if (!TOKEN || !USER_ID) { console.error('Missing creds'); process.exit(1); }

const HOSTS = [
  'www', 'price', 'sovety', 'brand',
  'moskva', 'spb', 'ekb', 'kzn',
  'nsk', 'krd', 'nn', 'chel', 'ufa', 'sam', 'rnd', 'vrn', 'perm', 'vlg', 'tyumen', 'brn',
  // 14 ниш — отсутствовали ранее, что и было причиной NOT_LOADED у них
  'vannye', 'kuhni', 'okna', 'potolki', 'dveri', 'elektro',
  'santehnika', 'dizayn', 'balkony', 'styazhka',
  'uborka', 'demontazh', 'kondicioner', 'fasad'
];

async function ya(method: string, path: string, body?: unknown) {
  const opts: RequestInit = {
    method,
    headers: { Authorization: `OAuth ${TOKEN}`, 'Content-Type': 'application/json' }
  };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(`https://api.webmaster.yandex.net/v4${path}`, opts);
  const text = await r.text();
  try { return { _status: r.status, ...JSON.parse(text) }; } catch { return { _status: r.status, _raw: text }; }
}

async function processHost(sub: string) {
  const fullHost = sub === 'www' ? 'www.kalkremont.ru' : `${sub}.kalkremont.ru`;
  const hostId = `https:${fullHost}:443`;
  const sitemapUrl = `https://${fullHost}/sitemap.xml`;

  process.stdout.write(`▶ ${fullHost}: `);

  // 1. List existing
  const list = await ya('GET', `/user/${USER_ID}/hosts/${hostId}/user-added-sitemaps`);
  const sitemaps = (list as { sitemaps?: Array<{ sitemap_url?: string; sitemap_id?: string }> }).sitemaps || [];
  const alreadyAdded = sitemaps.find((s) => s.sitemap_url === sitemapUrl);

  if (alreadyAdded) {
    console.log(`✓ уже подключён (id ${(alreadyAdded.sitemap_id || '').slice(0, 8)}…)`);
    return;
  }

  // 2. Submit
  const r = await ya('POST', `/user/${USER_ID}/hosts/${hostId}/user-added-sitemaps`, { url: sitemapUrl });
  if ((r as { sitemap_id?: string }).sitemap_id) {
    console.log(`✓ добавлен (id ${(r as { sitemap_id: string }).sitemap_id.slice(0, 8)}…)`);
  } else {
    console.log(`✗ ${(r as { error_message?: string }).error_message || (r as { _raw?: string })._raw || r._status}`);
  }
}

async function main() {
  console.log('📋 Submit sitemap'+'\'ов во все 34 хоста Webmaster…\n');
  for (const h of HOSTS) {
    await processHost(h);
    await new Promise((r) => setTimeout(r, 400));
  }
  console.log('\n✅ Готово.');
}

main().catch((e) => { console.error('❌', e); process.exit(1); });
