/**
 * money-pages-apply.ts — ЕДИНЫЙ ИСТОЧНИК ИСТИНЫ для apply ЭТАПА 6.
 *
 * Читает reports/proposed-new-money-pages.csv (топ-N по money_score, который пишет
 * scripts/generate-money-pages.ts) и возвращает строки для билда новых money-страниц.
 *
 * Этот же CSV пингуется в IndexNow/переобход после деплоя → гарантия консистентности:
 *   getStaticPaths (роуты cena/pod-klyuch) == sitemap.xml == набор IndexNow == топ-300.
 *
 * Запускается в Node-контексте `astro build` (process.cwd() = корень проекта).
 * Если CSV нет — НЕ роняем весь билд сайта, а громко предупреждаем и отдаём пусто
 * (страницы просто не сгенерируются; это ловится постбилд-проверкой количества).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type MoneyPageType = 'price' | 'turnkey';

export interface ApplyRow {
  url: string;
  nicheSlug: string;
  citySlug: string;
  pageType: MoneyPageType;
}

const CSV_PATH = resolve(process.cwd(), 'reports/proposed-new-money-pages.csv');
// page_type выводим из САМОГО URL (не из CSV-колонки) — максимально устойчиво к парсингу.
const PRICE_RE = /^https?:\/\/[^/]+\/([^/]+)\/cena\/v-([^/]+)\/?$/;
const TURNKEY_RE = /^https?:\/\/[^/]+\/([^/]+)\/pod-klyuch\/v-([^/]+)\/?$/;

let cache: ApplyRow[] | null = null;

export function applyRows(): ApplyRow[] {
  if (cache) return cache;
  let txt: string;
  try {
    txt = readFileSync(CSV_PATH, 'utf8');
  } catch {
    console.warn(
      `[money-pages-apply] ${CSV_PATH} не найден — новые money-страницы НЕ генерируются. ` +
        `Запусти: npm run seo:generate-money-pages -- --limit 300 --dry-run`,
    );
    cache = [];
    return cache;
  }
  const rows: ApplyRow[] = [];
  const seen = new Set<string>();
  for (const line of txt.split('\n').slice(1)) {
    // url — первое поле CSV, всегда без запятых и без кавычек (csvField его не оборачивает)
    const url = line.split(',')[0]?.trim();
    if (!url || !/^https?:\/\//.test(url)) continue;
    let m = PRICE_RE.exec(url);
    if (m) {
      add(rows, seen, url, m[1], m[2], 'price');
      continue;
    }
    m = TURNKEY_RE.exec(url);
    if (m) {
      add(rows, seen, url, m[1], m[2], 'turnkey');
      continue;
    }
  }
  cache = rows;
  return rows;
}

function add(
  rows: ApplyRow[],
  seen: Set<string>,
  url: string,
  nicheSlug: string,
  citySlug: string,
  pageType: MoneyPageType,
): void {
  const key = `${pageType}:${nicheSlug}:${citySlug}`;
  if (seen.has(key)) return;
  seen.add(key);
  rows.push({ url, nicheSlug, citySlug, pageType });
}

export function applyRowsByType(t: MoneyPageType): ApplyRow[] {
  return applyRows().filter((r) => r.pageType === t);
}
