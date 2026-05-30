#!/usr/bin/env bun
/**
 * network-indexnow.ts — Network Indexation Engine: IndexNow (ШАГ 3 оператора).
 *
 * Шлёт в IndexNow (Yandex + Bing) ВСЕ валидные URL всех GOOD-хостов сети.
 * IndexNow — единственный безлимитный рычаг индексации (recrawl ограничен
 * 150/хост/день), поэтому это самое масштабное безопасное действие.
 *
 * ЗАЩИТА (ровно по ТЗ ШАГ 3):
 *   • bad-hosts.csv исключаем (дубли-призраки → их IndexNow всегда 422);
 *   • host-ownership: шлём ТОЛЬКО URL, чей хост === текущему хосту
 *     (hostOf(u)===host) — поэтому 422 не возникает в принципе;
 *   • canonical-to-apex сабдомены не шлём как отдельные сайты (они в bad-hosts);
 *   • 4xx логируем как rejected (не fatal), 200/202 — accepted.
 *
 * Лог: reports/search-engine-submission-log.csv (append; ts,engine,host,urls,status,result).
 *
 *   set -a && source .env.local && set +a && bun scripts/network-indexnow.ts --dry-run
 *   set -a && source .env.local && set +a && bun scripts/network-indexnow.ts
 *   ... --limit-per-host 1000   --engines yandex,bing   --only www.kalkremont.ru
 */

const TOKEN = process.env.YANDEX_OAUTH_TOKEN;
const USER = process.env.YANDEX_WEBMASTER_USER_ID;
const KEY = process.env.INDEXNOW_KEY;
if (!TOKEN || !USER) { console.error('❌ Нет env YANDEX_OAUTH_TOKEN / YANDEX_WEBMASTER_USER_ID'); process.exit(1); }

const args = process.argv.slice(2);
const has = (f: string) => args.includes(f);
const val = (f: string, d: string) => { const i = args.indexOf(f); return i >= 0 ? (args[i + 1] ?? d) : d; };
const DRY = has('--dry-run');
const PER_HOST = parseInt(val('--limit-per-host', '50000'), 10) || 50000;
const ONLY = val('--only', '');
const ENGINES = val('--engines', 'yandex,bing').split(',').map((s) => s.trim()).filter(Boolean);
const BATCH = 1000; // URL на один POST (безопасный размер)
const UA = 'Mozilla/5.0 (compatible; NetworkIndexNow/1.0)';
const ENGINE_HOST: Record<string, string> = { yandex: 'yandex.com', bing: 'www.bing.com' };

function hostOf(u: string): string { try { return new URL(u).host; } catch { return ''; } }

async function ya(path: string): Promise<any> {
  const r = await fetch(`https://api.webmaster.yandex.net/v4${path}`, { headers: { Authorization: `OAuth ${TOKEN}` } });
  const t = await r.text(); try { return { _s: r.status, ...JSON.parse(t) }; } catch { return { _s: r.status }; }
}
async function getHosts(): Promise<string[]> {
  const r = await ya(`/user/${USER}/hosts`);
  return ((r.hosts || []) as any[]).map((h) => h.ascii_host_url.replace(/^https?:\/\//, '').replace(/\/$/, ''));
}
async function loadBadHosts(): Promise<Set<string>> {
  try {
    const txt = await Bun.file('reports/bad-hosts.csv').text();
    return new Set(txt.split('\n').slice(1).map((l) => l.split(',')[0].trim()).filter(Boolean));
  } catch { return new Set(); }
}

// fetch sitemap (+1 уровень sitemap-index) и вернуть ТОЛЬКО URL этого хоста
async function ownedUrls(host: string): Promise<string[]> {
  async function locs(url: string): Promise<string[]> {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) });
      if (!r.ok) return [];
      const x = await r.text();
      return [...x.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    } catch { return []; }
  }
  let l = await locs(`https://${host}/sitemap.xml`);
  if (l.length && /\.xml(\?|$)/i.test(l[0])) {
    // sitemap-index → собрать дочерние (до 50 субкарт)
    const all: string[] = [];
    for (const sm of l.slice(0, 50)) all.push(...(await locs(sm)));
    l = all;
  }
  // host-ownership: только URL этого хоста
  return l.filter((u) => hostOf(u) === host);
}

async function ping(engine: string, host: string, urls: string[]): Promise<number> {
  if (!urls.length || !KEY) return 0;
  try {
    const r = await fetch(`https://${ENGINE_HOST[engine]}/indexnow`, {
      method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host, key: KEY, keyLocation: `https://${host}/indexnow_${KEY}.txt`, urlList: urls }),
    });
    return r.status;
  } catch { return -1; }
}

interface LogRow { ts: string; engine: string; host: string; urls: number; status: number; result: string; }
async function appendLog(rows: LogRow[]) {
  const path = 'reports/search-engine-submission-log.csv';
  const exists = await Bun.file(path).exists();
  const header = 'ts,engine,host,urls,http_status,result\n';
  const body = rows.map((r) => `${r.ts},${r.engine},${r.host},${r.urls},${r.status},"${r.result}"`).join('\n') + '\n';
  if (exists) {
    const prev = await Bun.file(path).text();
    await Bun.write(path, prev + body);
  } else {
    await Bun.write(path, header + body);
  }
}

async function main() {
  const bad = await loadBadHosts();
  let hosts = (await getHosts()).filter((h) => !bad.has(h));
  if (ONLY) hosts = hosts.filter((h) => h === ONLY);
  console.log(`🚀 Network IndexNow · хостов (GOOD, после exclude ${bad.size} bad): ${hosts.length} · движки: ${ENGINES.join('+')}${DRY ? ' · DRY-RUN' : ''} · батч ${BATCH} · лимит/хост ${PER_HOST}\n`);

  const ts = () => new Date().toISOString().slice(0, 19);
  const log: LogRow[] = [];
  let totalUrls = 0, totalAccepted = 0, hostsWithUrls = 0, rejected = 0;

  for (const host of hosts) {
    const urls = (await ownedUrls(host)).slice(0, PER_HOST);
    if (!urls.length) { console.log(`  ${host.padEnd(40)} — 0 owned URL (skip)`); continue; }
    hostsWithUrls++;
    totalUrls += urls.length;

    if (DRY) {
      console.log(`  ${host.padEnd(40)} ${String(urls.length).padStart(5)} URL → ${ENGINES.join('+')} (${Math.ceil(urls.length / BATCH)} батч.)`);
      continue;
    }

    const statuses: string[] = [];
    for (const engine of ENGINES) {
      let accepted = 0, lastStatus = 0;
      for (let i = 0; i < urls.length; i += BATCH) {
        const chunk = urls.slice(i, i + BATCH);
        const st = await ping(engine, host, chunk);
        lastStatus = st;
        if (st === 200 || st === 202) accepted += chunk.length; else rejected += chunk.length;
        await new Promise((r) => setTimeout(r, 150));
      }
      totalAccepted += accepted;
      statuses.push(`${engine[0].toUpperCase()}[${lastStatus}]`);
      log.push({ ts: ts(), engine, host, urls: urls.length, status: lastStatus, result: (lastStatus === 200 || lastStatus === 202) ? 'accepted' : 'rejected' });
    }
    console.log(`  ${host.padEnd(40)} ${String(urls.length).padStart(5)} URL · ${statuses.join(' ')}`);
  }

  console.log(`\n📊 ИТОГ: хостов с URL ${hostsWithUrls}/${hosts.length} · URL (уник.) ${totalUrls} · accepted ${totalAccepted}${rejected ? ` · rejected ${rejected}` : ''}`);
  if (DRY) { console.log('📋 DRY-RUN — реальных пингов не было.'); return; }
  await appendLog(log);
  console.log(`💾 Лог дописан: reports/search-engine-submission-log.csv (+${log.length} строк)`);
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
