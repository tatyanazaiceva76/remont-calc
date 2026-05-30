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
 * IndexNow (Яндекс) — на все money-URL валидного хоста (≤1000).
 * Переобход Я.Вебмастера — топ money-URL хоста в пределах квоты 150/хост/день.
 *
 * Запуск:
 *   set -a && source .env.local && set +a && bun scripts/recrawl-money-pages.ts --dry-run
 *   set -a && source .env.local && set +a && bun scripts/recrawl-money-pages.ts
 *   ... --csv reports/top-money-pages.csv  --no-recrawl  --limit 300
 */

const TOKEN = process.env.YANDEX_OAUTH_TOKEN!;
const USER = process.env.YANDEX_WEBMASTER_USER_ID!;
const KEY = process.env.INDEXNOW_KEY!;

const RECRAWL_PER_HOST = 150;   // дневная квота Яндекса на хост
const INDEXNOW_PER_HOST = 1000; // безопасный батч на пинг

const args = process.argv.slice(2);
let csvPath = 'reports/top-money-pages.csv';
let doRecrawl = true;
let dryRun = false;
let limit = Infinity;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--csv') csvPath = args[++i];
  else if (args[i] === '--no-recrawl') doRecrawl = false;
  else if (args[i] === '--dry-run') dryRun = true;
  else if (args[i] === '--limit') limit = parseInt(args[++i], 10) || Infinity;
}

if (!dryRun && (!TOKEN || !USER || !KEY)) {
  console.error('❌ Нет env: YANDEX_OAUTH_TOKEN / YANDEX_WEBMASTER_USER_ID / INDEXNOW_KEY (нужны для live-режима; для --dry-run не обязательны)');
  process.exit(1);
}

async function ya(method: string, path: string, body?: unknown) {
  const r = await fetch(`https://api.webmaster.yandex.net/v4${path}`, {
    method, headers: { Authorization: `OAuth ${TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const t = await r.text();
  try { return { status: r.status, ...JSON.parse(t) }; } catch { return { status: r.status, raw: t }; }
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
  const r = await fetch('https://yandex.com/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key: KEY, keyLocation: `https://${host}/indexnow_${KEY}.txt`, urlList: urls }),
  });
  return r.status;
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
  const urls = csv.split('\n').slice(1)
    .map((l) => l.split(',')[0].trim())
    .filter((u) => /^https?:\/\//.test(u))
    .slice(0, limit);

  // 2) группировка по хосту с сохранением порядка (= приоритет money_score)
  const byHost = new Map<string, string[]>();
  for (const u of urls) {
    const h = hostOf(u);
    if (!h) continue;
    (byHost.get(h) ?? byHost.set(h, []).get(h)!).push(u);
  }

  const excluded = await loadExcluded();
  // getHosts() — read-only GET, безопасен и в dry-run: даёт честный прогноз,
  // какие хосты реально поддержат переобход (есть в Вебмастере).
  const hostIds = (TOKEN && USER) ? await getHosts() : new Map<string, string>();
  const webmasterKnown = hostIds.size > 0;

  console.log(`💰 ТОП money-страницы → поисковики · URL: ${urls.length} · хостов: ${byHost.size}${excluded.size ? ` · в exclude-листе ${excluded.size}` : ''}${dryRun ? ' · РЕЖИМ DRY-RUN' : ''}\n`);

  const log: LogRow[] = [];
  const ts = () => new Date().toISOString().slice(0, 19);
  let totalIndexNow = 0, totalRecrawl = 0, skipped = 0;

  for (const [host, hUrls] of [...byHost.entries()].sort((a, b) => b[1].length - a[1].length)) {
    if (excluded.has(host)) {
      skipped++;
      log.push({ ts: ts(), host, action: 'skip', urls: hUrls.length, result: 'excluded (bad-hosts.csv)' });
      console.log(`  ${host.padEnd(34)} — SKIP (дубль-призрак, bad-hosts.csv)`);
      continue;
    }
    const hostId = hostIds.get(host);

    if (dryRun) {
      const rcPlan = !doRecrawl ? '0 (--no-recrawl)'
        : !webmasterKnown ? '? (нет creds — Вебмастер не проверен)'
        : hostId ? String(Math.min(hUrls.length, RECRAWL_PER_HOST))
        : '0 (хост не в Вебмастере → только IndexNow)';
      console.log(`  ${host.padEnd(34)} IndexNow ${Math.min(hUrls.length, INDEXNOW_PER_HOST)} · recrawl ${rcPlan}`);
      continue;
    }

    const inStatus = await indexNow(host, hUrls.slice(0, INDEXNOW_PER_HOST));
    const inOk = inStatus === 200 || inStatus === 202;
    if (inOk) totalIndexNow += Math.min(hUrls.length, INDEXNOW_PER_HOST);
    log.push({ ts: ts(), host, action: 'indexnow', urls: hUrls.length, result: `HTTP ${inStatus}` });

    let rcStr = '—';
    if (doRecrawl && hostId) {
      const rc = await recrawl(hostId, hUrls);
      totalRecrawl += rc.ok;
      const qStr = rc.exhausted ? 'квота на сегодня исчерпана' : rc.quota >= 0 ? `quota ${rc.quota}` : 'quota n/a';
      rcStr = `${rc.ok} (${qStr}${rc.blocked ? `, blocked ${rc.blocked}` : ''})`;
      const res = rc.exhausted ? `quota_exhausted_today (ok=${rc.ok})` : `quota_left=${rc.quota}${rc.blocked ? ` blocked=${rc.blocked}` : ''}`;
      log.push({ ts: ts(), host, action: 'recrawl', urls: rc.ok, result: res });
    } else if (doRecrawl && !hostId) {
      log.push({ ts: ts(), host, action: 'recrawl', urls: 0, result: 'host not in Webmaster' });
      rcStr = '0 (нет в Вебмастере)';
    }

    console.log(`  ${host.padEnd(34)} IndexNow[${inStatus}] ${hUrls.length} · recrawl ${rcStr}`);
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

  console.log(`\n📊 ИТОГ: IndexNow ${totalIndexNow} URL · переобход ${totalRecrawl} URL · хостов ${byHost.size - skipped}/${byHost.size} (skip ${skipped})`);
  console.log(`💾 Лог: ${path}`);
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
