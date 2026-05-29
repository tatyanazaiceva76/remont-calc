#!/usr/bin/env bun
/**
 * seo-score.ts — money-скоринг страниц сети (ЭТАП 4).  `npm run seo:score`
 *
 * Формула (по ТЗ):
 *   money_score = service_commercial_value × city_demand_score × page_quality_score
 *               × indexability_score × internal_link_score
 *
 * Два прохода (дёшево → точно):
 *   PASS-1  структурный скор по ВСЕМ indexable URL (sitemap GOOD-хостов):
 *           service_value × city_demand × indexability(=1) × качество-приор × ссылки-приор.
 *   PASS-2  для топ-shortlist тянем HTML: реальные title/h1, page_quality (цена/FAQ/CTA/
 *           телефон/форма/объём), internal_link_score (счёт внутр. ссылок), indexability
 *           (noindex / не-self-canonical → 0). Пересчитываем money_score.
 *
 * Источники: reports/host-health.csv (GOOD-хосты), их sitemap.xml, D1 (лиды по URL),
 *   Webmaster in-search (статус индексации хоста — честно, без «песочницы»).
 *
 * Флаги: --shortlist N (HTML-добор, 400) · --top N (строк в CSV, 300) · --days N (лиды, 28)
 *        --concurrency N (8) · --host H (ограничить одним хостом)
 *
 * Вывод: reports/top-money-pages.csv
 *   url,service,city,query_cluster,money_score,indexed_status,impressions,clicks,leads,
 *   current_title,current_h1,recommended_title,recommended_h1,recommended_internal_links
 */
import { hostOf, registrableDomain, pageType, fetchSitemapUrls, loadHostHealth, csvField, pool } from './lib/seo-common';
import { CITIES, SERVICES, NICHE_BY_DOMAIN, cityKeyFromSlug, prettifySlug } from './lib/seo-taxonomy';

const TOKEN = process.env.YANDEX_OAUTH_TOKEN || '';
const USER = process.env.YANDEX_WEBMASTER_USER_ID || '';
const CF = process.env.CF_TOKEN, ACCT = process.env.CF_ACCOUNT_ID;
const D1_ID = '7cd87a86-0d94-4c07-afd8-6c920464de16'; // kalkremont-leads

const args = process.argv.slice(2);
const arg = (k: string, d: string) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SHORTLIST = parseInt(arg('--shortlist', '400'), 10);
const TOP = parseInt(arg('--top', '300'), 10);
const CONC = parseInt(arg('--concurrency', '8'), 10);
const ONE_HOST = arg('--host', '');
const UA = 'kalkremont-seo-score';

// ── фолбэк-приоры ────────────────────────────────────────────────────────────
const SVC_DEFAULT = 0.4;          // неизвестная услуга
const CITY_UNKNOWN = 0.28;        // город в URL есть, но нет в CITIES (малый рынок)
const NATIONAL_DEMAND = 0.55;     // страница без города (хаб «по РФ»)

// качество-приор по паттерну (PASS-1, до фетча)
const QUALITY_PRIOR: Record<string, number> = {
  home: 0.85, 'service-hub': 0.7, 'service-city': 0.72, 'niche-city': 0.7, 'city-hub': 0.65,
  'district-service': 0.6, 'district-hub': 0.55, 'service-variant': 0.62, 'service-sub': 0.58,
  price: 0.7, calculator: 0.5, content: 0.4, info: 0.35, other: 0.45,
};
const linkPrior = (depth: number) => [1.0, 0.85, 0.7, 0.6, 0.5, 0.45][Math.min(depth, 5)];

// кросс-продажа для рекомендованных внутренних ссылок
const CROSS_SELL = ['remont-vannoy', 'remont-kuhni', 'natyazhnye-potolki', 'dizayn-interyera', 'elektromontazh'];

// ── парсинг URL → услуга/город/паттерн ───────────────────────────────────────
interface Parsed {
  host: string; path: string; depth: number;
  serviceSlug: string; serviceName: string; serviceValue: number;
  cityKey: string; cityName: string; cityDemand: number; citySlug: string; cityLoc: string;
  districtSlug: string; subSlug: string;
  pattern: string; cluster: string;
}

function locOf(cityKey: string, cityName: string): string {
  return cityKey && CITIES[cityKey] ? CITIES[cityKey].loc : (cityName ? `в г. ${cityName}` : 'по России');
}

function resolveCity(slug: string): { key: string; name: string; demand: number } {
  if (!slug) return { key: '', name: '', demand: NATIONAL_DEMAND };
  const key = cityKeyFromSlug(slug);
  if (key && CITIES[key]) return { key, name: CITIES[key].name, demand: CITIES[key].demand };
  return { key: '', name: prettifySlug(slug.replace(/^v-/, '')), demand: CITY_UNKNOWN };
}

function parseUrl(u: string): Parsed {
  const host = hostOf(u);
  let path = '/';
  try { path = new URL(u).pathname.toLowerCase(); } catch { /* */ }
  const segs = path.split('/').filter(Boolean);
  const depth = segs.length;
  const regd = registrableDomain(host);
  const sub = host.replace(`.${regd}`, '').replace(regd, ''); // поддомен-метка (moskva, vannye, '')

  const P: Parsed = {
    host, path, depth,
    serviceSlug: '', serviceName: '', serviceValue: SVC_DEFAULT,
    cityKey: '', cityName: '', cityDemand: NATIONAL_DEMAND, citySlug: '', cityLoc: 'по России',
    districtSlug: '', subSlug: '', pattern: 'other', cluster: '',
  };

  // город из поддомена (если это городской саб типа moskva.kalkremont.ru)
  let cityFromSub = '';
  if (sub && cityKeyFromSlug(sub)) cityFromSub = sub;

  const isNiche = regd !== 'kalkremont.ru' && NICHE_BY_DOMAIN[regd];

  if (isNiche) {
    const niche = NICHE_BY_DOMAIN[regd];
    P.serviceSlug = niche.serviceSlug; P.serviceName = niche.name; P.serviceValue = niche.value;
    // /uslugi/{sub}/v-{city}/  |  /uslugi/{sub}/  |  /goroda/ | /faq/ ...
    if (segs[0] === 'uslugi' && segs[1]) {
      P.subSlug = segs[1];
      const cityArg = segs[2] || '';
      if (cityArg) { P.citySlug = cityArg.replace(/^v-/, ''); P.pattern = 'niche-city'; }
      else P.pattern = 'service-variant';
    } else if (!segs.length) P.pattern = 'home';
    else if (/faq|vopros/.test(segs[0])) P.pattern = 'content';
    else if (/kontakt|o-|about/.test(segs[0])) P.pattern = 'info';
    else if (/goroda|uslugi/.test(segs[0])) P.pattern = 'service-hub';
    else P.pattern = 'service-sub';
    if (!P.citySlug && cityFromSub) P.citySlug = cityFromSub;
  } else {
    // kalkremont.ru (флагман + городские сабдомены)
    if (!segs.length) {
      P.pattern = 'home';
      P.serviceSlug = 'remont-kvartir'; P.serviceName = 'Ремонт квартир'; P.serviceValue = 1.0;
    } else if (segs[0] === 'regiony') {
      // /regiony/{city}/{district}/{service}/
      P.citySlug = segs[1] || '';
      P.districtSlug = segs[2] || '';
      const svc = segs[3] || '';
      if (svc) { setService(P, svc); P.pattern = 'district-service'; }
      else if (P.districtSlug) P.pattern = 'district-hub';
      else P.pattern = 'city-hub';
    } else if (/^raschet-/.test(segs[0]) || /^skolko-/.test(segs[0])) {
      P.pattern = 'calculator';
      P.serviceName = prettifySlug(segs[0]); P.serviceSlug = segs[0]; P.serviceValue = 0.4;
    } else if (/stoimost|tsena|smeta|preyskurant|price/.test(segs[0])) {
      P.pattern = 'price';
      P.serviceSlug = 'remont-kvartir'; P.serviceName = 'Стоимость ремонта'; P.serviceValue = 0.85;
    } else if (/sovety|sovet|blog|stati|chto-luchshe|guide/.test(segs[0])) {
      P.pattern = 'content'; P.serviceName = prettifySlug(segs[0]); P.serviceSlug = segs[0]; P.serviceValue = 0.3;
    } else if (/o-sayte|brand|karta-sayta|poisk|widget|kontakt/.test(segs[0])) {
      P.pattern = 'info'; P.serviceName = prettifySlug(segs[0]); P.serviceSlug = segs[0]; P.serviceValue = 0.2;
    } else {
      // /{service}/{modifier?}/
      setService(P, segs[0]);
      const mod = segs[1] || '';
      if (!mod) P.pattern = 'service-hub';
      else if (/^v-/.test(mod) || cityKeyFromSlug(mod)) { P.citySlug = mod.replace(/^v-/, ''); P.pattern = 'service-city'; }
      else if (/pod-klyuch|kapitaln|kosmetich|dizayner|euro|byudzhet/.test(mod)) P.pattern = 'service-variant';
      else if (depth >= 2) P.pattern = 'service-sub';
      else P.pattern = 'service-hub';
    }
    if (!P.citySlug && cityFromSub) P.citySlug = cityFromSub;
  }

  // разрешаем город
  const c = resolveCity(P.citySlug);
  P.cityKey = c.key; P.cityName = c.name; P.cityDemand = c.demand;
  P.cityLoc = locOf(P.cityKey, P.cityName);

  // кластер запроса (голова) + service name fallback
  if (!P.serviceName) { P.serviceName = prettifySlug(P.serviceSlug || segs[0] || 'Ремонт'); }
  P.cluster = clusterOf(P);
  return P;
}

function setService(P: Parsed, slug: string) {
  P.serviceSlug = slug;
  const s = SERVICES[slug];
  if (s) { P.serviceName = s.name; P.serviceValue = s.value; }
  else { P.serviceName = prettifySlug(slug); P.serviceValue = SVC_DEFAULT; }
}

function clusterOf(P: Parsed): string {
  const loc = P.cityName ? P.cityLoc : '';
  switch (P.pattern) {
    case 'home': return 'Ремонт квартир — главная';
    case 'calculator': return `Калькулятор: ${P.serviceName}`;
    case 'content': return `Контент: ${P.serviceName}`;
    case 'info': return `Инфо: ${P.serviceName}`;
    case 'price': return `Стоимость ремонта ${loc}`.trim();
    case 'district-service': return `${P.serviceName} ${loc} · ${prettifySlug(P.districtSlug)}`.trim();
    case 'district-hub': return `Ремонт ${loc} · ${prettifySlug(P.districtSlug)}`.trim();
    case 'city-hub': return `Ремонт ${loc}`.trim();
    case 'niche-city': return `${P.serviceName}${P.subSlug ? ' ' + prettifySlug(P.subSlug) : ''} ${loc}`.trim();
    case 'service-variant': return `${P.serviceName} ${prettifySlug(P.subSlug || '')}`.trim();
    default: return `${P.serviceName}${loc ? ' ' + loc : ' (по РФ)'}`;
  }
}

// ── PASS-2: HTML-сигналы ─────────────────────────────────────────────────────
interface Sig {
  ok: boolean; title: string; h1: string;
  noindex: boolean; selfCanonical: boolean;
  price: boolean; faq: boolean; cta: boolean; phone: boolean; form: boolean;
  words: number; internalLinks: number;
}

function clean(s: string): string {
  return s.replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}

async function fetchSignals(u: string, host: string): Promise<Sig> {
  const empty: Sig = { ok: false, title: '', h1: '', noindex: false, selfCanonical: true, price: false, faq: false, cta: false, phone: false, form: false, words: 0, internalLinks: 0 };
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 12000);
    const r = await fetch(u, { headers: { 'User-Agent': UA }, signal: ctrl.signal });
    clearTimeout(to);
    if (!r.ok) return empty;
    const html = await r.text();
    const lower = html.toLowerCase();
    const title = clean((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '')).slice(0, 200);
    const h1 = clean((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '')).slice(0, 200);
    const noindex = /<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
    // self-canonical: canonical path ≈ текущий path (без хвостового /)
    let selfCanonical = true;
    const can = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1];
    if (can) {
      const cHost = hostOf(can); let cPath = '/'; try { cPath = new URL(can).pathname; } catch { /* */ }
      const norm = (p: string) => p.replace(/\/+$/, '') || '/';
      let uPath = '/'; try { uPath = new URL(u).pathname; } catch { /* */ }
      selfCanonical = (cHost === host || cHost === '') && norm(cPath) === norm(uPath);
    }
    // контентные сигналы
    const bodyText = clean(html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, ''));
    const words = bodyText ? bodyText.split(' ').length : 0;
    const price = /цена|стоимост|руб|₽|за м²|за кв|от \d|прайс/i.test(bodyText);
    const faq = /вопрос|часто задава|faq/i.test(lower);
    const cta = /заказать|оставить заявк|вызвать|рассчитать|консультац|позвонит|бесплатн|узнать цену/i.test(bodyText);
    const phone = /\+7|8\s*\(?\d{3}\)?[\s-]?\d{3}/.test(html);
    const form = /<form\b/i.test(html);
    // внутренние ссылки на тот же хост
    let internalLinks = 0;
    for (const m of html.matchAll(/<a\b[^>]+href=["']([^"'#]+)["']/gi)) {
      const href = m[1];
      if (href.startsWith('/') && !href.startsWith('//')) internalLinks++;
      else { const hh = hostOf(href); if (hh && hh === host) internalLinks++; }
    }
    return { ok: true, title, h1, noindex, selfCanonical, price, faq, cta, phone, form, words, internalLinks };
  } catch { return empty; }
}

function pageQuality(s: Sig): number {
  if (!s.ok) return 0.55; // не смогли получить — нейтральный приор
  const wordScore = Math.min(1, s.words / 600);
  let q = 0;
  q += s.title ? 0.14 : 0;
  q += s.h1 ? 0.14 : 0;
  q += s.price ? 0.2 : 0;
  q += s.cta ? 0.16 : 0;
  q += s.phone ? 0.1 : 0;
  q += s.form ? 0.06 : 0;
  q += s.faq ? 0.08 : 0;
  q += wordScore * 0.12;
  return Math.max(0.05, Math.min(1, q));
}

function indexabilityReal(s: Sig): number {
  if (!s.ok) return 0.8;          // не дотянулись — приор
  if (s.noindex) return 0;
  if (!s.selfCanonical) return 0.15;
  return 1.0;
}

const linkScoreReal = (n: number) => Math.max(0.15, Math.min(1, n / 40));

// ── рекомендации (коммерческие шаблоны) ──────────────────────────────────────
function clip(s: string, n: number): string { return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…'; }

function recTitle(P: Parsed): string {
  const loc = P.cityLoc;
  switch (P.pattern) {
    case 'home': return clip('Ремонт квартир под ключ — цена за м², смета онлайн', 65);
    case 'service-city':
    case 'niche-city': return clip(`${P.serviceName} ${loc}: цена за м², смета за 1 день`, 65);
    case 'district-service': return clip(`${P.serviceName} ${loc} — ${prettifySlug(P.districtSlug)}: цена, смета`, 70);
    case 'city-hub': return clip(`Ремонт квартир ${loc}: цены, смета, сроки`, 65);
    case 'district-hub': return clip(`Ремонт ${loc}, ${prettifySlug(P.districtSlug)}: цены и смета`, 70);
    case 'service-hub': return clip(`${P.serviceName} под ключ — цена за м², смета онлайн`, 65);
    case 'service-variant': return clip(`${P.serviceName} ${prettifySlug(P.subSlug)} — цена и смета`, 65);
    case 'price': return clip(`${P.serviceName} ${loc}: калькулятор цены и сметы`, 65);
    case 'calculator': return clip(`${P.serviceName}: онлайн-расчёт количества и цены`, 65);
    default: return clip(`${P.serviceName}${P.cityName ? ' ' + loc : ''}: цена и смета`, 65);
  }
}

function recH1(P: Parsed): string {
  const loc = P.cityLoc;
  switch (P.pattern) {
    case 'home': return 'Ремонт квартир под ключ';
    case 'service-city':
    case 'niche-city': return `${P.serviceName} ${loc}`;
    case 'district-service': return `${P.serviceName} — ${prettifySlug(P.districtSlug)}`;
    case 'city-hub': return `Ремонт квартир ${loc}`;
    case 'district-hub': return `Ремонт квартир — ${prettifySlug(P.districtSlug)}`;
    case 'service-hub': return `${P.serviceName} под ключ`;
    case 'service-variant': return `${P.serviceName} ${prettifySlug(P.subSlug)}`;
    case 'price': return `${P.serviceName} ${loc}`.trim();
    case 'calculator': return `Калькулятор: ${P.serviceName}`;
    default: return `${P.serviceName}${P.cityName ? ' ' + loc : ''}`.trim();
  }
}

function recLinks(P: Parsed): string {
  const h = `https://${P.host}`;
  const out: string[] = [];
  const add = (p: string) => { const full = h + p; if (!out.includes(full) && full !== h + P.path) out.push(full); };
  const regd = registrableDomain(P.host);
  const isNiche = regd !== 'kalkremont.ru' && NICHE_BY_DOMAIN[regd];

  if (isNiche) {
    add('/'); add('/uslugi/'); add('/goroda/');
    if (P.subSlug) add(`/uslugi/${P.subSlug}/`);
    add('/faq/');
  } else if (P.pattern === 'district-service' || P.pattern === 'district-hub' || P.pattern === 'city-hub') {
    add('/'); if (P.citySlug) add(`/regiony/${P.citySlug}/`);
    if (P.citySlug && P.districtSlug) add(`/regiony/${P.citySlug}/${P.districtSlug}/`);
    if (P.serviceSlug) add(`/${P.serviceSlug}/`);
    for (const cs of CROSS_SELL) { if (cs !== P.serviceSlug && P.citySlug && P.districtSlug) { add(`/regiony/${P.citySlug}/${P.districtSlug}/${cs}/`); if (out.length >= 5) break; } }
  } else if (P.pattern === 'service-city' || P.pattern === 'service-hub' || P.pattern === 'service-variant') {
    add('/'); if (P.serviceSlug) add(`/${P.serviceSlug}/`);
    add('/stoimost-remonta/');
    const cs = P.citySlug ? `/v-${P.citySlug}/` : '/';
    for (const x of CROSS_SELL) { if (x !== P.serviceSlug) { add(`/${x}${P.citySlug ? cs : '/'}`.replace(/\/+$/, '/')); if (out.length >= 5) break; } }
  } else {
    add('/'); add('/stoimost-remonta/'); add('/remont-kvartiry/');
    for (const x of CROSS_SELL) { add(`/${x}/`); if (out.length >= 5) break; }
  }
  return out.slice(0, 5).join(' ; ');
}

// ── источники данных ─────────────────────────────────────────────────────────
async function ya(method: string, path: string, body?: unknown) {
  const r = await fetch(`https://api.webmaster.yandex.net/v4${path}`, {
    method, headers: { Authorization: `OAuth ${TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const t = await r.text();
  try { return { status: r.status, ...JSON.parse(t) }; } catch { return { status: r.status, raw: t }; }
}

async function getHostIds(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!TOKEN || !USER) return map;
  const r = await ya('GET', `/user/${USER}/hosts`);
  for (const h of ((r as any).hosts || [])) {
    map.set(h.ascii_host_url.replace(/^https?:\/\//, '').replace(/\/$/, ''), h.host_id);
  }
  return map;
}

async function yandexIndexState(hostId: string): Promise<string> {
  const ins = await ya('GET', `/user/${USER}/hosts/${hostId}/search-urls/in-search/history`);
  if ((ins as any).error_code === 'HOST_NOT_LOADED') return 'HOST_NOT_LOADED';
  if ((ins as any).status && (ins as any).status >= 400) return `api_${(ins as any).status}`;
  const h = (ins as any).history || (ins as any).indicators?.in_search || [];
  const last = Array.isArray(h) ? h[h.length - 1] : null;
  return `yandex_in_search=${last?.value ?? 0}`;
}

// D1 лиды → Map<`host|normPath`, count> (normPath без хвостового /)
async function leadsByUrl(): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (!CF || !ACCT) return map;
  try {
    const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCT}/d1/database/${D1_ID}/query`, {
      method: 'POST', headers: { Authorization: `Bearer ${CF}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql: 'SELECT context, page, status FROM leads' }),
    });
    const j: any = await r.json();
    const rows = j.success ? (j.result?.[0]?.results || []) : [];
    for (const row of rows) {
      if (row.status === 'spam') continue;
      let host = ''; try { host = JSON.parse(row.context || '{}').host || ''; } catch { /* */ }
      if (!host) continue;
      let path = String(row.page || '/'); try { path = new URL(path, `https://${host}`).pathname; } catch { /* */ }
      const key = `${host}|${path.replace(/\/+$/, '') || '/'}`;
      map.set(key, (map.get(key) || 0) + 1);
    }
  } catch { /* */ }
  return map;
}

// ── основной поток ───────────────────────────────────────────────────────────
interface Scored { P: Parsed; url: string; pass1: number; sig?: Sig; quality: number; index: number; link: number; money: number; leads: number; }

async function main() {
  console.log(`💰 SEO money-scoring · shortlist=${SHORTLIST} · top=${TOP} · conc=${CONC}\n`);

  const health = await loadHostHealth();
  // GOOD-хосты (по умолчанию verdict GOOD, либо хост не встречался в health → считаем GOOD)
  let goodHosts = [...new Set([...health.keys()])].filter((h) => (health.get(h)?.verdict ?? 'GOOD') === 'GOOD');
  if (!goodHosts.length) { console.error('❌ Нет GOOD-хостов в reports/host-health.csv — сначала `npm run seo:analyze-hosts`'); process.exit(1); }
  if (ONE_HOST) goodHosts = goodHosts.filter((h) => h === ONE_HOST);
  console.log(`   GOOD-хостов: ${goodHosts.length}${ONE_HOST ? ` (фильтр: ${ONE_HOST})` : ''}`);

  // PASS-1: собрать кандидатов из sitemap, структурный скор
  const leads = await leadsByUrl();
  const candidates: Scored[] = [];
  let sitemapTotal = 0;
  await pool(goodHosts, 10, async (host) => {
    const urls = await fetchSitemapUrls(host, UA);
    for (const u of urls) {
      if (hostOf(u) !== host) continue; // только свои URL
      sitemapTotal++;
      const P = parseUrl(u);
      const qPrior = QUALITY_PRIOR[P.pattern] ?? 0.45;
      const pass1 = P.serviceValue * P.cityDemand * qPrior * 1.0 * linkPrior(P.depth);
      candidates.push({ P, url: u, pass1, quality: qPrior, index: 1, link: linkPrior(P.depth), money: pass1, leads: 0 });
    }
  });
  console.log(`   URL-кандидатов (свои, indexable): ${candidates.length} из ${sitemapTotal} loc`);
  if (!candidates.length) { console.error('❌ Не собрано ни одного URL из sitemap.'); process.exit(1); }

  // shortlist по pass-1
  candidates.sort((a, b) => b.pass1 - a.pass1);
  const shortlist = candidates.slice(0, Math.min(SHORTLIST, candidates.length));
  console.log(`   PASS-2: тянем HTML для ${shortlist.length} страниц…`);

  // PASS-2: реальные сигналы
  let fetched = 0;
  await pool(shortlist, CONC, async (s) => {
    const sig = await fetchSignals(s.url, s.P.host);
    s.sig = sig;
    s.quality = pageQuality(sig);
    s.index = indexabilityReal(sig);
    s.link = linkScoreReal(sig.internalLinks);
    s.money = s.P.serviceValue * s.P.cityDemand * s.quality * s.index * s.link;
    const key = `${s.P.host}|${s.P.path.replace(/\/+$/, '') || '/'}`;
    s.leads = leads.get(key) || 0;
    if (sig.ok) fetched++;
  });
  console.log(`   PASS-2: успешно загружено ${fetched}/${shortlist.length}`);

  // финальная сортировка + срез топ
  shortlist.sort((a, b) => b.money - a.money);
  const top = shortlist.slice(0, Math.min(TOP, shortlist.length));

  // статус индексации: тянем in-search для уникальных хостов из топа (честный замер)
  const hostIds = await getHostIds();
  const topHosts = [...new Set(top.map((s) => s.P.host))];
  const idxState = new Map<string, string>();
  await pool(topHosts, 6, async (host) => {
    const id = hostIds.get(host);
    idxState.set(host, id ? await yandexIndexState(id) : 'no_webmaster_id');
  });

  // ── CSV ──
  const header = ['url', 'service', 'city', 'query_cluster', 'money_score', 'indexed_status',
    'impressions', 'clicks', 'leads', 'current_title', 'current_h1',
    'recommended_title', 'recommended_h1', 'recommended_internal_links'];
  const lines = [header.join(',')];
  for (const s of top) {
    const P = s.P;
    let status = idxState.get(P.host) || 'n/a';
    if (s.sig?.noindex) status = 'noindex';
    else if (s.sig && !s.sig.selfCanonical) status = 'non-self-canonical';
    const row = [
      s.url, P.serviceName, P.cityName || 'РФ', P.cluster,
      +(s.money * 100).toFixed(2), status,
      0, 0, s.leads,                                   // impressions/clicks: нет per-URL источника (Я. query-analytics — per-query)
      s.sig?.title || '', s.sig?.h1 || '',
      recTitle(P), recH1(P), recLinks(P),
    ];
    lines.push(row.map(csvField).join(','));
  }

  await Bun.$`mkdir -p reports`.quiet();
  await Bun.write('reports/top-money-pages.csv', lines.join('\n'));

  // ── консоль: топ-15 + распределение по паттернам ──
  const byPattern = new Map<string, number>();
  for (const s of shortlist) byPattern.set(s.P.pattern, (byPattern.get(s.P.pattern) || 0) + 1);
  console.log(`\n🏆 Топ-15 money-страниц:`);
  for (const s of top.slice(0, 15)) {
    console.log(`   ${String(+(s.money * 100).toFixed(1)).padStart(5)}  ${s.P.cluster.slice(0, 38).padEnd(38)} ${s.url}`);
  }
  const idxNote = [...new Set([...idxState.values()])].join(', ');
  console.log(`\n📊 Паттерны в shortlist: ${[...byPattern.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(' · ')}`);
  console.log(`   Индексация (топ-хосты): ${idxNote || 'n/a'} · impressions/clicks: per-URL источника нет (Я. отдаёт per-query)`);
  console.log(`   Лидов с атрибуцией по URL в топе: ${top.reduce((a, s) => a + s.leads, 0)}`);
  console.log(`\n💾 reports/top-money-pages.csv (${top.length} строк)`);
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
