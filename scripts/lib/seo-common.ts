/**
 * seo-common.ts — общие хелперы для SEO-скриптов (dashboard / scoring / preflight).
 */

export function hostOf(u: string): string { try { return new URL(u).host; } catch { return ''; } }

/** Регистрируемый домен (последние 2 лейбла): moskva.kalkremont.ru → kalkremont.ru */
export function registrableDomain(host: string): string {
  const p = host.replace(/^https?:\/\//, '').replace(/\/.*$/, '').split('.');
  return p.length <= 2 ? p.join('.') : p.slice(-2).join('.');
}

/** Тип страницы по пути URL — для группировки в дашборде и скоринге. */
export function pageType(pathOrUrl: string): string {
  let path = pathOrUrl;
  try { if (/^https?:\/\//.test(pathOrUrl)) path = new URL(pathOrUrl).pathname; } catch { /* как есть */ }
  path = (path || '/').toLowerCase().split('?')[0].split('#')[0];
  const segs = path.split('/').filter(Boolean);
  if (segs.length === 0) return 'home';
  const joined = segs.join('/');
  if (/tsena|tseny|stoimost|stoimost-|\bprice\b|preyskurant|kalkulyator|kalkulator/.test(joined)) return 'price';
  if (/sovet|blog|stati|staty|article|guide|faq|vopros|kak-/.test(joined)) return 'content';
  // городской лист: есть сегмент v-{city} / pod-klyuch-v-{city} / rayon-{...}
  if (segs.some((s) => /^v-[a-z0-9-]+$/.test(s) || /pod-klyuch/.test(s) || /^rayon-/.test(s))) return 'city-leaf';
  if (segs.length === 1) return 'service-hub';
  if (segs.length === 2) return 'city-leaf';
  return 'deep-leaf';
}

/** Все <loc> из sitemap.xml хоста (разворачивает sitemap-index). */
export async function fetchSitemapUrls(host: string, ua = 'kalkremont-seo'): Promise<string[]> {
  async function locs(url: string): Promise<string[]> {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': ua } });
      if (!r.ok) return [];
      const x = await r.text();
      return [...x.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    } catch { return []; }
  }
  const top = await locs(`https://${host}/sitemap.xml`);
  if (!top.length) return [];
  // sitemap-index: первый loc указывает на .xml → собрать все суб-карты
  if (top.every((u) => /\.xml(\?|$)/i.test(u))) {
    const all: string[] = [];
    for (const sm of top) all.push(...await locs(sm));
    return all;
  }
  return top;
}

export interface HostHealth { verdict: 'GOOD' | 'BAD'; sitemapLocs: number; canonicalHost: string; recommended: string; }

/** Карта host→здоровье из reports/host-health.csv (генерит analyze-hosts.ts). */
export async function loadHostHealth(path = 'reports/host-health.csv'): Promise<Map<string, HostHealth>> {
  const map = new Map<string, HostHealth>();
  try {
    const txt = await Bun.file(path).text();
    const lines = txt.split('\n').slice(1).filter(Boolean);
    for (const line of lines) {
      const f = parseCsvLine(line);
      // host,verdict,home_status,redirect_to,canonical,canonical_host,sitemap_locs,sitemap_host,indexnow_status,issues,recommended
      map.set(f[0], {
        verdict: (f[1] === 'BAD' ? 'BAD' : 'GOOD'),
        sitemapLocs: parseInt(f[6] || '0', 10) || 0,
        canonicalHost: f[5] || '',
        recommended: f[10] || '',
      });
    }
  } catch { /* нет файла — пусто */ }
  return map;
}

/** Минимальный CSV-парсер строки (учитывает кавычки и экранированные ""). */
export function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else {
      if (c === '"') q = true;
      else if (c === ',') { out.push(cur); cur = ''; }
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}

export function csvField(s: unknown): string {
  const v = String(s ?? '');
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/** Параллельный map с ограничением конкуренции. */
export async function pool<T, R>(items: T[], n: number, fn: (t: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx], idx); }
  }));
  return out;
}
