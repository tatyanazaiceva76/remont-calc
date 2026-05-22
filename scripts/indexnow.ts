#!/usr/bin/env bun
// IndexNow — мгновенный пинг Яндекса и Bing о новых/изменённых URL.
// Запуск:
//   bun scripts/indexnow.ts                    — пингует ВСЕ URL из sitemap
//   bun scripts/indexnow.ts url1 url2 ...      — пингует конкретные URL
//
// Документация: https://www.indexnow.org/documentation
// Bing/Yandex автоматически делятся информацией между собой через IndexNow API.

import { scenarios as wallpaperScenarios } from '../src/data/wallpaper-scenarios';
import { laminateScenarios } from '../src/data/laminate-scenarios';
import { paintScenarios } from '../src/data/paint-scenarios';
import { tileScenarios } from '../src/data/tile-scenarios';
import { plasterScenarios } from '../src/data/plaster-scenarios';
import { linoleumScenarios } from '../src/data/linoleum-scenarios';
import { drywallScenarios } from '../src/data/drywall-scenarios';
import { insulationScenarios } from '../src/data/insulation-scenarios';
import { concreteScenarios } from '../src/data/concrete-scenarios';
import { regionScenarios } from '../src/data/repair-regions';
import { articles } from '../src/data/sovety-articles';
import { comparisons } from '../src/data/comparison-pages';
import { brandProducts } from '../src/data/brand-products';
import { roofScenarios } from '../src/data/roof-scenarios';

const KEY = process.env.INDEXNOW_KEY;
const DOMAIN = 'www.kalkremont.ru';

if (!KEY) {
  console.error('❌ INDEXNOW_KEY не задан в .env.local');
  process.exit(1);
}

function allUrls(): string[] {
  const base = `https://${DOMAIN}`;
  const urls = [
    `${base}/`,
    `${base}/raschet-oboev/`,
    `${base}/raschet-laminata/`,
    `${base}/raschet-kraski/`,
    `${base}/raschet-plitki/`,
    `${base}/raschet-shtukaturki/`,
    `${base}/raschet-linoleuma/`,
    `${base}/raschet-gipsokartona/`,
    `${base}/raschet-uteplitelya/`,
    `${base}/raschet-betona/`,
    `${base}/stoimost-remonta/`,
    `${base}/sovety/`,
    `${base}/chto-luchshe/`,
    `${base}/brand/`,
    `${base}/raschet-krovli/`,
    `${base}/skolko-hvatit/`,
    ...wallpaperScenarios.map((s) => `${base}/raschet-oboev/${s.slug}/`),
    ...laminateScenarios.map((s) => `${base}/raschet-laminata/${s.slug}/`),
    ...paintScenarios.map((s) => `${base}/raschet-kraski/${s.slug}/`),
    ...tileScenarios.map((s) => `${base}/raschet-plitki/${s.slug}/`),
    ...plasterScenarios.map((s) => `${base}/raschet-shtukaturki/${s.slug}/`),
    ...linoleumScenarios.map((s) => `${base}/raschet-linoleuma/${s.slug}/`),
    ...drywallScenarios.map((s) => `${base}/raschet-gipsokartona/${s.slug}/`),
    ...insulationScenarios.map((s) => `${base}/raschet-uteplitelya/${s.slug}/`),
    ...concreteScenarios.map((s) => `${base}/raschet-betona/${s.slug}/`),
    ...regionScenarios.map((s) => `${base}/stoimost-remonta/${s.slug}/`),
    ...articles.map((a) => `${base}/sovety/${a.slug}/`),
    ...comparisons.map((c) => `${base}/chto-luchshe/${c.slug}/`),
    ...brandProducts.map((p) => `${base}/brand/${p.slug}/`),
    ...roofScenarios.map((s) => `${base}/raschet-krovli/${s.slug}/`)
  ];
  return urls;
}

async function pingBatch(urls: string[]) {
  // IndexNow позволяет до 10000 URL в одном запросе
  const body = {
    host: DOMAIN,
    key: KEY,
    keyLocation: `https://${DOMAIN}/indexnow_${KEY}.txt`,
    urlList: urls
  };
  const r = await fetch('https://api.indexnow.org/IndexNow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body)
  });
  const text = await r.text();
  return { status: r.status, body: text };
}

async function main() {
  const argUrls = process.argv.slice(2);
  const urls = argUrls.length > 0 ? argUrls : allUrls();

  console.log(`\n📡 IndexNow ping: ${urls.length} URL\n`);

  // Бьём батчами по 1000 на всякий случай
  for (let i = 0; i < urls.length; i += 1000) {
    const batch = urls.slice(i, i + 1000);
    const r = await pingBatch(batch);
    console.log(`  Батч ${i / 1000 + 1}: HTTP ${r.status} (${batch.length} URL)`);
    if (r.body) console.log(`    response: ${r.body.slice(0, 200)}`);
  }

  console.log(`\n✅ Готово. Яндекс и Bing уведомлены, обход новых страниц обычно происходит в течение нескольких часов.\n`);
}

main().catch((e) => { console.error('❌', e); process.exit(1); });
