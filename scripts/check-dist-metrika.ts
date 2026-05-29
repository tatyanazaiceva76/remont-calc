#!/usr/bin/env bun
/**
 * check-dist-metrika.ts — build guard (ЭТАП 1.5).
 *
 * Падает (exit 1), если в собранном dist/ остался "голый" вызов ym(99000000…)
 * — это заглушка-плейсхолдер, из-за которой цели/визиты уходили в несуществующий
 * счётчик вместо реального (window.__YM_ID__). Допустимая форма — только
 * защищённая: ym((window.__YM_ID__||99000000), …), где 99000000 это fallback.
 *
 * Запуск:
 *   bun scripts/check-dist-metrika.ts            # проверяет ./dist
 *   bun scripts/check-dist-metrika.ts dist apps/*\/dist
 *
 * Подключён как postbuild-хук в package.json → `bun run build` упадёт,
 * если плейсхолдер попал в сборку. Также вызывается отдельным шагом в CI.
 */
import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// "Голый" плохой вызов: ym( сразу за которым 99000000.
// Защищённая форма ym((window.__YM_ID__||99000000) НЕ матчится, т.к. после ym( идёт "(".
const BAD = /ym\(\s*99000000/g;
const SCAN_EXT = ['.html', '.js', '.mjs', '.cjs'];

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try { entries = readdirSync(dir); } catch { return out; }
  for (const name of entries) {
    const p = join(dir, name);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, out);
    else if (SCAN_EXT.some((e) => name.endsWith(e))) out.push(p);
  }
  return out;
}

const dirs = process.argv.slice(2).length ? process.argv.slice(2) : ['dist'];
const offenders: Array<{ file: string; count: number; sample: string }> = [];
let scanned = 0;

for (const dir of dirs) {
  if (!existsSync(dir)) { console.error(`⚠️  Каталог не найден, пропуск: ${dir}`); continue; }
  for (const file of walk(dir)) {
    scanned++;
    const txt = readFileSync(file, 'utf8');
    const m = txt.match(BAD);
    if (m) {
      const idx = txt.search(BAD);
      offenders.push({ file, count: m.length, sample: txt.slice(Math.max(0, idx - 20), idx + 40).replace(/\s+/g, ' ') });
    }
  }
}

if (offenders.length) {
  console.error(`\n❌ BUILD GUARD: найден голый ym(99000000) в ${offenders.length} файл(ах) из ${scanned} проверенных:`);
  for (const o of offenders.slice(0, 25)) {
    console.error(`   ${o.file}  ×${o.count}   …${o.sample}…`);
  }
  if (offenders.length > 25) console.error(`   …и ещё ${offenders.length - 25}`);
  console.error(`\n   Цели/визиты Метрики уйдут в несуществующий счётчик. Используйте ym((window.__YM_ID__||99000000), …).`);
  process.exit(1);
}

console.log(`✅ Metrika build guard: голых ym(99000000) нет (проверено ${scanned} файлов в ${dirs.join(', ')}).`);
