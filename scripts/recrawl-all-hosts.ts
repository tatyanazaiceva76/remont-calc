#!/usr/bin/env bun
// Recrawl всех важных URL по всей сети с использованием per-host квоты.
// Yandex Webmaster даёт 150 recrawl/день НА КАЖДЫЙ хост — мы используем это полностью.
//
// Подтягивает URL из sitemap.xml каждого хоста и ротирует по дню месяца
// (день 1 = первые 100, день 2 = следующие 100, и т.д.)

const TOKEN = process.env.YANDEX_OAUTH_TOKEN;
const USER_ID = process.env.YANDEX_WEBMASTER_USER_ID;
if (!TOKEN || !USER_ID) {
  console.error('❌ YANDEX_OAUTH_TOKEN / USER_ID не заданы');
  process.exit(1);
}

// Каждый хост имеет ОТДЕЛЬНУЮ квоту 150/день (проверено через /recrawl/quota API).
// Используем все 150 на каждом хосте — итого до 34×150 = 5100 URL/день.
const PER_HOST_BUDGET = 150;

const SUBS = [
  // apex + 4 основных
  '@', 'www', 'price', 'sovety', 'brand',
  // 16 городских поддоменов
  'moskva', 'spb', 'ekb', 'kzn', 'nsk', 'krd', 'nn', 'chel', 'ufa', 'sam',
  'rnd', 'vrn', 'perm', 'vlg', 'tyumen', 'brn',
  // 14 нишевых поддоменов
  'vannye', 'kuhni', 'okna', 'potolki', 'dveri', 'elektro',
  'santehnika', 'dizayn', 'balkony', 'styazhka',
  'uborka', 'demontazh', 'kondicioner', 'fasad'
];

const HOSTS = SUBS.map((sub) => ({
  sub,
  // apex и www используют один и тот же sitemap (www.kalkremont.ru/sitemap.xml)
  sitemap: sub === '@' || sub === 'www'
    ? 'https://www.kalkremont.ru/sitemap.xml'
    : `https://${sub}.kalkremont.ru/sitemap.xml`
}));

async function fetchSitemapUrls(sitemapUrl: string): Promise<string[]> {
  try {
    const r = await fetch(sitemapUrl, { headers: { 'User-Agent': 'kalkremont-recrawler' } });
    if (!r.ok) return [];
    const xml = await r.text();
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  } catch {
    return [];
  }
}

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

async function recrawlHost(sub: string, sitemap: string) {
  // '@' = apex без www (kalkremont.ru), 'www' = www.kalkremont.ru, остальное = subdomain.kalkremont.ru
  const hostName = sub === '@' ? 'kalkremont.ru' : sub === 'www' ? 'www.kalkremont.ru' : `${sub}.kalkremont.ru`;
  const hostId = `https:${hostName}:443`;
  const allUrls = await fetchSitemapUrls(sitemap);
  if (!allUrls.length) {
    console.log(`▶ ${hostName}: пустой sitemap`);
    return { ok: 0, fail: 0, quota: '?' };
  }

  // Ротация: смешиваем (1) первые 30 URL — самые важные хабы из sitemap
  // (2) random sample из остальных. Так главные страницы переобходятся часто,
  // а длинный хвост постепенно прорабатывается.
  const head = allUrls.slice(0, Math.min(30, allUrls.length));
  const tail = allUrls.slice(30);
  // Псевдо-рандом seed по дню+часу+host чтобы 2 прогона/день брали разные slices
  const seed = (new Date().getDate() * 100 + new Date().getUTCHours() * 7 + sub.length * 13) % Math.max(1, tail.length);
  const rotated = [...tail.slice(seed), ...tail.slice(0, seed)];
  const slice = [...head, ...rotated].slice(0, PER_HOST_BUDGET);

  process.stdout.write(`▶ ${hostName}: ${slice.length}/${allUrls.length} URL `);

  let ok = 0, fail = 0, quota = '?';
  for (const url of slice) {
    const r = await ya('POST', `/user/${USER_ID}/hosts/${hostId}/recrawl/queue`, { url });
    if (r._status === 202) {
      ok++;
      quota = String((r as { quota_remainder?: number }).quota_remainder ?? '?');
      process.stdout.write('.');
    } else if (r._status === 429) {
      // квота исчерпана — переходим к следующему хосту (у каждого хоста своя квота)
      process.stdout.write(`Q[${(r as { quota_remainder?: number }).quota_remainder ?? 0}]`);
      fail++;
      break;
    } else {
      process.stdout.write(`x[${r._status}]`);
      fail++;
    }
    await new Promise((res) => setTimeout(res, 200));
  }
  console.log(` (ok:${ok} fail:${fail} quota_left:${quota})`);
  return { ok, fail, quota };
}

async function main() {
  console.log(`📅 День ${new Date().getDate()} — recrawl ротация по дню месяца\n`);
  let totalOk = 0, totalFail = 0;

  for (const h of HOSTS) {
    const r = await recrawlHost(h.sub, h.sitemap);
    totalOk += r.ok;
    totalFail += r.fail;
    await new Promise((res) => setTimeout(res, 500));
  }

  console.log(`\n✅ Готово. Recrawl: ${totalOk} ok / ${totalFail} fail`);
  console.log(`📊 Если квота на хосте была не исчерпана — Яндекс начнёт обход в ближайшие часы.`);
}

main().catch((e) => { console.error('❌', e); process.exit(1); });
