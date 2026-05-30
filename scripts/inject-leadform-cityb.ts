#!/usr/bin/env bun
/**
 * inject-leadform-cityb.ts — встраивает центральную лид-форму (LeadFormApi.astro)
 * в city-субдомены «Группы B»: у них НЕТ формы НИГДЕ (ни на главной, ни на
 * district/type-страницах — проверено: 0 ссылок на /api/lead во всём src).
 *
 * В отличие от «Группы A» (там форма уже стоит на district через LeadForm.astro,
 * поэтому туда добавляли ТОЛЬКО в index.astro), здесь формы нет совсем — значит
 * безопасно ставить в Base.astro перед концом <main>, и она появится на КАЖДОЙ
 * странице субдомена без риска задвоения.
 *
 * Форма постит на https://www.kalkremont.ru/api/lead (CORS *, D1 + Telegram),
 * поэтому субдомену НЕ нужен свой бэкенд. context={title} → в заявке видно,
 * с какой страницы пришёл лид; host (astr.kalkremont.ru) → виден город.
 *
 * Маркер у Группы B: <main class="container"><slot /></main> (НЕ "ctr", как у ниш).
 * Канонический компонент берётся из apps/dizayn/src/components/LeadFormApi.astro.
 *
 * Идемпотентно: если LeadFormApi уже встроен в Base.astro — пропуск.
 *
 *   bun scripts/inject-leadform-cityb.ts                 # дефолт: Группа B
 *   bun scripts/inject-leadform-cityb.ts astr irk        # только указанные
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// Группа B: city-субдомены без формы нигде (главная + district/type пусты).
const GROUP_B = [
  'astr', 'cbx', 'irk', 'izh', 'kem', 'khv', 'kir', 'kld', 'lpk',
  'oren', 'pnz', 'rzn', 'sar', 'tlt', 'tul', 'vvo', 'yar',
];

const CANON = 'apps/dizayn/src/components/LeadFormApi.astro';
const MARKER = '<main class="container"><slot /></main>';
const IMPORT_AFTER = "import { SITE_CONFIG } from '~/config';";
const IMPORT_LINE = "import LeadFormApi from '~/components/LeadFormApi.astro';";

function main() {
  const apps = process.argv.slice(2).length ? process.argv.slice(2) : GROUP_B;
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
    if (!base.includes(MARKER)) { console.log(`  ⚠  ${app}: маркер <main class="container"> не найден — пропуск`); failed++; continue; }
    if (!base.includes(IMPORT_AFTER)) { console.log(`  ⚠  ${app}: нет import SITE_CONFIG — пропуск`); failed++; continue; }

    // 1. компонент
    writeFileSync(compPath, component);

    // 2. import после import SITE_CONFIG
    if (!base.includes(IMPORT_LINE)) {
      base = base.replace(IMPORT_AFTER, `${IMPORT_AFTER}\n${IMPORT_LINE}`);
    }
    // 3. вставка формы перед </main> (единственное вхождение маркера)
    base = base.replace(MARKER, `<main class="container">\n      <slot />\n      <LeadFormApi context={title} />\n    </main>`);

    writeFileSync(basePath, base);
    console.log(`  ➕ ${app}: LeadFormApi встроен (компонент + Base.astro)`);
    injected++;
  }

  console.log(`\n✅ Встроено: ${injected} · пропущено: ${skipped} · требует внимания: ${failed}`);
  if (injected) console.log(`Дальше: собрать и задеплоить → bash scripts/deploy-all-apps.sh ${apps.join(' ')}`);
}

main();
