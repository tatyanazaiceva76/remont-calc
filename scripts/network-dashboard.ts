#!/usr/bin/env bun
/**
 * network-dashboard.ts — сводка состояния сети (ШАГ 3/4 оператора).
 *
 * Читает (read-only) reports/network-hosts-inventory.csv + network-indexation-status.csv
 * + последний search-engine-submission-log.csv + последний notify-log-network-recrawl-*.
 * Печатает дашборд и пишет reports/search-engine-coverage-summary.md.
 *
 * Без сети, без токенов — чистый агрегатор уже собранных артефактов.
 *   bun scripts/network-dashboard.ts        (npm run seo:network:dashboard)
 */
import { readFileSync, readdirSync } from 'node:fs';

function csv(path: string): Record<string, string>[] {
  try {
    const lines = readFileSync(path, 'utf8').split('\n').filter(Boolean);
    if (!lines.length) return [];
    const head = splitCsv(lines[0]);
    return lines.slice(1).map((l) => { const c = splitCsv(l); const o: Record<string, string> = {}; head.forEach((h, i) => (o[h] = c[i] ?? '')); return o; });
  } catch { return []; }
}
function splitCsv(line: string): string[] {
  const out: string[] = []; let f = '', q = false;
  for (let i = 0; i < line.length; i++) { const c = line[i];
    if (q) { if (c === '"') { if (line[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else { if (c === '"') q = true; else if (c === ',') { out.push(f); f = ''; } else f += c; } }
  out.push(f); return out;
}
function latest(prefix: string): string | null {
  try { const f = readdirSync('reports').filter((n) => n.startsWith(prefix)).sort(); return f.length ? `reports/${f[f.length - 1]}` : null; } catch { return null; }
}
const n = (s: string) => parseInt(s, 10) || 0;

function main() {
  const inv = csv('reports/network-hosts-inventory.csv');
  if (!inv.length) { console.error('❌ Нет reports/network-hosts-inventory.csv — запусти npm run seo:network:audit'); process.exit(1); }
  const good = inv.filter((r) => r.is_valid_host === 'true');
  const bad = inv.filter((r) => r.is_bad_host === 'true');

  const idx = csv('reports/network-indexation-status.csv');
  const totIn = idx.reduce((s, r) => s + n(r.in_search_yandex), 0);
  const totSm = good.reduce((s, r) => s + n(r.indexable_url_count), 0);
  const totExcl = idx.reduce((s, r) => s + n(r.excluded_yandex), 0);
  const live = idx.filter((r) => n(r.in_search_yandex) > 0).length;

  const noForms = good.filter((r) => r.lead_forms_present === 'no');
  const noMonet = good.filter((r) => r.monetization_slots_present === 'no');

  // submission log
  const subLog = csv('reports/search-engine-submission-log.csv');
  const byEngine: Record<string, { acc: number; rej: number }> = {};
  for (const r of subLog) { const e = r.engine || '?'; byEngine[e] ??= { acc: 0, rej: 0 }; if (/accept/.test(r.result)) byEngine[e].acc++; else byEngine[e].rej++; }

  const rcPath = latest('notify-log-network-recrawl-');
  const rc = rcPath ? csv(rcPath) : [];
  const rcOk = rc.reduce((s, r) => s + n(r.ok), 0);
  const rcExhausted = rc.filter((r) => /exhausted/.test(r.result)).length;

  const top = [...good].sort((a, b) => n(b.priority_score) - n(a.priority_score)).slice(0, 15);

  // ── консоль ──
  console.log(`\n🌐 NETWORK DASHBOARD\n${'═'.repeat(64)}`);
  console.log(`Хостов: ${inv.length}  ·  GOOD ${good.length}  ·  BAD ${bad.length}`);
  console.log(`Indexable URL (GOOD ∑): ${totSm}  ·  в поиске Яндекса: ${totIn}  ·  исключено: ${totExcl}`);
  console.log(`Покрытие индексацией: ${totSm ? ((totIn / totSm) * 100).toFixed(1) : '0'}%  ·  живых хостов (>0 в поиске): ${live}/${good.length}`);
  console.log(`Конверсия-готовность: без lead-форм ${noForms.length}/${good.length}  ·  без монетизации ${noMonet.length}/${good.length}`);
  console.log(`\nIndexNow (накоплено в логе): ${Object.entries(byEngine).map(([e, v]) => `${e} ${v.acc}✓/${v.rej}✗`).join('  ·  ') || '—'}`);
  console.log(`Последний recrawl: ${rcPath ? `${rcOk} URL · квота исчерпана у ${rcExhausted} хостов` : '—'}`);
  console.log(`\n🔝 ТОП-15 по priority_score:`);
  for (const r of top) console.log(`   ${String(r.priority_score).padStart(4)}  ${r.host.padEnd(34)} idx ${String(r.indexable_url_count).padStart(5)} · forms ${r.lead_forms_present} · monet ${r.monetization_slots_present}`);

  // ── markdown ──
  const md = `# Search Engine Coverage Summary

_Сгенерировано ${new Date().toISOString().slice(0, 19)} из network-inventory + логов отправки._

## Сеть
- Хостов: **${inv.length}** (GOOD **${good.length}**, BAD-призраки **${bad.length}**)
- Indexable URL на GOOD-хостах (∑): **${totSm}**
- В поиске Яндекса (∑): **${totIn}** → покрытие **${totSm ? ((totIn / totSm) * 100).toFixed(1) : '0'}%**
- Исключено Яндексом (∑): **${totExcl}**
- Живых хостов (>0 в поиске): **${live}/${good.length}**

## Готовность к деньгам
- GOOD-хостов **без lead-форм**: **${noForms.length}/${good.length}** — основная утечка конверсии
- GOOD-хостов **без монетизации**: **${noMonet.length}/${good.length}**

## Отправка в поисковики (накоплено)
${Object.entries(byEngine).map(([e, v]) => `- **${e}**: accepted ${v.acc}, rejected ${v.rej}`).join('\n') || '- нет данных'}
- Последний recrawl: ${rcPath ? `**${rcOk}** URL поставлено, квота исчерпана у **${rcExhausted}** хостов` : '—'}

## ТОП-15 хостов по priority_score
| priority | host | indexable | in_search | forms | monet | next |
|---:|---|---:|---:|:--:|:--:|---|
${top.map((r) => `| ${r.priority_score} | ${r.host} | ${r.indexable_url_count} | ${(idx.find((x) => x.host === r.host)?.in_search_yandex) ?? '?'} | ${r.lead_forms_present} | ${r.monetization_slots_present} | ${noForms.includes(r) ? 'add CTA/form' : 'push index / expand'} |`).join('\n')}

## Главные рычаги
1. **Индексация флагмана**: www.kalkremont.ru — основной объём indexable, покрытие низкое → IndexNow+recrawl+внутренние ссылки.
2. **Конверсия сабдоменов**: ${noForms.length} GOOD-хостов без форм — добавить единый lead-CTA (ШАГ 7).
3. **Монетизация**: ${noMonet.length} хостов без слотов — включить через config/feature-flags (ШАГ 8).
`;
  Bun.write('reports/search-engine-coverage-summary.md', md);
  console.log(`\n💾 reports/search-engine-coverage-summary.md обновлён.`);
}

main();
