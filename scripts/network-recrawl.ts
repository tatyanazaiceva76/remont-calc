#!/usr/bin/env bun
/**
 * network-recrawl.ts — Network Indexation Engine: Yandex recrawl (ШАГ 3 оператора).
 *
 * Ставит в переобход Я.Вебмастера приоритетные URL КАЖДОГО GOOD-хоста в пределах
 * его суточной квоты (150/хост/день — у каждого хоста СВОЯ). Дубли-призраки
 * (bad-hosts.csv) исключаются; шлём только URL, принадлежащие хосту (ownership).
 *
 * Ротация: первые 30 URL sitemap (хабы) + день-сдвинутый хвост → главное
 * переобходится часто, длинный хвост прорабатывается за месяц.
 *
 * 429 = квота на сегодня исчерпана → логируем как quota_exhausted (НЕ fatal),
 * переходим к следующему хосту. 202 = принято.
 *
 * Лог: reports/notify-log-network-recrawl-<ts>.csv (host,ok,blocked,quota_left,result).
 *
 *   set -a && source .env.local && set +a && bun scripts/network-recrawl.ts --dry-run
 *   set -a && source .env.local && set +a && bun scripts/network-recrawl.ts
 *   ... --per-host 150   --only spb.kalkremont.ru   --skip-www
 */

const TOKEN = process.env.YANDEX_OAUTH_TOKEN;
const USER = process.env.YANDEX_WEBMASTER_USER_ID;
if (!TOKEN || !USER) { console.error('❌ Нет env YANDEX_OAUTH_TOKEN / YANDEX_WEBMASTER_USER_ID'); process.exit(1); }

const args = process.argv.slice(2);
const has = (f: string) => args.includes(f);
const val = (f: string, d: string) => { const i = args.indexOf(f); return i >= 0 ? (args[i + 1] ?? d) : d; };
const DRY = has('--dry-run');
const SKIP_WWW = has('--skip-www');
const PER_HOST = parseInt(val('--per-host', '150'), 10) || 150;
const ONLY = val('--only', '');
const UA = 'Mozilla/5.0 (compatible; NetworkRecrawl/1.0)';

function hostOf(u: string): string { try { return new URL(u).host; } catch { return ''; } }

async function ya(method: string, path: string, body?: unknown): Promise<any> {
  const r = await fetch(`https://api.webmaster.yandex.net/v4${path}`, {
    method, headers: { Authorization: `OAuth ${TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const t = await r.text(); try { return { _s: r.status, ...JSON.parse(t) }; } catch { return { _s: r.status, _raw: t }; }
}
async function getHosts(): Promise<{ host: string; hostId: string }[]> {
  const r = await ya('GET', `/user/${USER}/hosts`);
  return ((r.hosts || []) as any[]).map((h) => ({
    host: h.ascii_host_url.replace(/^https?:\/\//, '').replace(/\/$/, ''), hostId: h.host_id,
  }));
}
async function loadBadHosts(): Promise<Set<string>> {
  try { const t = await Bun.file('reports/bad-hosts.csv').text(); return new Set(t.split('\n').slice(1).map((l) => l.split(',')[0].trim()).filter(Boolean)); }
  catch { return new Set(); }
}
// приоритет хоста из инвентаря (если есть) — чтобы при прерывании топ-хосты прошли первыми
async function loadPriority(): Promise<Map<string, number>> {
  const m = new Map<string, number>();
  try {
    const rows = (await Bun.file('reports/network-hosts-inventory.csv').text()).split('\n').slice(1);
    for (const l of rows) { const c = l.split(','); if (c[1]) m.set(c[1].trim(), parseInt(c[c.length - 1], 10) || 0); }
  } catch {}
  return m;
}
async function ownedUrls(host: string): Promise<string[]> {
  async function locs(url: string): Promise<string[]> {
    try { const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) }); if (!r.ok) return []; const x = await r.text(); return [...x.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim()); } catch { return []; }
  }
  let l = await locs(`https://${host}/sitemap.xml`);
  if (l.length && /\.xml(\?|$)/i.test(l[0])) { const all: string[] = []; for (const sm of l.slice(0, 50)) all.push(...(await locs(sm))); l = all; }
  return l.filter((u) => hostOf(u) === host);
}
function rotate(urls: string[], host: string): string[] {
  const head = urls.slice(0, Math.min(30, urls.length));
  const tail = urls.slice(30);
  if (!tail.length) return head.slice(0, PER_HOST);
  const seed = (new Date().getDate() * 100 + new Date().getUTCHours() * 7 + host.length * 13) % tail.length;
  return [...head, ...tail.slice(seed), ...tail.slice(0, seed)].slice(0, PER_HOST);
}

interface LogRow { host: string; ok: number; blocked: number; quota: string; result: string; }
async function main() {
  const bad = await loadBadHosts();
  const prio = await loadPriority();
  let hosts = (await getHosts()).filter((h) => !bad.has(h.host));
  if (ONLY) hosts = hosts.filter((h) => h.host === ONLY);
  if (SKIP_WWW) hosts = hosts.filter((h) => h.host !== 'www.kalkremont.ru' && h.host !== 'kalkremont.ru');
  hosts.sort((a, b) => (prio.get(b.host) ?? 0) - (prio.get(a.host) ?? 0));
  console.log(`📅 Network recrawl · день ${new Date().getDate()} · хостов ${hosts.length} (exclude ${bad.size} bad)${SKIP_WWW ? ' · skip-www' : ''} · до ${PER_HOST}/хост${DRY ? ' · DRY-RUN' : ''}\n`);

  const log: LogRow[] = [];
  let totalOk = 0, totalBlocked = 0, exhaustedHosts = 0, hostsQueued = 0;

  for (const { host, hostId } of hosts) {
    const owned = await ownedUrls(host);
    if (!owned.length) { console.log(`  ${host.padEnd(40)} — 0 owned URL (skip)`); continue; }
    const slice = rotate(owned, host);

    if (DRY) { console.log(`  ${host.padEnd(40)} ${String(slice.length).padStart(3)}/${owned.length} URL → recrawl`); hostsQueued++; continue; }

    let ok = 0, blocked = 0, quota = '?', exhausted = false;
    for (const url of slice) {
      const r = await ya('POST', `/user/${USER}/hosts/${encodeURIComponent(hostId)}/recrawl/queue`, { url });
      if (r._s === 202) { ok++; quota = String(r.quota_remainder ?? quota); }
      else if (r._s === 429) { exhausted = true; quota = String(r.quota_remainder ?? 0); break; }
      else blocked++;
      await new Promise((res) => setTimeout(res, 220));
    }
    if (ok) hostsQueued++;
    if (exhausted) exhaustedHosts++;
    totalOk += ok; totalBlocked += blocked;
    const result = exhausted ? `quota_exhausted_today(ok=${ok})` : `quota_left=${quota}${blocked ? ` blocked=${blocked}` : ''}`;
    log.push({ host, ok, blocked, quota, result });
    console.log(`  ${host.padEnd(40)} ok ${String(ok).padStart(3)} · ${exhausted ? `QUOTA EXHAUSTED (left ${quota})` : `quota_left ${quota}`}${blocked ? ` · blocked ${blocked}` : ''}`);
  }

  console.log(`\n📊 ИТОГ: переобход ${totalOk} URL · хостов в очереди ${hostsQueued}/${hosts.length} · квота исчерпана у ${exhaustedHosts}${totalBlocked ? ` · blocked ${totalBlocked}` : ''}`);
  if (DRY) { console.log('📋 DRY-RUN — реальных вызовов не было.'); return; }
  await Bun.$`mkdir -p reports`.quiet();
  const path = `reports/notify-log-network-recrawl-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.csv`;
  await Bun.write(path, ['host,ok,blocked,quota_left,result'].concat(log.map((l) => `${l.host},${l.ok},${l.blocked},${l.quota},"${l.result}"`)).join('\n'));
  console.log(`💾 Лог: ${path}`);
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
