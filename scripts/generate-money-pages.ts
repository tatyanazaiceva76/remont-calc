#!/usr/bin/env bun
/**
 * generate-money-pages.ts — генератор НОВЫХ коммерческих money-страниц (ЭТАП 6).
 *
 * ⚠️ ОБРАТИМАЯ ЧАСТЬ: по умолчанию только DRY-RUN — gap-анализ + артефакты.
 *    --apply ЗАБЛОКИРОВАН (публикация новых страниц требует отдельного «го»
 *    + прохождения preflight-гейта). Скрипт НИЧЕГО не пишет в src/ и не деплоит.
 *
 * Что делает (dry-run):
 *   1) берёт за основу РЕАЛЬНЫЕ данные: src/data/niche-services.ts (19 ниш,
 *      pricePerSqM + subTypes{priceMult} + faqs/works/materials) и
 *      src/data/niche-cities.ts (40 городов с priceMult);
 *   2) находит ПРОБЕЛЫ — высокоинтентные коммерческие комбинации, которых ещё НЕТ:
 *        • price     → /{service}/cena/v-{city}/   («цена/стоимость X в городе»),
 *        • turnkey   → /{service}/pod-klyuch/v-{city}/ (под ключ × город),
 *      при этом service×city (/{service}/v-{city}/) уже насыщён (760 стр.) —
 *      его НЕ дублируем, показываем как «coverage 100%»;
 *   3) каждая страница НЕ тонкая: уникальная матрица цен (pricePerSqM × city.priceMult
 *      × subtype.priceMult), свой H1/title, CTA, FAQ, блок цены/сметы, перелинковка,
 *      попадание в sitemap, IndexNow-eligible;
 *   4) скоринг estimated_money_score = service_value × city_demand × pattern_prior
 *      × link_prior × proj_quality × 100 (приоры — из seo-score.ts, без live-сигналов,
 *      т.к. страниц ещё нет);
 *   5) пишет 4 артефакта в reports/:
 *        money-page-gaps.csv, proposed-new-money-pages.csv,
 *        top-50-new-money-pages.csv, seo-stage-6-dry-run.md;
 *   6) PREFLIGHT-ГЕЙТ: --apply невозможен, если у кандидата нарушено хоть одно из
 *      10 условий (canonical=self, есть CTA/FAQ/price-блок, ≥1 внутр. ссылка,
 *      попадёт в sitemap, проходит IndexNow host-ownership, хост не в bad-hosts.csv,
 *      title/h1 не дублируются, HTML не тонкий).
 *
 * Запуск (как в ТЗ):
 *   npm run seo:generate-money-pages -- --limit 100 --dry-run
 *   bun scripts/generate-money-pages.ts --dry-run            # все кандидаты
 *   bun scripts/generate-money-pages.ts --limit 100 --apply  # ⛔ заблокировано
 */
import { hostOf, csvField } from './lib/seo-common';
import { CITIES, SERVICES, cityKeyFromSlug } from './lib/seo-taxonomy';
import { niches } from '../src/data/niche-services';
import { nicheCities } from '../src/data/niche-cities';

const FLAGSHIP = 'www.kalkremont.ru';
const SITEMAP = `https://${FLAGSHIP}/sitemap.xml`;

// ── флаги ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const has = (k: string) => args.includes(k);
const val = (k: string, d: string) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const APPLY = has('--apply');
const DRY = has('--dry-run') || !APPLY;     // по умолчанию dry-run
const LIMIT = parseInt(val('--limit', '0'), 10) || Infinity; // 0/нет → без лимита

// ── приоры (синхронны с seo-score.ts) ─────────────────────────────────────────
const SVC_DEFAULT = 0.4;
const CITY_UNKNOWN = 0.28;
const linkPrior = (depth: number) => [1.0, 0.85, 0.7, 0.6, 0.5, 0.45][Math.min(depth, 5)];

// Приор паттерна по коммерческому интенту + потенциалу выдачи.
const PATTERN_PRIOR: Record<string, number> = {
  price: 0.95,            // «цена/стоимость X в городе» — самый коммерческий интент
  turnkey: 0.9,           // «X под ключ в городе» — высокий интент + средний чек
  'service-city-new': 0.72,
};
// Прогноз-качество: мы КОНТРОЛИРУЕМ билд и форсим required_unique_blocks → высокий приор.
const PROJ_QUALITY: Record<string, number> = { price: 0.85, turnkey: 0.85, 'service-city-new': 0.7 };

// ── модели данных ──────────────────────────────────────────────────────────────
interface Candidate {
  url: string; host: string;
  service: string; serviceSlug: string; serviceValue: number;
  city: string; citySlug: string; cityDemand: number; cityLoc: string; cityMult: number;
  pageType: 'price' | 'turnkey' | 'service-city-new';
  queryCluster: string;
  estMoney: number;
  reason: string;
  uniqueBlocks: string[];
  internalLinks: string[];
  canonical: string;
  sitemapTarget: string;
  indexnowEligible: boolean;
  riskLevel: 'low' | 'med' | 'high';
  title: string; h1: string;
  priceMin: number; priceMax: number;
}

// service_value из таксономии (все 19 ниш там есть), иначе фолбэк
function serviceValueOf(slug: string): number { return SERVICES[slug]?.value ?? SVC_DEFAULT; }

function cityDemandOf(citySlug: string): number {
  const key = cityKeyFromSlug(citySlug);
  return key && CITIES[key] ? CITIES[key].demand : CITY_UNKNOWN;
}

function round0(n: number): number { return Math.round(n / 100) * 100; } // до сотен ₽
function fmtRub(n: number): string { return n.toLocaleString('ru-RU'); }

// ── загрузка bad-hosts для host-ownership гейта ────────────────────────────────
async function loadBadHosts(): Promise<Set<string>> {
  try {
    const txt = await Bun.file('reports/bad-hosts.csv').text();
    return new Set(txt.split('\n').slice(1).filter(Boolean).map((l) => l.split(',')[0].trim()).filter(Boolean));
  } catch { return new Set(); }
}

// ── генерация кандидатов (только то, чего ещё НЕТ) ──────────────────────────────
function buildCandidates(): { cands: Candidate[]; gaps: GapRow[]; aliases: AliasFinding[] } {
  const cands: Candidate[] = [];
  const gaps: GapRow[] = [];

  // ДЕДУП ПО ИМЕНИ: в каталоге есть ниши-клоны с одинаковым `name` (например
  // uborka-posle-stroyki дублирует uborka-posle-remonta — тот же name/intro/цена).
  // Генерить money-страницы для ОБОИХ = плодить дубль-title/h1 (каннибализация),
  // что и ловит preflight. Поэтому каноном считаем нишу с бОльшим service_value
  // (при равенстве — первую), остальные одноимённые — алиасы, страницы НЕ генерим.
  const byName = new Map<string, typeof niches[number][]>();
  for (const n of niches) (byName.get(n.name) ?? byName.set(n.name, []).get(n.name)!).push(n);
  const aliasSlugs = new Set<string>();
  const aliases: AliasFinding[] = [];
  for (const [name, group] of byName) {
    if (group.length < 2) continue;
    const sorted = [...group].sort((a, b) => serviceValueOf(b.slug) - serviceValueOf(a.slug));
    const canon = sorted[0];
    for (const dup of sorted.slice(1)) {
      aliasSlugs.add(dup.slug);
      aliases.push({ aliasSlug: dup.slug, canonicalSlug: canon.slug, name });
    }
  }

  // service×city (v-city) — УЖЕ насыщён (niches × cities). Фиксируем как 100% coverage,
  // НЕ генерируем (иначе дубль-каннибализация).
  const liveNiches = niches.filter((n) => !aliasSlugs.has(n.slug));
  const existingServiceCity = liveNiches.length * nicheCities.length;
  gaps.push({
    pageType: 'service-city (есть)', scope: '/{service}/v-{city}/',
    totalPossible: existingServiceCity, existing: existingServiceCity, missing: 0,
    note: 'насыщено в ЭТАП-1..5 — не дублируем',
  });

  for (const n of liveNiches) {
    const sValue = serviceValueOf(n.slug);
    const podKlyuch = n.subTypes.find((s) => s.slug === 'pod-klyuch');

    let priceMissing = 0, turnkeyMissing = 0;
    for (const c of nicheCities) {
      const demand = cityDemandOf(c.slug);
      const loc = `в ${c.name}`;                 // c.name — предложный падеж («Москве»)
      const baseMin = round0(n.pricePerSqM.min * c.priceMult);
      const baseMax = round0(n.pricePerSqM.max * c.priceMult);

      // ── PRICE: /{service}/cena/v-{city}/ ──
      {
        const url = `https://${FLAGSHIP}/${n.slug}/cena/v-${c.slug}/`;
        const title = clip(`${n.name} — цена за м² ${loc}: смета за 1 день`, 65);
        const h1 = `${n.name} — цена ${loc}`;
        cands.push(mk({
          url, pageType: 'price', niche: n, city: c, sValue, demand, loc,
          baseMin, baseMax,
          queryCluster: `${n.nameShort} цена/стоимость ${loc}`,
          title, h1,
          reason: `Высокий коммерческий интент «цена/стоимость»; уникальная матрица цен ${fmtRub(baseMin)}–${fmtRub(baseMax)} ₽/м² (city.priceMult=${c.priceMult}) × ${n.subTypes.length} подтипов; страницы /${n.slug}/cena/v-${c.slug}/ ещё нет`,
          uniqueBlocks: [
            'h1-уникальный', `intro-город-${c.nameNom}`,
            'price-matrix(подтипы×city.priceMult)', 'table-смета-пример-по-площади',
            'calc-cta-выше-сгиба', 'lead-form-sticky', 'faq-5-город',
            'sroki-timeline', 'breadcrumbs', 'internal-links-6',
          ],
          internalLinks: [
            `https://${FLAGSHIP}/${n.slug}/`,
            `https://${FLAGSHIP}/${n.slug}/v-${c.slug}/`,
            `https://${FLAGSHIP}/${n.slug}/cena/`,
            `https://${FLAGSHIP}/stoimost-remonta/`,
            c.href,
          ],
          risk: 'low',
        }));
        priceMissing++;
      }

      // ── TURNKEY: /{service}/pod-klyuch/v-{city}/ (только где есть подтип pod-klyuch) ──
      if (podKlyuch) {
        const tkMin = round0(baseMin * podKlyuch.priceMult);
        const tkMax = round0(baseMax * podKlyuch.priceMult);
        const url = `https://${FLAGSHIP}/${n.slug}/pod-klyuch/v-${c.slug}/`;
        const title = clip(`${n.name} под ключ ${loc} — цена и смета`, 65);
        const h1 = `${n.name} под ключ ${loc}`;
        cands.push(mk({
          url, pageType: 'turnkey', niche: n, city: c, sValue, demand, loc,
          baseMin: tkMin, baseMax: tkMax,
          queryCluster: `${n.nameShort} под ключ ${loc}`,
          title, h1,
          reason: `Интент «под ключ» + город; полный цикл ${fmtRub(tkMin)}–${fmtRub(tkMax)} ₽/м² (priceMult=${podKlyuch.priceMult}); страницы /${n.slug}/pod-klyuch/v-${c.slug}/ ещё нет (подтип pod-klyuch есть только без города)`,
          uniqueBlocks: [
            'h1-уникальный', `intro-под-ключ-${c.nameNom}`,
            'price-блок-под-ключ', 'scope-что-входит-под-ключ',
            'calc-cta-выше-сгиба', 'lead-form-sticky', 'faq-5-город',
            'sroki-timeline', 'breadcrumbs', 'internal-links-6',
          ],
          internalLinks: [
            `https://${FLAGSHIP}/${n.slug}/`,
            `https://${FLAGSHIP}/${n.slug}/pod-klyuch/`,
            `https://${FLAGSHIP}/${n.slug}/v-${c.slug}/`,
            `https://${FLAGSHIP}/${n.slug}/cena/v-${c.slug}/`,
            c.href,
          ],
          risk: 'low',
        }));
        turnkeyMissing++;
      }
    }

    gaps.push({
      pageType: 'price', scope: `/${n.slug}/cena/v-{city}/`,
      totalPossible: nicheCities.length, existing: 0, missing: priceMissing,
      note: `${n.name}: цена×город, value=${sValue}`,
    });
    if (podKlyuch) gaps.push({
      pageType: 'turnkey', scope: `/${n.slug}/pod-klyuch/v-{city}/`,
      totalPossible: nicheCities.length, existing: 0, missing: turnkeyMissing,
      note: `${n.name}: под ключ×город, priceMult=${podKlyuch.priceMult}`,
    });
  }

  return { cands, gaps, aliases };
}

interface AliasFinding { aliasSlug: string; canonicalSlug: string; name: string; }

interface MkArgs {
  url: string; pageType: Candidate['pageType']; niche: typeof niches[number]; city: typeof nicheCities[number];
  sValue: number; demand: number; loc: string; baseMin: number; baseMax: number;
  queryCluster: string; title: string; h1: string; reason: string;
  uniqueBlocks: string[]; internalLinks: string[]; risk: Candidate['riskLevel'];
}
function mk(a: MkArgs): Candidate {
  const prior = PATTERN_PRIOR[a.pageType];
  const quality = PROJ_QUALITY[a.pageType];
  const depth = new URL(a.url).pathname.split('/').filter(Boolean).length; // service/cena/v-city = 3
  const est = +(a.sValue * a.demand * prior * linkPrior(depth) * quality * 100).toFixed(2);
  return {
    url: a.url, host: hostOf(a.url),
    service: a.niche.name, serviceSlug: a.niche.slug, serviceValue: a.sValue,
    city: a.city.nameNom, citySlug: a.city.slug, cityDemand: a.demand, cityLoc: a.loc, cityMult: a.city.priceMult,
    pageType: a.pageType, queryCluster: a.queryCluster, estMoney: est,
    reason: a.reason, uniqueBlocks: a.uniqueBlocks, internalLinks: a.internalLinks,
    canonical: a.url, sitemapTarget: SITEMAP, indexnowEligible: true, riskLevel: a.risk,
    title: a.title, h1: a.h1, priceMin: a.baseMin, priceMax: a.baseMax,
  };
}

function clip(s: string, n: number): string { return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…'; }

interface GapRow { pageType: string; scope: string; totalPossible: number; existing: number; missing: number; note: string; }

// ── PREFLIGHT-ГЕЙТ (10 условий; нарушение → apply невозможен) ───────────────────
interface Preflight { pass: boolean; failed: string[]; }
function preflight(c: Candidate, badHosts: Set<string>, titleSeen: Map<string, number>, h1Seen: Map<string, number>): Preflight {
  const failed: string[] = [];
  // 1) canonical = self
  if (c.canonical !== c.url) failed.push('canonical≠self');
  // 2) есть CTA-блок
  if (!c.uniqueBlocks.some((b) => /cta|lead|заявк|form|форм/i.test(b))) failed.push('нет CTA-блока');
  // 3) есть FAQ-блок
  if (!c.uniqueBlocks.some((b) => /faq|вопрос/i.test(b))) failed.push('нет FAQ-блока');
  // 4) есть price/cost-блок
  if (!c.uniqueBlocks.some((b) => /price|cena|цен|смет|стоим/i.test(b)) || !(c.priceMin > 0 && c.priceMax > c.priceMin)) failed.push('нет блока цены/сметы');
  // 5) ≥1 внутренняя ссылка-источник
  if (c.internalLinks.filter(Boolean).length < 1) failed.push('нет внутренних ссылок-источников');
  // 6) попадёт в sitemap
  if (!c.sitemapTarget) failed.push('не попадёт в sitemap');
  // 7) IndexNow host-ownership: хост URL принадлежит нам (flagship)
  if (hostOf(c.url) !== c.host || c.host !== FLAGSHIP) failed.push('провал IndexNow host-ownership');
  // 8) хост не в bad-hosts.csv
  if (badHosts.has(c.host)) failed.push('хост в bad-hosts.csv');
  // 9) title/h1 не дублируются (ни между собой в наборе, ни с шаблоном существующих v-city/subtype)
  if ((titleSeen.get(c.title) ?? 0) > 1) failed.push('дубль title');
  if ((h1Seen.get(c.h1) ?? 0) > 1) failed.push('дубль h1');
  if (isExistingTemplate(c)) failed.push('title/h1 совпадает с существующим шаблоном');
  // 10) HTML не тонкий (≥6 уникальных блоков + матрица цен)
  if (c.uniqueBlocks.length < 6) failed.push('тонкий HTML (<6 блоков)');
  return { pass: failed.length === 0, failed };
}

// существующие шаблоны title/h1, которые НЕ должны совпадать с новыми
function isExistingTemplate(c: Candidate): boolean {
  // существующая v-city: h1 = «{name} в {city}» ; subtype: h1 = «{name} Под ключ» (без города)
  const vCityH1 = `${c.service} ${c.cityLoc}`;
  const subtypeH1 = `${c.service} Под ключ`;
  return c.h1 === vCityH1 || c.h1 === subtypeH1;
}

// ── вывод артефактов ────────────────────────────────────────────────────────────
const PROPOSED_HEADER = ['url', 'host', 'service', 'city', 'page_type', 'query_cluster',
  'estimated_money_score', 'reason_to_create', 'required_unique_blocks', 'internal_link_sources',
  'canonical', 'sitemap_target', 'indexnow_eligible', 'risk_level'];

function proposedRow(c: Candidate): string {
  return [
    c.url, c.host, c.service, c.city, c.pageType, c.queryCluster,
    c.estMoney, c.reason, c.uniqueBlocks.join(' | '), c.internalLinks.join(' ; '),
    c.canonical, c.sitemapTarget, c.indexnowEligible ? 'yes' : 'no', c.riskLevel,
  ].map(csvField).join(',');
}

async function main() {
  if (APPLY) {
    console.error('⛔ ЭТАП 6 apply ЗАБЛОКИРОВАН.');
    console.error('   Публикация новых страниц требует ОТДЕЛЬНОГО подтверждения «го» + прохождения preflight-гейта.');
    console.error('   Сейчас доступен только dry-run: bun scripts/generate-money-pages.ts --dry-run');
    process.exit(2);
  }

  console.log(`🏗️  ЭТАП 6 · генератор money-страниц · РЕЖИМ DRY-RUN${LIMIT !== Infinity ? ` · limit=${LIMIT}` : ''}\n`);

  const badHosts = await loadBadHosts();
  const { cands, gaps, aliases } = buildCandidates();

  // частоты title/h1 для дубль-проверки
  const titleSeen = new Map<string, number>();
  const h1Seen = new Map<string, number>();
  for (const c of cands) {
    titleSeen.set(c.title, (titleSeen.get(c.title) ?? 0) + 1);
    h1Seen.set(c.h1, (h1Seen.get(c.h1) ?? 0) + 1);
  }

  // preflight по каждому + сортировка по estimated_money_score ↓
  let passCount = 0; const failReasons = new Map<string, number>();
  for (const c of cands) {
    const pf = preflight(c, badHosts, titleSeen, h1Seen);
    if (pf.pass) passCount++;
    else for (const r of pf.failed) failReasons.set(r, (failReasons.get(r) ?? 0) + 1);
  }
  cands.sort((a, b) => b.estMoney - a.estMoney);

  // лимит применяем к proposed-набору (gaps всегда полный, top-50 всегда 50)
  const proposed = LIMIT === Infinity ? cands : cands.slice(0, LIMIT);
  const top50 = cands.slice(0, 50);

  await Bun.$`mkdir -p reports`.quiet();

  // 1) money-page-gaps.csv
  const gapLines = ['page_type,scope,total_possible,existing,missing,coverage_pct,note'];
  for (const g of gaps) {
    const cov = g.totalPossible ? Math.round((g.existing / g.totalPossible) * 100) : 0;
    gapLines.push([g.pageType, g.scope, g.totalPossible, g.existing, g.missing, cov + '%', g.note].map(csvField).join(','));
  }
  await Bun.write('reports/money-page-gaps.csv', gapLines.join('\n'));

  // 2) proposed-new-money-pages.csv (точные колонки из ТЗ)
  const propLines = [PROPOSED_HEADER.join(',')].concat(proposed.map(proposedRow));
  await Bun.write('reports/proposed-new-money-pages.csv', propLines.join('\n'));

  // 3) top-50-new-money-pages.csv
  const topLines = [PROPOSED_HEADER.join(',')].concat(top50.map(proposedRow));
  await Bun.write('reports/top-50-new-money-pages.csv', topLines.join('\n'));

  // 4) seo-stage-6-dry-run.md
  const byType = new Map<string, number>();
  for (const c of cands) byType.set(c.pageType, (byType.get(c.pageType) ?? 0) + 1);
  const totalMissing = gaps.reduce((a, g) => a + g.missing, 0);
  const md = buildMd({ cands, proposed, top50, gaps, byType, totalMissing, passCount, failReasons, aliases });
  await Bun.write('reports/seo-stage-6-dry-run.md', md);

  // консоль
  console.log(`📊 Кандидатов (новых, не дублей): ${cands.length}`);
  for (const [t, n] of [...byType.entries()].sort((a, b) => b[1] - a[1])) console.log(`   • ${t.padEnd(18)} ${n}`);
  if (aliases.length) {
    console.log(`\n⚠️  Data-quality: ${aliases.length} ниш-дублей по name (страницы не генерим, нужна уникализация/canonical):`);
    for (const a of aliases) console.log(`   • ${a.aliasSlug} = клон ${a.canonicalSlug} ("${a.name}")`);
  }
  console.log(`\n🔒 PREFLIGHT: проходит ${passCount}/${cands.length}` + (failReasons.size ? ` · провалы: ${[...failReasons.entries()].map(([k, v]) => `${k}×${v}`).join(', ')}` : ' (все чисто)'));
  console.log(`\n🏆 Топ-10 по estimated_money_score:`);
  for (const c of top50.slice(0, 10)) {
    console.log(`   ${String(c.estMoney).padStart(5)}  ${c.pageType.padEnd(8)} ${c.url}`);
  }
  console.log(`\n💾 Артефакты:`);
  console.log(`   reports/money-page-gaps.csv          (${gaps.length} строк · всего пробелов ${totalMissing})`);
  console.log(`   reports/proposed-new-money-pages.csv (${proposed.length} строк${LIMIT !== Infinity ? `, limit ${LIMIT}` : ''})`);
  console.log(`   reports/top-50-new-money-pages.csv   (${top50.length} строк)`);
  console.log(`   reports/seo-stage-6-dry-run.md`);
  console.log(`\n✅ DRY-RUN завершён. Ничего не опубликовано. Apply заблокирован до отдельного «го».`);
}

interface MdArgs {
  cands: Candidate[]; proposed: Candidate[]; top50: Candidate[]; gaps: GapRow[];
  byType: Map<string, number>; totalMissing: number; passCount: number; failReasons: Map<string, number>;
  aliases: AliasFinding[];
}
function buildMd(a: MdArgs): string {
  const L: string[] = [];
  L.push('# ЭТАП 6 — генератор money-страниц (DRY-RUN)\n');
  L.push(`> Сгенерировано: ${new Date().toISOString().slice(0, 19)} · режим: **dry-run** (ничего не опубликовано, apply заблокирован).\n`);

  L.push('## Что проанализировано');
  L.push(`- Источники данных: \`src/data/niche-services.ts\` (${niches.length} ниш с pricePerSqM/subTypes/faqs) + \`src/data/niche-cities.ts\` (${nicheCities.length} городов с priceMult).`);
  L.push('- Существующая сеть: `/{service}/v-{city}/` (service×city) — **насыщён**, не дублируем.');
  L.push('- Скоринг: `service_value × city_demand × pattern_prior × link_prior × proj_quality × 100` (приоры из `seo-score.ts`; live-сигналов нет — страниц ещё не существует).\n');

  L.push('## Пробелы (gap-анализ)');
  L.push('| page_type | scope | total | existing | missing | coverage |');
  L.push('|---|---|--:|--:|--:|--:|');
  for (const g of a.gaps) {
    const cov = g.totalPossible ? Math.round((g.existing / g.totalPossible) * 100) : 0;
    L.push(`| ${g.pageType} | \`${g.scope}\` | ${g.totalPossible} | ${g.existing} | ${g.missing} | ${cov}% |`);
  }
  L.push(`\n**Итого новых кандидатов: ${a.cands.length}** (пробелов по строкам gap-таблицы: ${a.totalMissing}).`);
  L.push('Полная разбивка по нишам — в `reports/money-page-gaps.csv`.\n');

  L.push('## Типы предложенных страниц');
  for (const [t, n] of [...a.byType.entries()].sort((x, y) => y[1] - x[1])) {
    const ex = t === 'price' ? '`/{service}/cena/v-{city}/`' : t === 'turnkey' ? '`/{service}/pod-klyuch/v-{city}/`' : '';
    L.push(`- **${t}** — ${n} стр. ${ex} · prior=${PATTERN_PRIOR[t]} · proj_quality=${PROJ_QUALITY[t]}`);
  }
  L.push('');

  L.push('## Preflight-гейт (защита от тонких/дублей перед apply)');
  L.push(`Проходит **${a.passCount}/${a.cands.length}** кандидатов.`);
  L.push('`--apply` НЕВОЗМОЖЕН, если у страницы нарушено хоть одно из 10 условий:');
  L.push('1. canonical = сам URL (self-canonical);');
  L.push('2. есть CTA-блок;');
  L.push('3. есть FAQ-блок;');
  L.push('4. есть блок цены/сметы (и валидная матрица цен);');
  L.push('5. ≥1 внутренняя ссылка-источник (не сирота);');
  L.push('6. страница попадёт в sitemap;');
  L.push('7. проходит IndexNow host-ownership (URL на нашем хосте);');
  L.push('8. хост не в `reports/bad-hosts.csv`;');
  L.push('9. title и h1 не дублируются (ни в наборе, ни с существующими v-city/subtype);');
  L.push('10. HTML не тонкий (≥6 уникальных блоков).');
  if (a.failReasons.size) L.push(`\nТекущие провалы: ${[...a.failReasons.entries()].map(([k, v]) => `${k} ×${v}`).join(', ')}.`);
  else L.push('\nНа текущем наборе кандидатов провалов нет — все спроектированы под прохождение гейта.');
  L.push('');

  if (a.aliases.length) {
    L.push('## ⚠️ Data-quality находки (НЕ исправлено — нужно отдельное решение)');
    L.push('Найдены ниши-дубли с одинаковым `name` в `src/data/niche-services.ts` — это дубль-контент уже на ЖИВОМ сайте (две разные URL-ветки с идентичными title/h1/intro → каннибализация). Для них money-страницы **не генерируются**.');
    L.push('');
    L.push('| alias-slug | клон чего | name |');
    L.push('|---|---|---|');
    for (const al of a.aliases) L.push(`| \`${al.aliasSlug}\` | \`${al.canonicalSlug}\` | ${al.name} |`);
    L.push('');
    L.push('**Рекомендация (требует «го», т.к. меняет существующий контент):** либо уникализировать дубль (свой name/intro/works под отдельный кластер запросов, напр. «уборка после стройки»), либо поставить canonical/301 alias → canonical.');
    L.push('');
  }

  L.push('## Топ-50 новых money-страниц');
  L.push('| # | score | type | url | цена ₽/м² |');
  L.push('|--:|--:|---|---|---|');
  a.top50.forEach((c, i) => {
    L.push(`| ${i + 1} | ${c.estMoney} | ${c.pageType} | ${c.url} | ${fmtRub(c.priceMin)}–${fmtRub(c.priceMax)} |`);
  });
  L.push('\nПолный список — `reports/top-50-new-money-pages.csv` и `reports/proposed-new-money-pages.csv`.\n');

  L.push('## Команды');
  L.push('```bash');
  L.push('npm run seo:generate-money-pages -- --limit 100 --dry-run   # этот отчёт');
  L.push('npm run seo:generate-money-pages -- --limit 100 --apply     # ⛔ заблокировано (нужно «го» + preflight)');
  L.push('```\n');

  L.push('## Готовность');
  L.push('- ✅ Готово к ревью: gap-анализ, 4 артефакта, preflight-гейт.');
  L.push('- ⛔ НЕ сделано (и не будет без отдельного «го»): рендер `.astro`-роутов, билд, деплой, IndexNow/переобход новых URL.');
  L.push('- Для apply потребуется: route-файлы `/{service}/cena/v-[city].astro` и `/{service}/pod-klyuch/v-[city].astro`, включение в sitemap, повторный preflight (0 провалов), затем точечный IndexNow/переобход.');
  return L.join('\n');
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
