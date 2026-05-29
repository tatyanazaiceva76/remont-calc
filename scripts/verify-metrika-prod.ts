#!/usr/bin/env bun
/**
 * verify-metrika-prod.ts — проверка живого прода (ЭТАП 1.4).
 *
 * Для каждого хоста тянет реальные страницы и убеждается, что Яндекс.Метрика
 * настроена правильно:
 *   1) загрузчик tag.js присутствует;
 *   2) есть вызов ym(<id>, "init", …) с числовым счётчиком;
 *   3) счётчик НЕ равен 99000000 (плейсхолдер);
 *   4) выставлен глобал window.__YM_ID__ (на него ссылаются reachGoal-цели);
 *   5) нет ни одного голого ym(99000000…) (цели не текут в мёртвый счётчик);
 *   6) при --expect <id> — счётчик совпадает с ожидаемым.
 *
 * Запуск:
 *   bun scripts/verify-metrika-prod.ts                         # www.kalkremont.ru, expect 109345156
 *   bun scripts/verify-metrika-prod.ts --host vannye.kalkremont.ru --expect 109345156
 *   bun scripts/verify-metrika-prod.ts --host natyazhnoi-master24.ru --expect 109456817
 *   bun scripts/verify-metrika-prod.ts --paths /,/remont-vannoy/,/elektromontazh/
 *
 * Exit code: 0 — всё ок; 1 — хотя бы одна проверка провалена (годится как гейт).
 */

interface Check { name: string; ok: boolean; detail: string }
interface PageResult { url: string; status: number; checks: Check[] }

const args = process.argv.slice(2);
let host = 'www.kalkremont.ru';
let expect = '';
let paths = ['/'];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--host') host = args[++i];
  else if (args[i] === '--expect') expect = args[++i];
  else if (args[i] === '--paths') paths = args[++i].split(',').map((p) => p.trim()).filter(Boolean);
}
// flagship по умолчанию ждёт 109345156, если --expect не задан явно
if (!expect && host === 'www.kalkremont.ru') expect = '109345156';

const BAD = /ym\(\s*99000000/;                       // голый плейсхолдер
const INIT = /ym\(\s*([0-9]{6,})\s*,\s*["']init["']/; // ym(<id>, "init"
const INIT_VAR = /ym\(\s*id\s*,\s*["']init["']/;      // ym(id, "init") — счётчик в define:vars

async function checkPage(url: string): Promise<PageResult> {
  const checks: Check[] = [];
  let status = 0;
  let html = '';
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'kalkremont-metrika-verify', 'Cache-Control': 'no-cache' } });
    status = r.status;
    html = await r.text();
  } catch (e) {
    return { url, status: 0, checks: [{ name: 'fetch', ok: false, detail: String(e) }] };
  }

  const ok2 = (name: string, ok: boolean, detail = '') => checks.push({ name, ok, detail });

  ok2('http 200', status === 200, `HTTP ${status}`);
  ok2('tag.js loader', html.includes('mc.yandex.ru/metrika/tag.js'), '');

  // Счётчик ищем по нескольким формам сериализации:
  //   ym(109345156,"init")                  — литерал прямо в init
  //   (function(){const id = "109345156";   — Astro define:vars (ym(id,"init"))
  //   window.__YM_ID__ = "109345156"        — глобал литералом
  //   <img src=".../watch/109345156">        — noscript-пиксель (последний фоллбэк)
  let counter = '';
  const sources: RegExp[] = [
    INIT,                                                   // ym(<id>,"init")
    /\b(?:const|let|var)\s+id\s*=\s*["']?([0-9]{6,})/,       // define:vars: const id = "..."
    /__YM_ID__\s*=\s*["']?([0-9]{6,})/,                     // window.__YM_ID__ = <num>
    /mc\.yandex\.ru\/watch\/([0-9]{6,})/,                   // noscript watch-пиксель
  ];
  for (const re of sources) { const m = html.match(re); if (m) { counter = m[1]; break; } }
  const hasInit = INIT.test(html) || INIT_VAR.test(html);
  ok2('ym init present', hasInit, INIT.test(html) ? `ym(${counter},"init")` : (INIT_VAR.test(html) ? 'ym(id,"init")' : 'НЕ НАЙДЕН'));
  ok2('counter resolved', !!counter, counter ? `counter=${counter}` : 'счётчик не извлечён');
  ok2('counter != 99000000', counter !== '99000000' && !!counter, counter === '99000000' ? 'ПЛЕЙСХОЛДЕР!' : `counter=${counter}`);
  ok2('window.__YM_ID__ set', html.includes('__YM_ID__'), '');

  const bare = (html.match(/ym\(\s*99000000/g) || []).length;
  ok2('no bare ym(99000000)', !BAD.test(html), bare ? `найдено ${bare}` : 'чисто');

  if (expect) ok2(`counter == ${expect}`, counter === expect, `получено ${counter || '∅'}`);

  return { url, status, checks };
}

async function main() {
  const urls = paths.map((p) => `https://${host}${p.startsWith('/') ? p : '/' + p}`);
  console.log(`🔎 Проверка Метрики на проде · host=${host}${expect ? ` · expect=${expect}` : ''}\n`);

  const results: PageResult[] = [];
  for (const u of urls) results.push(await checkPage(u));

  let failed = 0;
  for (const r of results) {
    console.log(`  ${r.url}`);
    for (const c of r.checks) {
      const mark = c.ok ? '✅' : '❌';
      if (!c.ok) failed++;
      console.log(`     ${mark} ${c.name}${c.detail ? `  — ${c.detail}` : ''}`);
    }
    console.log('');
  }

  if (failed) {
    console.error(`❌ Проверок провалено: ${failed}. Метрика на ${host} настроена неверно.`);
    process.exit(1);
  }
  console.log(`✅ Метрика на ${host} в порядке: счётчик живой, целевой и без плейсхолдеров.`);
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
