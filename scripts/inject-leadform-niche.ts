#!/usr/bin/env bun
/**
 * inject-leadform-niche.ts — встраивает центральную лид-форму (LeadFormApi.astro)
 * в нишевые субдомены kalkremont.ru, у которых её нет.
 *
 * Лид-форма постит на https://www.kalkremont.ru/api/lead (CORS *, D1 + Telegram),
 * поэтому субдомену НЕ нужен свой бэкенд. Форма ставится в Base.astro перед </main>,
 * т.е. появляется на КАЖДОЙ странице субдомена. context={title} → в заявке видно,
 * с какой именно страницы пришёл лид.
 *
 * Идемпотентно: если LeadFormApi уже встроен — пропускает.
 * Канонический компонент берётся из apps/dizayn/src/components/LeadFormApi.astro.
 *
 *   bun scripts/inject-leadform-niche.ts                  # дефолтный список ниш
 *   bun scripts/inject-leadform-niche.ts balkony fasad    # только указанные
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DEFAULT_APPS = [
  'balkony', 'fasad', 'kondicioner', 'okna', 'potolki', 'santehnika',
  'demontazh', 'dveri', 'elektro', 'kuhni', 'styazhka', 'uborka', 'vannye',
];

const CANON = 'apps/dizayn/src/components/LeadFormApi.astro';
const MARKER = '<main class="ctr"><slot /></main>';
const IMPORT_AFTER = "import { SITE_CONFIG } from '~/config';";
const IMPORT_LINE = "import LeadFormApi from '~/components/LeadFormApi.astro';";

function main() {
  const apps = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_APPS;
  if (!existsSync(CANON)) { console.error(`❌ Нет канонического компонента ${CANON}`); process.exit(1); }
  const component = readFileSync(CANON, 'utf8');

  let injected = 0, skipped = 0, failed = 0;
  for (const app of apps) {
    const root = join('apps', app);
    const basePath = join(root, 'src/layouts/Base.astro');
    const compPath = join(root, 'src/components/LeadFormApi.astro');
    if (!existsSync(basePath)) { console.log(`  ⏭  ${app}: нет Base.astro`); skipped++; continue; }

    let base = readFileSync(basePath, 'utf8');
    if (base.includes('LeadFormApi')) { console.log(`  ✓  ${app}: уже встроено`); skipped++; continue; }
    if (!base.includes(MARKER)) { console.log(`  ⚠  ${app}: маркер <main> не найден — пропуск (нужна ручная вставка)`); failed++; continue; }

    // 1. компонент
    writeFileSync(compPath, component);

    // 2. import
    if (!base.includes(IMPORT_LINE)) {
      base = base.replace(IMPORT_AFTER, `${IMPORT_AFTER}\n${IMPORT_LINE}`);
    }
    // 3. вставка формы перед </main>
    base = base.replace(MARKER, `<main class="ctr">\n      <slot />\n      <LeadFormApi context={title} />\n    </main>`);

    writeFileSync(basePath, base);
    console.log(`  ➕ ${app}: LeadFormApi встроен (компонент + Base.astro)`);
    injected++;
  }

  console.log(`\n✅ Встроено: ${injected} · пропущено: ${skipped} · требует внимания: ${failed}`);
  if (injected) console.log(`Дальше: собрать и задеплоить → bash scripts/deploy-all-apps.sh ${apps.join(' ')}`);
}

main();
