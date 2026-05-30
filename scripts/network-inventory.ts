#!/usr/bin/env bun
/**
 * network-inventory.ts — ЕДИНЫЙ РЕЕСТР СЕТИ (ШАГ 2 оператора роста).
 *
 * Сводит воедино всё, что нужно, чтобы понять «какие хосты качать, какие уже
 * валидные, какие мусорные, какие требуют фикса»:
 *
 *   Источники (read-only, безопасно):
 *     • Yandex Webmaster API  — список хостов + /summary (в поиске / исключено /
 *                               проблемы) + indexing-history (загружено роботом);
 *     • reports/host-health.csv — классификация GOOD/BAD (от analyze-hosts.ts):
 *                               canonical-host, sitemap locs/host, indexnow-проба;
 *     • reports/bad-hosts.csv   — причина, почему хост — дубль-призрак;
 *     • один homepage+robots проб на КАЖДЫЙ GOOD-хост — Метрика-счётчик,
 *                               наличие lead-форм и монетизационных слотов, robots.
 *
 *   Пишет 3 артефакта:
 *     • reports/network-hosts-inventory.csv  — большой per-host реестр (все поля ТЗ);
 *     • reports/network-indexation-status.csv — фокус на индексации (в поиске/исключено/загружено);
 *     • reports/network-money-map.csv         — фокус на деньгах (money-страницы, формы, слоты, приоритет).
 *
 * НЕ меняет ничего на хостах. НЕ шлёт IndexNow/recrawl. Только GET-ы и чтение CSV.
 *
 *   set -a && source .env.local && set +a && bun scripts/network-inventory.ts
 *   ... --no-deep   # пропустить homepage/robots-проб (быстро; metrika/forms/slots = n/a)
 */

const TOKEN = process.env.YANDEX_OAUTH_TOKEN;
const USER = process.env.YANDEX_WEBMASTER_USER_ID;
if (!TOKEN || !USER) { console.error('❌ Нет env YANDEX_OAUTH_TOKEN / YANDEX_WEBMASTER_USER_ID'); process.exit(1); }

const NO_DEEP = process.argv.includes('--no-deep');
const UA = 'Mozilla/5.0 (compatible; NetworkInventory/1.0)';
const CONCURRENCY = 10;
const KNOWN_METRIKA = '109345156'; // www.kalkremont.ru (из src/config.ts)

// ── helpers ───────────────────────────────────────────────────────────────
function hostOf(u: string): string { try { return new URL(u).host; } catch { return ''; } }
function domainOf(host: string): string {
  const p = host.split('.');
  return p.length <= 2 ? host : p.slice(-2).join('.'); // все TLD здесь .ru — двух меток достаточно
}
function subOf(host: string): string {
  const p = host.split('.');
  return p.length > 2 ? p.slice(0, -2).join('.') : '';
}
function csvField(s: unknown): string { return `"${String(s ?? '').replace(/"/g, '""')}"`; }
function clamp(n: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, n)); }

// маленький CSV-парсер (host-health.csv/bad-hosts.csv содержат поля с запятыми в кавычках)
function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let i = 0, f = '', row: string[] = [], q = false;
  while (i < text.length) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { f += '"'; i += 2; continue; } q = false; i++; continue; }
      f += c; i++; continue;
    }
    if (c === '"') { q = true; i++; continue; }
    if (c === ',') { row.push(f); f = ''; i++; continue; }
    if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; i++; continue; }
    if (c === '\r') { i++; continue; }
    f += c; i++;
  }
  if (f.length || row.length) { row.push(f); rows.push(row); }
  return rows;
}
function readCsvMap(path: string, key: string): Map<string, Record<string, string>> {
  const m = new Map<string, Record<string, string>>();
  try {
    const rows = parseCsv(require('fs').readFileSync(path, 'utf8'));
    if (!rows.length) return m;
    const head = rows[0];
    const ki = head.indexOf(key);
    if (ki < 0) return m;
    for (const r of rows.slice(1)) {
      if (!r[ki]) continue;
      const o: Record<string, string> = {};
      head.forEach((h, j) => (o[h] = r[j] ?? ''));
      m.set(r[ki].trim(), o);
    }
  } catch {}
  return m;
}

// ── проектная классификация по домену ───────────────────────────────────────
const PROJECT: Record<string, string> = {
  'kalkremont.ru': 'kalkremont (калькуляторы ремонта — флагман)',
  'dom-stroy-online.ru': 'dom-stroy (строительство домов)',
  'ipoteka-remont.ru': 'ipoteka-remont (ипотека + ремонт)',
  'kuhni-zakaz-online.ru': 'kuhni (кухни на заказ)',
  'dizayn-interyera-online.ru': 'dizayn (дизайн интерьера)',
  'dveri-stalnye24.ru': 'dveri (стальные двери)',
  'kamin-zakaz24.ru': 'kamin (камины/печи)',
  'kupeshkafy24.ru': 'shkafy (шкафы-купе)',
};
function projectOf(domain: string, sub: string): string {
  const base = PROJECT[domain] || domain;
  return sub ? `${base} · ${sub}` : base;
}
function projectValue(domain: string): number {
  if (domain === 'kalkremont.ru') return 1.0; // флагман — проверенная индексация/конверсия
  return 0.6;
}

// ── Yandex Webmaster ────────────────────────────────────────────────────────
async function ya(path: string): Promise<any> {
  try {
    const r = await fetch(`https://api.webmaster.yandex.net/v4${path}`, { headers: { Authorization: `OAuth ${TOKEN}` } });
    const t = await r.text();
    try { return { _s: r.status, ...JSON.parse(t) }; } catch { return { _s: r.status, _raw: t.slice(0, 120) }; }
  } catch (e) { return { _s: 'ERR', _err: String(e).slice(0, 60) }; }
}
async function getHosts(): Promise<{ host: string; hostId: string }[]> {
  const r = await ya(`/user/${USER}/hosts`);
  return ((r.hosts || []) as any[]).map((h) => ({
    host: h.ascii_host_url.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    hostId: h.host_id,
  }));
}

interface Summary { inSearch: number; excluded: number; loaded: number; problems: number; fatal: number; wmStatus: string; }
async function summary(hostId: string): Promise<Summary> {
  const s = await ya(`/user/${USER}/hosts/${encodeURIComponent(hostId)}/summary`);
  // site_problems бывает массивом [{problem_severity}] ИЛИ объектом {FATAL:n,CRITICAL:n,…} — поддержим оба.
  const sp = s.site_problems;
  let problemsCount = 0, fatal = 0;
  if (Array.isArray(sp)) {
    problemsCount = sp.length;
    fatal = sp.filter((p: any) => p?.problem_severity === 'FATAL').length;
  } else if (sp && typeof sp === 'object') {
    for (const [k, v] of Object.entries(sp)) {
      const n = Number(v) || 0; problemsCount += n; if (/FATAL/i.test(k)) fatal += n;
    }
  }
  let loaded = 0;
  if (s._s === 200) {
    const from = Date.now() - 30 * 86400_000;
    const idx = await ya(`/user/${USER}/hosts/${encodeURIComponent(hostId)}/indexing-history?indexing_indicator=DOWNLOADED&date_from=${from}&date_to=${Date.now()}`);
    loaded = idx.indicators?.DOWNLOADED?.slice(-1)[0]?.value ?? 0;
  }
  return {
    inSearch: s.searchable_pages_count ?? 0,
    excluded: s.excluded_pages_count ?? 0,
    loaded,
    problems: problemsCount,
    fatal,
    wmStatus: s._s === 200 ? (problemsCount ? `verified:${problemsCount}problems${fatal ? `(${fatal}FATAL)` : ''}` : 'verified:ok') : `http:${s._s}`,
  };
}

// ── homepage/robots проб (только GOOD-хосты) ────────────────────────────────
interface Probe { metrika: string; forms: boolean; monet: boolean; robots: string; }
async function probe(host: string): Promise<Probe> {
  let metrika = '', forms = false, monet = false, robots = 'n/a';
  try {
    const r = await fetch(`https://${host}/`, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15000) });
    if (r.ok) {
      const h = await r.text();
      const ym = h.match(/ym\((\d{5,})/) || h.match(/metrika[^0-9]{0,20}(\d{6,})/i);
      metrika = ym ? ym[1] : (/mc\.yandex\.ru\/(?:metrika|watch)/.test(h) ? 'present(id?)' : '');
      forms = /<form\b/i.test(h) || /href=["']tel:/i.test(h) || /data-(modal|callback|quiz|lead)|js-(callback|lead|quiz)/i.test(h);
      monet = /yandex_rtb_|Ya\.Context\.AdvManager|adsbygoogle|googlesyndication|admitad|\baff(?:iliate)?[_-]|data-(ad|promo)-slot/i.test(h);
    }
  } catch {}
  try {
    const rb = await fetch(`https://${host}/robots.txt`, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(10000) });
    if (rb.ok) {
      const t = await rb.text();
      const blocksAll = /^\s*Disallow:\s*\/\s*$/im.test(t) && /^\s*User-agent:\s*\*/im.test(t);
      const hasSitemap = /^\s*Sitemap:/im.test(t);
      robots = `200${blocksAll ? ' DISALLOW-ALL!' : ''}${hasSitemap ? ' +sitemap' : ' no-sitemap-ref'}`;
    } else robots = `http:${rb.status}`;
  } catch { robots = 'err'; }
  return { metrika, forms, monet, robots };
}

async function pool<T, R>(items: T[], n: number, fn: (t: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length); let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); } }));
  return out;
}

// ── main ────────────────────────────────────────────────────────────────────
interface Row {
  domain: string; host: string; project: string;
  isValid: boolean; isBad: boolean; reasonIfBad: string;
  sitemapUrl: string; sitemapCount: number; indexableCount: number;
  canonicalMode: string; robots: string; wmStatus: string; gscStatus: string;
  indexnowEligible: boolean; recrawlEligible: boolean;
  metrika: string; leadForms: string; monetSlots: string;
  inSearch: number; excluded: number; loaded: number; fatal: number;
  priority: number;
}

async function main() {
  const health = readCsvMap('reports/host-health.csv', 'host');
  const bad = readCsvMap('reports/bad-hosts.csv', 'host');
  const hosts = await getHosts();
  console.log(`🗂  Network inventory: ${hosts.length} хостов из Вебмастера · health-rows ${health.size} · bad-rows ${bad.size}${NO_DEEP ? ' · --no-deep' : ' · +homepage/robots проб GOOD'}\n`);

  // 1) Webmaster summary по всем хостам
  const sums = await pool(hosts, CONCURRENCY, (h) => summary(h.hostId));

  // 2) deep-проб только GOOD-хостов
  const goodIdx = hosts.map((h, i) => ({ h, i })).filter(({ h }) => (health.get(h.host)?.verdict ?? 'GOOD') === 'GOOD');
  const probes = new Map<string, Probe>();
  if (!NO_DEEP) {
    const pr = await pool(goodIdx, CONCURRENCY, ({ h }) => probe(h.host));
    goodIdx.forEach(({ h }, k) => probes.set(h.host, pr[k]));
  }

  const rows: Row[] = hosts.map(({ host, hostId }, i) => {
    const hh = health.get(host);
    const verdict = (hh?.verdict ?? 'UNKNOWN').toUpperCase();
    const isValid = verdict === 'GOOD';
    const isBad = verdict === 'BAD' || bad.has(host);
    const domain = domainOf(host);
    const sub = subOf(host);
    const sm = sums[i];
    const sitemapCount = parseInt(hh?.sitemap_locs ?? '0', 10) || 0;
    const canonHost = (hh?.canonical_host ?? '').trim();
    const canonicalMode = !canonHost ? (isValid ? 'self' : 'none') : canonHost === host ? 'self' : `cross→${canonHost}`;
    const indexnowStatus = hh?.indexnow_status ?? '';
    const indexnowEligible = isValid && indexnowStatus !== '422';
    const recrawlEligible = isValid && sm.wmStatus.startsWith('verified');
    const pr = probes.get(host);
    const metrika = host.endsWith('kalkremont.ru') && !pr?.metrika ? KNOWN_METRIKA : (pr?.metrika ?? (NO_DEEP ? 'n/a' : ''));
    const reasonIfBad = isBad ? (bad.get(host)?.issue ?? hh?.issues ?? 'duplicate-ghost') : '';

    // priority_score: ранжируем по потенциалу роста денег.
    // 0 для BAD. Для GOOD: вес проекта × размер (√страниц) × (база + разрыв индексации).
    const gap = sitemapCount > 0 ? clamp(1 - sm.inSearch / sitemapCount, 0, 1) : 1;
    const priority = isValid
      ? Math.round(projectValue(domain) * Math.sqrt(sitemapCount + 1) * (0.3 + 0.7 * gap) * 10)
      : 0;

    return {
      domain, host, project: projectOf(domain, sub),
      isValid, isBad, reasonIfBad,
      sitemapUrl: `https://${host}/sitemap.xml`, sitemapCount,
      indexableCount: isValid ? sitemapCount : 0,
      canonicalMode, robots: pr?.robots ?? (NO_DEEP ? 'n/a' : 'n/a'),
      wmStatus: sm.wmStatus, gscStatus: 'n/a (нет GSC API-creds)',
      indexnowEligible, recrawlEligible,
      metrika, leadForms: pr ? (pr.forms ? 'yes' : 'no') : 'n/a', monetSlots: pr ? (pr.monet ? 'yes' : 'no') : 'n/a',
      inSearch: sm.inSearch, excluded: sm.excluded, loaded: sm.loaded, fatal: sm.fatal,
      priority,
    };
  });

  rows.sort((a, b) => b.priority - a.priority || b.inSearch - a.inSearch);

  await Bun.$`mkdir -p reports`.quiet();

  // ── 1) network-hosts-inventory.csv (все поля ТЗ) ──
  const invHead = 'domain,host,project,is_valid_host,is_bad_host,reason_if_bad,sitemap_url,sitemap_url_count,indexable_url_count,canonical_mode,robots_status,yandex_webmaster_status,google_search_console_status,indexnow_eligible,recrawl_eligible,metrika_counter,lead_forms_present,monetization_slots_present,priority_score';
  const inv = [invHead].concat(rows.map((r) => [
    r.domain, r.host, csvField(r.project), r.isValid, r.isBad, csvField(r.reasonIfBad),
    r.sitemapUrl, r.sitemapCount, r.indexableCount, csvField(r.canonicalMode), csvField(r.robots),
    csvField(r.wmStatus), csvField(r.gscStatus), r.indexnowEligible, r.recrawlEligible,
    r.metrika, r.leadForms, r.monetSlots, r.priority,
  ].join(','))).join('\n');
  await Bun.write('reports/network-hosts-inventory.csv', inv);

  // ── 2) network-indexation-status.csv ──
  const idxHead = 'domain,host,is_valid_host,sitemap_url_count,loaded_by_robot,in_search_yandex,excluded_yandex,fatal_problems,index_ratio,indexnow_eligible,recrawl_eligible,wm_status';
  const idxRows = [...rows].sort((a, b) => b.inSearch - a.inSearch);
  const idx = [idxHead].concat(idxRows.map((r) => [
    r.domain, r.host, r.isValid, r.sitemapCount, r.loaded, r.inSearch, r.excluded, r.fatal,
    r.sitemapCount > 0 ? (r.inSearch / r.sitemapCount).toFixed(2) : '0.00',
    r.indexnowEligible, r.recrawlEligible, csvField(r.wmStatus),
  ].join(','))).join('\n');
  await Bun.write('reports/network-indexation-status.csv', idx);

  // ── 3) network-money-map.csv ──
  const moneyHead = 'domain,host,project,is_valid_host,sitemap_url_count,in_search_yandex,index_gap,lead_forms_present,monetization_slots_present,metrika_counter,indexnow_eligible,recrawl_eligible,priority_score,next_action';
  const money = [moneyHead].concat(rows.filter((r) => r.isValid).map((r) => {
    const gap = r.sitemapCount - r.inSearch;
    const next = r.fatal > 0 ? 'FIX fatal site_problems'
      : r.metrika === '' ? 'ADD Metrika counter'
      : r.leadForms === 'no' ? 'ADD lead CTA/form'
      : gap > 50 ? 'PUSH indexation (IndexNow+recrawl+internal links)'
      : r.monetSlots === 'no' ? 'ADD monetization slots (config)'
      : 'EXPAND money pages';
    return [
      r.domain, r.host, csvField(r.project), r.isValid, r.sitemapCount, r.inSearch, gap,
      r.leadForms, r.monetSlots, r.metrika, r.indexnowEligible, r.recrawlEligible, r.priority, csvField(next),
    ].join(',');
  })).join('\n');
  await Bun.write('reports/network-money-map.csv', money);

  // ── консоль-сводка ──
  const valid = rows.filter((r) => r.isValid);
  const totalInSearch = rows.reduce((s, r) => s + r.inSearch, 0);
  const totalSitemap = valid.reduce((s, r) => s + r.sitemapCount, 0);
  const totalExcluded = rows.reduce((s, r) => s + r.excluded, 0);
  const liveInSearch = valid.filter((r) => r.inSearch > 0).length;
  console.log(`📊 СЕТЬ: всего ${rows.length} · GOOD ${valid.length} · BAD ${rows.length - valid.length}`);
  console.log(`   в поиске Яндекса (∑): ${totalInSearch} · sitemap-URL у GOOD (∑): ${totalSitemap} · исключено (∑): ${totalExcluded}`);
  console.log(`   GOOD-хостов с >0 в поиске: ${liveInSearch}/${valid.length}`);
  console.log(`\n🔝 ТОП-15 по priority_score (куда качать деньги):`);
  for (const r of rows.filter((r) => r.isValid).slice(0, 15)) {
    console.log(`   ${String(r.priority).padStart(4)}  ${r.host.padEnd(34)} sitemap ${String(r.sitemapCount).padStart(5)} · в поиске ${String(r.inSearch).padStart(5)} · forms ${r.leadForms} · monet ${r.monetSlots}`);
  }
  console.log(`\n💾 reports/network-hosts-inventory.csv (${rows.length}) · network-indexation-status.csv (${rows.length}) · network-money-map.csv (${valid.length})`);
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
