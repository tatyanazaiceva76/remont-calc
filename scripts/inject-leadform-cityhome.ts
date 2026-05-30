#!/usr/bin/env bun
/**
 * inject-leadform-cityhome.ts — добавляет LeadForm на ГЛАВНУЮ (index.astro)
 * city-субдоменов «Группы A»: у них форма УЖЕ есть на district-страницах
 * (через ~/components/LeadForm.astro), но НЕТ на главной.
 *
 * Форма постит на центральный https://www.kalkremont.ru/api/lead (CORS *, D1+TG),
 * поэтому субдомену НЕ нужен свой бэкенд. context помечает лид как пришедший
 * с главной города (видно в Telegram-заявке).
 *
 * Вставка ТОЛЬКО в index.astro (НЕ в Base.astro) — иначе форма задвоится на
 * district-страницах, где она уже стоит.
 *
 * Идемпотентно: если LeadForm уже в index.astro — пропуск. Если нет компонента
 * (Группа B) — пропуск с пометкой (их закрываем отдельно через Base.astro).
 *
 *   bun scripts/inject-leadform-cityhome.ts                 # дефолт: Группа A
 *   bun scripts/inject-leadform-cityhome.ts moskva spb      # только указанные
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// Группа A: есть компонент LeadForm.astro + форма на district, нет на главной.
const GROUP_A = [
  'brn', 'chel', 'ekb', 'krd', 'kzn', 'moskva', 'nn', 'nsk',
  'perm', 'rnd', 'sam', 'spb', 'tyumen', 'ufa', 'vlg', 'vrn',
];

const BASE_IMPORT = "import Base from '~/layouts/Base.astro';";
const LEADFORM_IMPORT = "import LeadForm from '~/components/LeadForm.astro';";
// markup попадает в .astro как есть: backtick + ${...} там трактуются Astro как JS-шаблон
const FORM = "  <LeadForm context={`Главная — ремонт квартир, ${SITE_CONFIG.cityName}`} />";

function main() {
  const apps = process.argv.slice(2).length ? process.argv.slice(2) : GROUP_A;
  let injected = 0, skipped = 0, failed = 0;
  for (const app of apps) {
    const idxPath = join('apps', app, 'src/pages/index.astro');
    const compPath = join('apps', app, 'src/components/LeadForm.astro');
    if (!existsSync(idxPath)) { console.log(`  ⏭  ${app}: нет index.astro`); skipped++; continue; }
    if (!existsSync(compPath)) { console.log(`  ⚠  ${app}: нет LeadForm.astro (Группа B) — пропуск`); failed++; continue; }

    let src = readFileSync(idxPath, 'utf8');
    if (src.includes('LeadForm')) { console.log(`  ✓  ${app}: уже есть`); skipped++; continue; }
    if (!src.includes(BASE_IMPORT)) { console.log(`  ⚠  ${app}: нет Base-import — пропуск`); failed++; continue; }
    if (!src.includes('</Base>')) { console.log(`  ⚠  ${app}: нет </Base> — пропуск`); failed++; continue; }
    if (!src.includes('SITE_CONFIG')) { console.log(`  ⚠  ${app}: нет SITE_CONFIG в scope — пропуск`); failed++; continue; }

    // 1. import LeadForm после import Base
    src = src.replace(BASE_IMPORT, `${BASE_IMPORT}\n${LEADFORM_IMPORT}`);
    // 2. форма перед </Base> (единственное вхождение)
    src = src.replace('</Base>', `${FORM}\n</Base>`);

    writeFileSync(idxPath, src);
    console.log(`  ➕ ${app}: LeadForm добавлен на главную`);
    injected++;
  }
  console.log(`\n✅ Встроено: ${injected} · пропущено: ${skipped} · требует внимания: ${failed}`);
  if (injected) console.log(`Дальше: собрать+задеплоить → bash scripts/deploy-all-apps.sh ${apps.join(' ')}`);
}

main();
