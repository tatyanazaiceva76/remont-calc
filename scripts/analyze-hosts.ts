#!/usr/bin/env bun
/**
 * analyze-hosts.ts — классификация всех хостов сети (ЭТАП 2).
 *
 * Для каждого хоста из Я.Вебмастера проверяет, «настоящий» ли это отдельный сайт
 * или дубль-призрак (CNAME на чужую сборку), который только мешает индексации:
 *   • homepage canonical — указывает на сам хост (SELF) или на apex/чужой хост;
 *   • sitemap.xml — перечисляет URL этого хоста или чужого;
 *   • IndexNow-проба первым URL из sitemap под этим хостом — 200/202 или 422.
 *
 * Хост BAD, если canonical уводит на другой хост ИЛИ sitemap состоит из чужих URL
 * (тогда IndexNow → 422, а переобход кладёт в очередь чужие URL под этим хостом).
 *
 * По умолчанию рекомендация — EXCLUDE (исключить из IndexNow/recrawl): склейка
 * зеркал уже делает их дублями apex, тратить на них квоту бессмысленно.
 *
 * Пишет reports/bad-hosts.csv (host,issue,example_url,canonical,indexnow_status,recommended_action)
 * и reports/host-health.csv (полный отчёт по всем хостам).
 *
 * Запуск:
 *   set -a && source .env.local && set +a && bun scripts/analyze-hosts.ts
 *   bun scripts/analyze-hosts.ts --no-indexnow   # без живой IndexNow-пробы (быстрее, status=skip)
 */

const TOKEN = process.env.YANDEX_OAUTH_TOKEN!;
const USER = process.env.YANDEX_WEBMASTER_USER_ID!;
const KEY = process.env.INDEXNOW_KEY!;
if (!TOKEN || !USER) { console.error('❌ Нет env YANDEX_OAUTH_TOKEN / YANDEX_WEBMASTER_USER_ID'); process.exit(1); }

const NO_INDEXNOW = process.argv.includes('--no-indexnow');
const UA = 'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)';
const CONCURRENCY = 10;

interface HostReport {
  host: string;
  homeStatus: number | string;
  redirectTo: string;
  canonical: string;
  canonicalHost: string;
  sitemapLocs: number;
  sitemapHost: string;
  exampleUrl: string;
  indexnowStatus: number | string;
  issues: string[];
  verdict: 'GOOD' | 'BAD';
  recommended: string;
}

function hostOf(u: string): string { try { return new URL(u).host; } catch { return ''; } }

async function getHosts(): Promise<string[]> {
  const r = await fetch(`https://api.webmaster.yandex.net/v4/user/${USER}/hosts`, { headers: { Authorization: `OAuth ${TOKEN}` } });
  const j: any = await r.json();
  return (j.hosts || []).map((h: any) => h.ascii_host_url.replace(/^https?:\/\//, '').replace(/\/$/, ''));
}

async function fetchHome(host: string): Promise<{ status: number | string; redirectTo: string; canonical: string }> {
  try {
    const r = await fetch(`https://${host}/`, { headers: { 'User-Agent': UA }, redirect: 'manual' });
    if (r.status >= 300 && r.status < 400) return { status: r.status, redirectTo: r.headers.get('location') || '', canonical: '' };
    const h = await r.text();
    const m = h.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);
    let c = '';
    if (m) { const u = m[0].match(/href=["']([^"']+)["']/i); c = u ? u[1] : ''; }
    return { status: r.status, redirectTo: '', canonical: c };
  } catch (e) { return { status: `ERR ${String(e).slice(0, 40)}`, redirectTo: '', canonical: '' }; }
}

// Возвращает первый реальный URL-loc (разворачивает sitemap-index) + общее число и хост
async function fetchSitemap(host: string): Promise<{ locs: number; first: string; smHost: string }> {
  async function locs(url: string): Promise<string[]> {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!r.ok) return [];
      const x = await r.text();
      return [...x.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    } catch { return []; }
  }
  let l = await locs(`https://${host}/sitemap.xml`);
  if (!l.length) return { locs: 0, first: '', smHost: '' };
  // sitemap-index? первый loc сам указывает на .xml — развернём
  if (/\.xml(\?|$)/i.test(l[0])) {
    const sub = await locs(l[0]);
    if (sub.length) return { locs: sub.length, first: sub[0], smHost: hostOf(sub[0]) };
  }
  return { locs: l.length, first: l[0], smHost: hostOf(l[0]) };
}

async function indexNowProbe(host: string, url: string): Promise<number | string> {
  if (NO_INDEXNOW || !KEY || !url) return 'skip';
  try {
    const r = await fetch('https://yandex.com/indexnow', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host, key: KEY, keyLocation: `https://${host}/indexnow_${KEY}.txt`, urlList: [url] }),
    });
    return r.status;
  } catch { return 'err'; }
}

async function analyze(host: string): Promise<HostReport> {
  const home = await fetchHome(host);
  const sm = await fetchSitemap(host);
  const canonicalHost = home.canonical ? hostOf(home.canonical) : '';
  // пробуем IndexNow первым URL из sitemap; если sitemap пуст — самим homepage
  const probeUrl = sm.first || `https://${host}/`;
  const example = sm.first || `https://${host}/`;
  const inStatus = await indexNowProbe(host, probeUrl);

  const issues: string[] = [];
  if (home.redirectTo) {
    const rh = hostOf(home.redirectTo.startsWith('http') ? home.redirectTo : `https://${host}${home.redirectTo}`);
    if (rh && rh !== host) issues.push(`redirect→${rh}`);
  }
  if (canonicalHost && canonicalHost !== host) issues.push(`canonical→${canonicalHost}`);
  if (sm.smHost && sm.smHost !== host) issues.push(`sitemap→${sm.smHost}`);
  if (sm.locs === 0 && !home.redirectTo) issues.push('no-sitemap');
  if (inStatus === 422) issues.push('indexnow-422');

  // BAD = чужой canonical или чужой sitemap (это и есть «дубль-призрак»)
  const bad = issues.some((i) => i.startsWith('canonical→') || i.startsWith('sitemap→')) || inStatus === 422;
  const verdict: 'GOOD' | 'BAD' = bad ? 'BAD' : 'GOOD';

  // дефолт B — исключить из IndexNow/recrawl; называем реальный хост-канонику
  let recommended = 'KEEP';
  if (bad) {
    const target = (canonicalHost && canonicalHost !== host) ? canonicalHost
      : (sm.smHost && sm.smHost !== host) ? sm.smHost
      : (home.redirectTo ? hostOf(home.redirectTo.startsWith('http') ? home.redirectTo : `https://${host}${home.redirectTo}`) : '');
    recommended = target ? `EXCLUDE (notify ${target})` : 'EXCLUDE';
  }

  return {
    host, homeStatus: home.status, redirectTo: home.redirectTo,
    canonical: home.canonical, canonicalHost,
    sitemapLocs: sm.locs, sitemapHost: sm.smHost,
    exampleUrl: example, indexnowStatus: inStatus,
    issues, verdict, recommended,
  };
}

async function pool<T, R>(items: T[], n: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx]); }
  }));
  return out;
}

function csvField(s: string): string { return `"${String(s).replace(/"/g, '""')}"`; }

async function main() {
  const hosts = await getHosts();
  console.log(`🔬 Анализ ${hosts.length} хостов${NO_INDEXNOW ? ' (без IndexNow-пробы)' : ' (+ живая IndexNow-проба)'}…\n`);

  const reports = await pool(hosts, CONCURRENCY, analyze);
  reports.sort((a, b) => (a.verdict === b.verdict ? a.host.localeCompare(b.host) : a.verdict === 'BAD' ? -1 : 1));

  const bad = reports.filter((r) => r.verdict === 'BAD');
  const good = reports.filter((r) => r.verdict === 'GOOD');

  await Bun.$`mkdir -p reports`.quiet();

  // bad-hosts.csv (точные колонки из ТЗ)
  const badCsv = ['host,issue,example_url,canonical,indexnow_status,recommended_action']
    .concat(bad.map((r) => [
      r.host, csvField(r.issues.join('; ')), csvField(r.exampleUrl),
      csvField(r.canonical || ''), String(r.indexnowStatus), r.recommended,
    ].join(','))).join('\n');
  await Bun.write('reports/bad-hosts.csv', badCsv);

  // полный health-отчёт
  const fullCsv = ['host,verdict,home_status,redirect_to,canonical,canonical_host,sitemap_locs,sitemap_host,indexnow_status,issues,recommended']
    .concat(reports.map((r) => [
      r.host, r.verdict, String(r.homeStatus), csvField(r.redirectTo), csvField(r.canonical),
      r.canonicalHost, String(r.sitemapLocs), r.sitemapHost, String(r.indexnowStatus),
      csvField(r.issues.join('; ')), r.recommended,
    ].join(','))).join('\n');
  await Bun.write('reports/host-health.csv', fullCsv);

  console.log(`📊 ИТОГ: GOOD ${good.length} · BAD ${bad.length} из ${hosts.length}\n`);
  if (bad.length) {
    console.log('❌ BAD-хосты (дубли-призраки, рекоменд. EXCLUDE):');
    for (const r of bad) console.log(`   ${r.host.padEnd(36)} ${r.issues.join('; ')}`);
  }
  console.log(`\n💾 reports/bad-hosts.csv (${bad.length}) · reports/host-health.csv (${reports.length})`);

  // печать exclude-списка для notify (домены-хосты через запятую)
  if (bad.length) console.log(`\n📋 EXCLUDE-список:\n${bad.map((r) => r.host).join(',')}`);
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
