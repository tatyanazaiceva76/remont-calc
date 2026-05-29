#!/usr/bin/env bun
/**
 * seo-dashboard.ts — ежедневный money-дашборд сети (ЭТАП 3).  `npm run seo:dashboard`
 *
 * Сводит по каждому хосту и типу страниц реальные данные из всех источников:
 *   total_urls / indexable_urls            — sitemap + reports/host-health.csv
 *   submitted_indexnow_24h / _recrawl_24h  — reports/notify-log-*.csv за 24ч
 *   yandex_indexed_count                   — Webmaster search-urls/in-search (0/HOST_NOT_LOADED пока хост грузится)
 *   impressions/clicks/ctr_yandex          — Webmaster query-analytics
 *   yandex…/google…                        — Google по API недоступен (нет GSC OAuth) → n/a
 *   metrika_visits                         — Metrika API (визиты по startURL, разнесены по host+page_type)
 *   leads / conversion_rate / estimated_value — D1 (kalkremont-leads), context.host + page
 *
 * Принцип: НЕ объясняем нули «песочницей». Нули по Яндексу = измеренный факт
 * (HOST_NOT_LOADED — хост ещё на первичной загрузке); по Google — нет API-доступа.
 * Дашборд честно показывает, что измеримо, а что ждёт загрузки/доступа.
 *
 * Источники-ключи (.env.local): YANDEX_OAUTH_TOKEN (Webmaster+Metrika),
 *   YANDEX_WEBMASTER_USER_ID, CF_TOKEN+CF_ACCOUNT_ID (D1).
 *
 * Флаги: --days N (период Metrika/leads, по умолч. 28) · --good-only · --lead-value N (₽)
 *
 * Вывод: reports/seo-money-dashboard.csv  +  reports/seo-money-dashboard.md
 */
import { hostOf, registrableDomain, pageType, fetchSitemapUrls, loadHostHealth, parseCsvLine, csvField, pool } from './lib/seo-common';
import { readdirSync } from 'node:fs';

const TOKEN = process.env.YANDEX_OAUTH_TOKEN!;
const USER = process.env.YANDEX_WEBMASTER_USER_ID!;
const CF = process.env.CF_TOKEN, ACCT = process.env.CF_ACCOUNT_ID;
const D1_ID = '7cd87a86-0d94-4c07-afd8-6c920464de16'; // kalkremont-leads
if (!TOKEN || !USER) { console.error('❌ Нет env YANDEX_OAUTH_TOKEN / YANDEX_WEBMASTER_USER_ID'); process.exit(1); }

const args = process.argv.slice(2);
const arg = (k: string, d: string) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const DAYS = parseInt(arg('--days', '28'), 10);
const GOOD_ONLY = args.includes('--good-only');
const LEAD_VALUE = parseInt(arg('--lead-value', process.env.SEO_LEAD_VALUE || '700'), 10); // ₽ за лид (оценка)

const PAGE_TYPES = ['home', 'service-hub', 'city-leaf', 'deep-leaf', 'price', 'content', 'other'];

async function ya(method: string, path: string, body?: unknown) {
  const r = await fetch(`https://api.webmaster.yandex.net/v4${path}`, {
    method, headers: { Authorization: `OAuth ${TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const t = await r.text();
  try { return { status: r.status, ...JSON.parse(t) }; } catch { return { status: r.status, raw: t }; }
}

interface Cell {
  total_urls: number; indexable_urls: number;
  in24: number; rc24: number;
  yIndexed: number | string; gIndexed: string;
  yImpr: number; yClicks: number;
  gImpr: string; gClicks: string;
  visits: number; leads: number;
}
function emptyCell(): Cell {
  return { total_urls: 0, indexable_urls: 0, in24: 0, rc24: 0, yIndexed: 0, gIndexed: 'n/a', yImpr: 0, yClicks: 0, gImpr: 'n/a', gClicks: 'n/a', visits: 0, leads: 0 };
}

// ---- источники --------------------------------------------------------------

async function getHosts(): Promise<Array<{ host: string; hostId: string }>> {
  const r = await ya('GET', `/user/${USER}/hosts`);
  return ((r as any).hosts || []).map((h: any) => ({ host: h.ascii_host_url.replace(/^https?:\/\//, '').replace(/\/$/, ''), hostId: h.host_id }));
}

// Metrika: визиты по startURL за период, для всех счётчиков → Map<urlKey, visits>
async function metrikaVisitsByUrl(): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  const cr = await fetch('https://api-metrika.yandex.net/management/v1/counters?per_page=200', { headers: { Authorization: `OAuth ${TOKEN}` } });
  const cj: any = await cr.json();
  const counters = (cj.counters || []).map((c: any) => c.id);
  for (const id of counters) {
    try {
      const u = `https://api-metrika.yandex.net/stat/v1/data?ids=${id}&metrics=ym:s:visits&dimensions=ym:s:startURL&date1=${DAYS}daysAgo&date2=today&limit=10000&accuracy=full`;
      const r = await fetch(u, { headers: { Authorization: `OAuth ${TOKEN}` } });
      const j: any = await r.json();
      for (const row of (j.data || [])) {
        const url = row.dimensions?.[0]?.name || '';
        const v = row.metrics?.[0] || 0;
        if (!url) continue;
        const h = hostOf(url) || hostOf(`https://${url}`);
        const pt = pageType(url);
        if (!h) continue;
        out.set(`${h}|${pt}`, (out.get(`${h}|${pt}`) || 0) + v);
      }
    } catch { /* счётчик без данных */ }
  }
  return out;
}

// D1 leads → Map<host|page_type, count> + total24h
async function leadsByHostType(): Promise<{ map: Map<string, number>; total: number; total24: number }> {
  const map = new Map<string, number>();
  let total = 0, total24 = 0;
  if (!CF || !ACCT) return { map, total, total24 };
  const cutoff = Date.now() - 24 * 3600 * 1000;
  try {
    const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCT}/d1/database/${D1_ID}/query`, {
      method: 'POST', headers: { Authorization: `Bearer ${CF}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql: 'SELECT context, page, created_at, status FROM leads' }),
    });
    const j: any = await r.json();
    const rows = j.success ? (j.result?.[0]?.results || []) : [];
    for (const row of rows) {
      if (row.status === 'spam') continue;
      let host = '';
      try { host = JSON.parse(row.context || '{}').host || ''; } catch { /* */ }
      if (!host) continue;
      const pt = pageType(row.page || '/');
      map.set(`${host}|${pt}`, (map.get(`${host}|${pt}`) || 0) + 1);
      total++;
      if (Number(row.created_at) >= cutoff) total24++;
    }
  } catch { /* */ }
  return { map, total, total24 };
}

// notify-log-*.csv за 24ч → Map<host, {in, rc}>
async function notify24h(): Promise<Map<string, { in: number; rc: number }>> {
  const map = new Map<string, { in: number; rc: number }>();
  const cutoff = Date.now() - 24 * 3600 * 1000;
  let files: string[] = [];
  try { files = readdirSync('reports').filter((f) => /^notify-log-.*\.csv$/.test(f)); } catch { return map; }
  for (const f of files) {
    let txt = '';
    try { txt = await Bun.file(`reports/${f}`).text(); } catch { continue; }
    for (const line of txt.split('\n').slice(1)) {
      if (!line.trim()) continue;
      const [ts, host, action, urls] = parseCsvLine(line);
      const t = Date.parse(ts);
      if (isNaN(t) || t < cutoff) continue;
      const cur = map.get(host) || { in: 0, rc: 0 };
      if (action === 'indexnow') cur.in += Number(urls) || 0;
      else if (action === 'recrawl') cur.rc += Number(urls) || 0;
      map.set(host, cur);
    }
  }
  return map;
}

// Webmaster: indexed count + impressions/clicks для одного хоста (0/HOST_NOT_LOADED — норм)
async function yandexHostStats(hostId: string): Promise<{ indexed: number | string; impr: number; clicks: number }> {
  let indexed: number | string = 0, impr = 0, clicks = 0;
  const ins = await ya('GET', `/user/${USER}/hosts/${hostId}/search-urls/in-search/history`);
  if ((ins as any).error_code === 'HOST_NOT_LOADED') indexed = 'HOST_NOT_LOADED';
  else { const h = (ins as any).history || (ins as any).indicators?.in_search || []; const last = Array.isArray(h) ? h[h.length - 1] : null; indexed = last?.value ?? 0; }
  const qa = await ya('POST', `/user/${USER}/hosts/${hostId}/query-analytics/list`, { limit: 500 });
  for (const row of ((qa as any).text_indicator_to_statistics || [])) {
    for (const s of (row.statistics || [])) {
      if (row.text_indicator?.type || true) { /* агрегируем все */ }
      if (s.field === 'IMPRESSIONS') impr += s.value || 0;
      if (s.field === 'CLICKS') clicks += s.value || 0;
    }
  }
  return { indexed, impr, clicks };
}

// ---- сборка -----------------------------------------------------------------

async function main() {
  console.log(`📊 SEO money dashboard · период Metrika/leads: ${DAYS}д · lead=${LEAD_VALUE}₽\n`);

  const [hosts, health, visits, leads, notif] = await Promise.all([
    getHosts(), loadHostHealth(), metrikaVisitsByUrl(), leadsByHostType(), notify24h(),
  ]);

  const targets = hosts.filter((h) => !GOOD_ONLY || (health.get(h.host)?.verdict ?? 'GOOD') === 'GOOD');
  const goodTargets = targets.filter((h) => (health.get(h.host)?.verdict ?? 'GOOD') === 'GOOD');

  // структура (page_type) тянем из sitemap только для GOOD-хостов (у BAD это чужие URL)
  const structure = new Map<string, Map<string, number>>(); // host → (page_type → count)
  await pool(goodTargets, 10, async (t) => {
    const urls = await fetchSitemapUrls(t.host);
    const m = new Map<string, number>();
    for (const u of urls) { if (hostOf(u) === t.host) { const pt = pageType(u); m.set(pt, (m.get(pt) || 0) + 1); } }
    structure.set(t.host, m);
  });

  // Webmaster per-host (только GOOD; BAD = дубли, не индексируем)
  const yStats = new Map<string, { indexed: number | string; impr: number; clicks: number }>();
  await pool(goodTargets, 6, async (t) => { yStats.set(t.host, await yandexHostStats(t.hostId)); });

  // строим ячейки (host, page_type)
  const rows: Array<{ host: string; pt: string; cell: Cell }> = [];
  const ratio = (n: number, d: number) => d > 0 ? +(n / d).toFixed(4) : 0;

  for (const t of targets) {
    const h = t.host;
    const hh = health.get(h);
    const bad = (hh?.verdict ?? 'GOOD') === 'BAD';
    const struct = structure.get(h) || new Map<string, number>();
    const n24 = notif.get(h) || { in: 0, rc: 0 };
    const ys = yStats.get(h) || { indexed: bad ? 0 : 'n/a', impr: 0, clicks: 0 };

    if (bad) {
      // BAD: один свёрнутый ряд, indexable=0 (дубль-призрак, исключён)
      const cell = emptyCell();
      cell.total_urls = hh?.sitemapLocs || 0;
      cell.indexable_urls = 0;
      cell.in24 = n24.in; cell.rc24 = n24.rc;
      cell.visits = visits.get(`${h}|home`) || 0; // редкие визиты всё же учтём суммарно ниже
      // суммируем все визиты/лиды по этому хосту независимо от типа
      let v = 0, l = 0;
      for (const pt of PAGE_TYPES) { v += visits.get(`${h}|${pt}`) || 0; l += leads.map.get(`${h}|${pt}`) || 0; }
      cell.visits = v; cell.leads = l;
      cell.yIndexed = 0;
      rows.push({ host: h, pt: 'ALL(excluded)', cell });
      continue;
    }

    // GOOD: ряды по типам + ALL
    const all = emptyCell();
    all.in24 = n24.in; all.rc24 = n24.rc;
    all.yIndexed = ys.indexed; all.yImpr = ys.impr; all.yClicks = ys.clicks;
    const typesPresent = new Set<string>([...struct.keys()]);
    for (const pt of PAGE_TYPES) {
      const tu = struct.get(pt) || 0;
      const vis = visits.get(`${h}|${pt}`) || 0;
      const ld = leads.map.get(`${h}|${pt}`) || 0;
      if (!tu && !vis && !ld) continue;
      const cell = emptyCell();
      cell.total_urls = tu; cell.indexable_urls = tu; // GOOD → все индексируемы
      cell.visits = vis; cell.leads = ld;
      cell.yIndexed = ''; cell.gIndexed = ''; cell.yImpr = 0; cell.yClicks = 0; cell.gImpr = ''; cell.gClicks = ''; // host-level метрики только в ALL
      rows.push({ host: h, pt, cell });
      all.total_urls += tu; all.indexable_urls += tu; all.visits += vis; all.leads += ld;
      typesPresent.add(pt);
    }
    rows.push({ host: h, pt: 'ALL', cell: all });
  }

  // ---- CSV ----
  const header = ['host', 'page_type', 'total_urls', 'indexable_urls', 'submitted_indexnow_24h', 'submitted_recrawl_24h',
    'yandex_indexed_count', 'google_indexed_count', 'impressions_yandex', 'clicks_yandex', 'ctr_yandex',
    'impressions_google', 'clicks_google', 'ctr_google', 'metrika_visits', 'leads', 'conversion_rate', 'estimated_value'];
  const fmt = (c: Cell, isAll: boolean) => {
    const ctrY = (typeof c.yImpr === 'number' && c.yImpr > 0) ? ratio(c.yClicks as number, c.yImpr as number) : (isAll ? 0 : '');
    return [
      c.total_urls, c.indexable_urls,
      isAll ? c.in24 : '', isAll ? c.rc24 : '',
      isAll ? c.yIndexed : '', isAll ? 'n/a' : '',
      isAll ? c.yImpr : '', isAll ? c.yClicks : '', ctrY,
      isAll ? 'n/a' : '', isAll ? 'n/a' : '', isAll ? 'n/a' : '',
      c.visits, c.leads, ratio(c.leads, c.visits), c.leads * LEAD_VALUE,
    ];
  };
  const lines = [header.join(',')];
  for (const r of rows) {
    const isAll = r.pt.startsWith('ALL');
    lines.push([csvField(r.host), csvField(r.pt), ...fmt(r.cell, isAll).map(csvField)].join(','));
  }
  // grand total
  const gt = emptyCell();
  let gImpr = 0, gClicks = 0;
  for (const r of rows) {
    if (!r.pt.startsWith('ALL')) continue;
    gt.total_urls += r.cell.total_urls; gt.indexable_urls += r.cell.indexable_urls;
    gt.in24 += r.cell.in24; gt.rc24 += r.cell.rc24; gt.visits += r.cell.visits; gt.leads += r.cell.leads;
    if (typeof r.cell.yImpr === 'number') gImpr += r.cell.yImpr;
    if (typeof r.cell.yClicks === 'number') gClicks += r.cell.yClicks;
  }
  lines.push(['TOTAL', 'ALL', gt.total_urls, gt.indexable_urls, gt.in24, gt.rc24, '', 'n/a', gImpr, gClicks,
    gImpr > 0 ? ratio(gClicks, gImpr) : 0, 'n/a', 'n/a', 'n/a', gt.visits, gt.leads, ratio(gt.leads, gt.visits), gt.leads * LEAD_VALUE].join(','));

  await Bun.$`mkdir -p reports`.quiet();
  await Bun.write('reports/seo-money-dashboard.csv', lines.join('\n'));

  // ---- Markdown ----
  const hostAll = rows.filter((r) => r.pt === 'ALL');
  const topVisits = [...hostAll].sort((a, b) => b.cell.visits - a.cell.visits).slice(0, 12);
  const topLeads = [...hostAll].filter((r) => r.cell.leads > 0).sort((a, b) => b.cell.leads - a.cell.leads).slice(0, 12);
  const notLoaded = hostAll.filter((r) => r.cell.yIndexed === 'HOST_NOT_LOADED').length;
  const goodCount = goodTargets.length, badCount = targets.length - goodTargets.length;
  const today = new Date().toISOString().slice(0, 10);

  const md = [
    `# SEO money dashboard — ${today}`,
    ``,
    `Период Metrika/leads: **${DAYS} дней**. Оценка лида: **${LEAD_VALUE} ₽**. Хостов в отчёте: **${targets.length}** (GOOD ${goodCount}${GOOD_ONLY ? '' : ` · BAD/исключены ${badCount}`}).`,
    ``,
    `## Итоги сети`,
    `| Метрика | Значение |`,
    `|---|---|`,
    `| URL в sitemap (indexable) | ${gt.total_urls} (${gt.indexable_urls}) |`,
    `| IndexNow за 24ч | ${gt.in24} |`,
    `| Переобход Я. за 24ч | ${gt.rc24} |`,
    `| Визиты (Metrika, ${DAYS}д) | ${gt.visits} |`,
    `| Лиды (всего / 24ч) | ${leads.total} / ${leads.total24} |`,
    `| Impressions Яндекс | ${gImpr} |`,
    `| Clicks Яндекс | ${gClicks} |`,
    `| Оценка денег (лиды×${LEAD_VALUE}₽) | ${gt.leads * LEAD_VALUE} ₽ |`,
    ``,
    `## Статус индексации (честно, без «песочницы»)`,
    `- **Яндекс:** ${notLoaded}/${goodCount} GOOD-хостов в состоянии \`HOST_NOT_LOADED\` — идёт первичная загрузка/склейка зеркал; индексные счётчики ещё не отдаются API. Это измеренный факт, не «песочница». Ускоряют только регулярный переобход + IndexNow + поведенческие (Метрика).`,
    `- **Google:** счётчики индексации/показов помечены \`n/a\` — нет OAuth-доступа к Search Console API. Данные есть в GSC UI; для автоматизации нужен сервисный аккаунт GSC.`,
    `- **Метрика:** визиты считаются (счётчик исправлен на ЭТАПЕ 1), цели уходят в реальный счётчик.`,
    ``,
    `## Топ хостов по визитам (${DAYS}д)`,
    `| host | visits | leads | indexable | in24 | rc24 |`,
    `|---|--:|--:|--:|--:|--:|`,
    ...topVisits.map((r) => `| ${r.host} | ${r.cell.visits} | ${r.cell.leads} | ${r.cell.indexable_urls} | ${r.cell.in24} | ${r.cell.rc24} |`),
    ``,
    `## Топ хостов по лидам`,
    topLeads.length ? `| host | leads | visits | CR |\n|---|--:|--:|--:|\n${topLeads.map((r) => `| ${r.host} | ${r.cell.leads} | ${r.cell.visits} | ${ratio(r.cell.leads, r.cell.visits)} |`).join('\n')}` : `_Пока нет лидов с атрибуцией по хосту._`,
    ``,
    `> CSV: \`reports/seo-money-dashboard.csv\` (строки host × page_type + ALL + TOTAL).`,
    ``,
  ].join('\n');
  await Bun.write('reports/seo-money-dashboard.md', md);

  console.log(`✅ Готово.`);
  console.log(`   Сеть: ${gt.total_urls} URL · визитов ${gt.visits} · лидов ${leads.total} (24ч ${leads.total24}) · IndexNow24 ${gt.in24} · recrawl24 ${gt.rc24}`);
  console.log(`   Яндекс HOST_NOT_LOADED: ${notLoaded}/${goodCount} · Google: n/a (нет GSC API)`);
  console.log(`💾 reports/seo-money-dashboard.csv · reports/seo-money-dashboard.md`);
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
