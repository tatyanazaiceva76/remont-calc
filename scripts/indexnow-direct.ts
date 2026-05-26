#!/usr/bin/env bun
// Прямой IndexNow в Yandex + Bing (без aggregator) — гарантированная доставка.
// Aggregator api.indexnow.org часто валит 403 из-за пайплайна валидации.

const KEY = process.env.INDEXNOW_KEY;
if (!KEY) { console.error('❌ INDEXNOW_KEY не задан'); process.exit(1); }

const HOSTS = [
  'www', 'price', 'sovety', 'brand',
  'moskva', 'spb', 'ekb', 'kzn',
  'nsk', 'krd', 'nn', 'chel', 'ufa', 'sam', 'rnd', 'vrn', 'perm', 'vlg', 'tyumen', 'brn',
  'vannye', 'kuhni', 'okna', 'potolki', 'dveri', 'elektro',
  'santehnika', 'dizayn', 'balkony', 'styazhka',
  'uborka', 'demontazh', 'kondicioner', 'fasad'
];

async function fetchSitemapUrls(host: string): Promise<string[]> {
  try {
    const r = await fetch(`https://${host}/sitemap.xml`, { headers: { 'User-Agent': 'kalkremont-indexnow' } });
    if (!r.ok) return [];
    const xml = await r.text();
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  } catch { return []; }
}

async function pingEndpoint(endpoint: string, host: string, urls: string[]): Promise<{ status: number; body: string }> {
  const r = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key: KEY,
      keyLocation: `https://${host}/indexnow_${KEY}.txt`,
      urlList: urls
    })
  });
  return { status: r.status, body: (await r.text()).slice(0, 200) };
}

let totalUrls = 0;
let yandexOk = 0, bingOk = 0;

for (const sub of HOSTS) {
  const fullHost = sub === 'www' ? 'www.kalkremont.ru' : `${sub}.kalkremont.ru`;
  process.stdout.write(`▶ ${fullHost}: `);
  const urls = await fetchSitemapUrls(fullHost);
  if (urls.length === 0) { console.log('пустой sitemap'); continue; }
  const sameHostUrls = urls.filter((u) => { try { return new URL(u).host === fullHost; } catch { return false; } });
  process.stdout.write(`${sameHostUrls.length} URL · `);

  // По 1000 URL за раз
  for (let i = 0; i < sameHostUrls.length; i += 1000) {
    const batch = sameHostUrls.slice(i, i + 1000);

    // Yandex напрямую
    const yr = await pingEndpoint('https://yandex.com/indexnow', fullHost, batch);
    if (yr.status === 200 || yr.status === 202) yandexOk += batch.length;
    process.stdout.write(`Y[${yr.status}]`);

    // Bing напрямую
    const br = await pingEndpoint('https://www.bing.com/indexnow', fullHost, batch);
    if (br.status === 200 || br.status === 202) bingOk += batch.length;
    process.stdout.write(`B[${br.status}] `);

    totalUrls += batch.length;
    await new Promise((r) => setTimeout(r, 300));
  }
  console.log('');
}

console.log(`\n✅ Тотал: ${totalUrls} URL`);
console.log(`   Yandex.com/indexnow: ${yandexOk} принято`);
console.log(`   Bing.com/indexnow: ${bingOk} принято`);
