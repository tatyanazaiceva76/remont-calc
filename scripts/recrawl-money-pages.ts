#!/usr/bin/env bun
/**
 * recrawl-money-pages.ts — ЭТАП 5 финишер: уведомить поисковики о ТОП money-страницах.
 *
 * Зачем: деплой шёл напрямую через wrangler (минуя GH Action), поэтому
 * авто-пинг IndexNow после деплоя НЕ сработал. Этот скрипт точечно уведомляет
 * поисковики об усиленных коммерческих страницах из reports/top-money-pages.csv.
 *
 * Источник: reports/top-money-pages.csv (уже отсортирован по money_score ↓ —
 * значит порядок в файле = приоритет; первые N на хост попадают в переобход).
 *
 * Безопасность (как в notify-indexnow-recrawl.ts):
 *   1) хосты-дубли из reports/bad-hosts.csv пропускаются (их IndexNow всегда 422);
 *   2) для каждого хоста шлём только URL, принадлежащие именно ему (hostOf === host).
 *
 * IndexNow (Яндекс) — на ВСЕ money-URL валидного хоста (канал безлимитный, шлём
 *   батчами по INDEXNOW_PER_HOST; не ограничен окном ротации --limit/--rotate).
 * Переобход Я.Вебмастера — топ money-URL хоста в пределах квоты 150/хост/день
 *   (вот ЭТО окно и ротируется курсором, т.к. квота переобхода дефицитна).
 *
 * Запуск:
 *   set -a && source .env.local && set +a && bun scripts/recrawl-money-pages.ts --dry-run
 *   set -a && source .env.local && set +a && bun scripts/recrawl-money-pages.ts
 *   ... --csv reports/top-money-pages.csv  --no-recrawl  --limit 300
 */
import { readFileSync, writeFileSync } from 'node:fs';

const TOKEN = process.env.YANDEX_OAUTH_TOKEN!;
const USER = process.env.YANDEX_WEBMASTER_USER_ID!;
const KEY = process.env.INDEXNOW_KEY!;

const RECRAWL_PER_HOST = 150;   // дневная квота Яндекса на хост
const INDEXNOW_PER_HOST = 1000; // безопасный батч на пинг

// Ротация окна переобхода: квота 150/хост/день не позволяет за раз покрыть все
// 1280 money-URL. Чтобы крон не долбил один и тот же топ, а ПРОГРЕССИВНО обходил
// весь список (за ~⌈total/150⌉ дней), курсор хранит индекс следующего окна.
const CURSOR_PATH = 'reports/recrawl-money-cursor.txt';
function readCursor(total: number): number {
  try {
    const n = parseInt(readFileSync(CURSOR_PATH, 'utf8').trim(), 10);
    return Number.isFinite(n) && total > 0 ? ((n % total) + total) % total : 0;
  } catch { return 0; }
}
function writeCursor(n: number): void {
  try { writeFileSync(CURSOR_PATH, String(n)); } catch { /* лог-курсор не критичен */ }
}

const args = process.argv.slice(2);
let csvPath = 'reports/top-money-pages.csv';
let doRecrawl = true;
let dryRun = false;
let limit = Infinity;
let offset: number | null = null;  // явный старт окна (перебивает курсор)
let rotate = false;                // взять старт из курсора и продвинуть его
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--csv') csvPath = args[++i];
  else if (args[i] === '--no-recrawl') doRecrawl = false;
  else if (args[i] === '--dry-run') dryRun = true;
  else if (args[i] === '--limit') limit = parseInt(args[++i], 10) || Infinity;
  else if (args[i] === '--offset') offset = parseInt(args[++i], 10) || 0;
  else if (args[i] === '--rotate') rotate = true;
}

if (!dryRun && (!TOKEN || !USER || !KEY)) {
  console.error('❌ Нет env: YANDEX_OAUTH_TOKEN / YANDEX_WEBMASTER_USER_ID / INDEXNOW_KEY (нужны для live-режима; для --dry-run не обязательны)');
  process.exit(1);
}

async function ya(method: string, path: string, body?: unknown) {
  try {
    const r = await fetch(`https://api.webmaster.yandex.net/v4${path}`, {
      method, headers: { Authorization: `OAuth ${TOKEN}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const t = await r.text();
    try { return { status: r.status, ...JSON.parse(t) }; } catch { return { status: r.status, raw: t }; }
  } catch (e) {
    // Транзиентный сбой сети не должен ронять ночной money-проход (см. notify-indexnow-recrawl.ts).
    // status:0 → recrawl() считает вызов «не 202/не 429» → blocked++ и идёт дальше.
    return { status: 0, raw: String(e) };
  }
}

async function getHosts(): Promise<Map<string, string>> {
  const r = await ya('GET', `/user/${USER}/hosts`);
  const m = new Map<string, string>();
  for (const h of ((r as any).hosts || [])) {
    const host = h.ascii_host_url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    m.set(host, h.host_id);
  }
  return m;
}

function hostOf(u: string): string { try { return new URL(u).host; } catch { return ''; } }

async function loadExcluded(): Promise<Set<string>> {
  try {
    const txt = await Bun.file('reports/bad-hosts.csv').text();
    const lines = txt.split('\n').slice(1).filter(Boolean);
    return new Set(lines.map((l) => l.split(',')[0].trim()).filter(Boolean));
  } catch { return new Set(); }
}

async function indexNow(host: string, urls: string[]): Promise<number> {
  if (!urls.length) return 0;
  try {
    const r = await fetch('https://yandex.com/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host, key: KEY, keyLocation: `https://${host}/indexnow_${KEY}.txt`, urlList: urls }),
    });
    return r.status;
  } catch { return 0; } // транзиентный сбой → 0 (не ok), батч пропускаем, не роняем проход
}

async function recrawl(hostId: string, urls: string[]): Promise<{ ok: number; quota: number; blocked: number; exhausted: boolean }> {
  let ok = 0, blocked = 0, quota = -1, exhausted = false; // quota=-1 = ещё неизвестна (узнаём из ответа на 202)
  for (const url of urls.slice(0, RECRAWL_PER_HOST)) {
    const r = await ya('POST', `/user/${USER}/hosts/${hostId}/recrawl/queue`, { url });
    if (r.status === 202) { ok++; quota = (r as any).quota_remainder ?? quota; }
    else if (r.status === 429) { exhausted = true; break; } // дневная квота хоста уже израсходована (часто — суточным cron)
    else blocked++;
    await new Promise((res) => setTimeout(res, 250));
  }
  return { ok, quota, blocked, exhausted };
}

interface LogRow { ts: string; host: string; action: string; urls: number; result: string }

async function main() {
  // 1) URL из money-CSV (поле 0 = url, без запятых; порядок = приоритет по money_score)
  let csv: string;
  try { csv = await Bun.file(csvPath).text(); }
  catch { console.error(`❌ Не найден ${csvPath}`); process.exit(1); }
  const allUrls = csv.split('\n').slice(1)
    .map((l) => l.split(',')[0].trim())
    .filter((u) => /^https?:\/\//.test(u));
  const total = allUrls.length;
  // окно: при ротации/offset берём RECRAWL_PER_HOST подряд начиная со start;
  // без них — поведение как раньше (первые limit, по умолчанию все).
  const win = limit === Infinity ? (rotate || offset !== null ? RECRAWL_PER_HOST : total) : limit;
  let start = 0;
  if (offset !== null) start = total > 0 ? ((offset % total) + total) % total : 0;
  else if (rotate) start = readCursor(total);
  const urls = allUrls.slice(start, start + win);
  const windowEnd = start + urls.length; // эксклюзивная граница окна
  if (rotate || offset !== null) {
    console.log(`🔄 Окно ротации: [${start}..${windowEnd}) из ${total} (money_score ↓)`);
  }

  // 2) Две группировки по хосту (порядок сохраняем = приоритет money_score):
  //    • byHostAll — ВСЕ money-URL хоста → IndexNow (канал безлимитный: шлём всё
  //      батчами; иначе при --limit 150 индекс-пинг получал лишь окно ротации);
  //    • byHost    — только URL окна ротации → переобход Вебмастера (квота 150/хост).
  const group = (list: string[]) => {
    const m = new Map<string, string[]>();
    for (const u of list) { const h = hostOf(u); if (!h) continue; (m.get(h) ?? m.set(h, []).get(h)!).push(u); }
    return m;
  };
  const byHostAll = group(allUrls);
  const byHost = group(urls);

  const excluded = await loadExcluded();
  // getHosts() — read-only GET, безопасен и в dry-run: даёт честный прогноз,
  // какие хосты реально поддержат переобход (есть в Вебмастере).
  const hostIds = (TOKEN && USER) ? await getHosts() : new Map<string, string>();
  const webmasterKnown = hostIds.size > 0;

  console.log(`💰 ТОП money-страницы → поисковики · URL: ${urls.length} · хостов: ${byHost.size}${excluded.size ? ` · в exclude-листе ${excluded.size}` : ''}${dryRun ? ' · РЕЖИМ DRY-RUN' : ''}\n`);

  const log: LogRow[] = [];
  const ts = () => new Date().toISOString().slice(0, 19);
  let totalIndexNow = 0, totalRecrawl = 0, skipped = 0;

  for (const [host, allHostUrls] of [...byHostAll.entries()].sort((a, b) => b[1].length - a[1].length)) {
    if (excluded.has(host)) {
      skipped++;
      log.push({ ts: ts(), host, action: 'skip', urls: allHostUrls.length, result: 'excluded (bad-hosts.csv)' });
      console.log(`  ${host.padEnd(34)} — SKIP (дубль-призрак, bad-hosts.csv)`);
      continue;
    }
    const hostId = hostIds.get(host);
    const winHostUrls = byHost.get(host) ?? []; // окно ротации этого хоста → только переобход

    if (dryRun) {
      const rcPlan = !doRecrawl ? '0 (--no-recrawl)'
        : !webmasterKnown ? '? (нет creds — Вебмастер не проверен)'
        : hostId ? String(Math.min(winHostUrls.length, RECRAWL_PER_HOST))
        : '0 (хост не в Вебмастере → только IndexNow)';
      console.log(`  ${host.padEnd(34)} IndexNow ${allHostUrls.length} · recrawl ${rcPlan}`);
      continue;
    }

    // IndexNow: ВСЕ money-URL хоста, батчами по INDEXNOW_PER_HOST (канал безлимитный)
    let inSent = 0, inStatus = 0;
    for (let i = 0; i < allHostUrls.length; i += INDEXNOW_PER_HOST) {
      const batch = allHostUrls.slice(i, i + INDEXNOW_PER_HOST);
      inStatus = await indexNow(host, batch);
      if (inStatus === 200 || inStatus === 202) inSent += batch.length;
      if (i + INDEXNOW_PER_HOST < allHostUrls.length) await new Promise((r) => setTimeout(r, 150));
    }
    if (inSent) totalIndexNow += inSent;
    log.push({ ts: ts(), host, action: 'indexnow', urls: inSent, result: `HTTP ${inStatus}` });

    // Переобход: только окно ротации (дефицитная квота 150/хост/сутки)
    let rcStr = '—';
    if (doRecrawl && hostId) {
      const rc = await recrawl(hostId, winHostUrls);
      totalRecrawl += rc.ok;
      const qStr = rc.exhausted ? 'квота на сегодня исчерпана' : rc.quota >= 0 ? `quota ${rc.quota}` : 'quota n/a';
      rcStr = `${rc.ok} (${qStr}${rc.blocked ? `, blocked ${rc.blocked}` : ''})`;
      const res = rc.exhausted ? `quota_exhausted_today (ok=${rc.ok})` : `quota_left=${rc.quota}${rc.blocked ? ` blocked=${rc.blocked}` : ''}`;
      log.push({ ts: ts(), host, action: 'recrawl', urls: rc.ok, result: res });
    } else if (doRecrawl && !hostId) {
      log.push({ ts: ts(), host, action: 'recrawl', urls: 0, result: 'host not in Webmaster' });
      rcStr = '0 (нет в Вебмастере)';
    }

    console.log(`  ${host.padEnd(34)} IndexNow[${inStatus}] ${inSent}/${allHostUrls.length} · recrawl ${rcStr}`);
    await new Promise((r) => setTimeout(r, 120));
  }

  if (dryRun) {
    const willPing = [...byHost.entries()].filter(([h]) => !excluded.has(h));
    console.log(`\n📋 DRY-RUN: пинганём ${willPing.length} хостов, пропустим ${skipped}. Без --dry-run будут реальные вызовы IndexNow + переобход.`);
    return;
  }

  await Bun.$`mkdir -p reports`.quiet();
  const path = `reports/notify-log-money-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.csv`;
  const out = ['ts,host,action,urls,result'].concat(log.map((l) => `${l.ts},${l.host},${l.action},${l.urls},"${l.result}"`)).join('\n');
  await Bun.write(path, out);

  // продвигаем курсор только при --rotate (live) и ТОЛЬКО на число реально
  // переобойдённых URL (totalRecrawl), а НЕ на размер окна — иначе при
  // исчерпанной квоте (recrawl=0) курсор перепрыгнул бы непокрытые страницы.
  // Так курсор честно отслеживает прогресс переобхода (дефицитный ресурс);
  // на конце списка заворачиваемся в 0 → бесконечный прогрессивный обход.
  if (rotate) {
    const next = total > 0 ? (start + totalRecrawl) % total : 0;
    writeCursor(next);
    const moved = totalRecrawl > 0 ? `+${totalRecrawl}` : 'без сдвига (квота 0)';
    console.log(`🔄 Курсор переобхода: ${start} → ${next}/${total} (${moved})`);
  }

  console.log(`\n📊 ИТОГ: IndexNow ${totalIndexNow} URL · переобход ${totalRecrawl} URL · хостов ${byHost.size - skipped}/${byHost.size} (skip ${skipped})`);
  console.log(`💾 Лог: ${path}`);
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
