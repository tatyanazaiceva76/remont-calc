#!/usr/bin/env bun
/**
 * notify-indexnow-recrawl.ts — уведомление поисковиков о страницах с логированием.
 *
 * Поток (по чеклисту): свежие/важные URL → IndexNow (Яндекс) → переобход Я.Вебмастера
 * (важные URL, в пределах дневной квоты 150/хост) → запись статуса в CSV-лог.
 *
 * Запуск:
 *   bun scripts/notify-indexnow-recrawl.ts                       # флагман www.kalkremont.ru, top-N по sitemap
 *   bun scripts/notify-indexnow-recrawl.ts --host vannye.kalkremont.ru
 *   bun scripts/notify-indexnow-recrawl.ts --all                 # все хосты Вебмастера (recrawl 150 + IndexNow 1000)
 *   bun scripts/notify-indexnow-recrawl.ts --urls urls.txt --host www.kalkremont.ru
 *
 * Требует .env.local: YANDEX_OAUTH_TOKEN, YANDEX_WEBMASTER_USER_ID, INDEXNOW_KEY
 *   set -a && source .env.local && set +a && bun scripts/notify-indexnow-recrawl.ts ...
 */

const TOKEN = process.env.YANDEX_OAUTH_TOKEN!;
const USER = process.env.YANDEX_WEBMASTER_USER_ID!;
const KEY = process.env.INDEXNOW_KEY!;
if (!TOKEN || !USER || !KEY) { console.error('❌ Нет env: YANDEX_OAUTH_TOKEN / YANDEX_WEBMASTER_USER_ID / INDEXNOW_KEY'); process.exit(1); }

const RECRAWL_PER_HOST = 150;   // дневная квота Яндекса на хост
const INDEXNOW_PER_HOST = 1000; // безопасный батч на пинг

async function ya(method: string, path: string, body?: unknown) {
  try {
    const r = await fetch(`https://api.webmaster.yandex.net/v4${path}`, {
      method, headers: { Authorization: `OAuth ${TOKEN}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const t = await r.text();
    try { return { status: r.status, ...JSON.parse(t) }; } catch { return { status: r.status, raw: t }; }
  } catch (e) {
    // Транзиентный сбой сети/таймаут НЕ должен ронять весь ночной проход по 222 хостам
    // (при свежей квоте это ~15 900 recrawl-вызовов — один DOMException = крах всего).
    // status:0 → вызывающий код считает вызов «не 202/не 429» и спокойно идёт дальше.
    return { status: 0, raw: String(e) };
  }
}

async function getHosts(): Promise<Array<{ host: string; hostId: string }>> {
  const r = await ya('GET', `/user/${USER}/hosts`);
  return ((r as any).hosts || []).map((h: any) => ({
    host: h.ascii_host_url.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    hostId: h.host_id,
  }));
}

function hostOf(u: string): string { try { return new URL(u).host; } catch { return ''; } }

// Хосты-дубли (canonical/sitemap уводят на другой хост) — их IndexNow всегда 422,
// а переобход кладёт чужие URL под этим хостом. Берём из reports/bad-hosts.csv,
// если файл есть (его генерит scripts/analyze-hosts.ts). Это быстрый early-skip;
// финальную защиту даёт фильтр URL по хосту в main().
async function loadExcluded(): Promise<Set<string>> {
  try {
    const txt = await Bun.file('reports/bad-hosts.csv').text();
    const lines = txt.split('\n').slice(1).filter(Boolean);
    return new Set(lines.map((l) => l.split(',')[0].trim()).filter(Boolean));
  } catch { return new Set(); }
}

async function sitemapUrls(host: string): Promise<string[]> {
  try {
    const r = await fetch(`https://${host}/sitemap.xml`, { headers: { 'User-Agent': 'kalkremont-notify' } });
    if (!r.ok) return [];
    const xml = await r.text();
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  } catch { return []; }
}

// IndexNow → Яндекс (до 10 000 URL за запрос; шлём батчами)
async function indexNow(host: string, urls: string[]): Promise<{ sent: number; status: number }> {
  if (!urls.length) return { sent: 0, status: 0 };
  try {
    const r = await fetch('https://yandex.com/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host, key: KEY, keyLocation: `https://${host}/indexnow_${KEY}.txt`, urlList: urls }),
    });
    return { sent: urls.length, status: r.status };
  } catch (e) {
    // Транзиентный сбой сети не должен ронять ночной проход (см. коммент в ya()).
    // status:0 → inOk=false, URL не зачтены в totalIndexNow, идём к recrawl.
    return { sent: 0, status: 0 };
  }
}

// Переобход Я.Вебмастера — по одному URL, до исчерпания квоты
async function recrawl(hostId: string, urls: string[]): Promise<{ ok: number; quota: number; blocked: number }> {
  let ok = 0, blocked = 0, quota = RECRAWL_PER_HOST;
  for (const url of urls.slice(0, RECRAWL_PER_HOST)) {
    const r = await ya('POST', `/user/${USER}/hosts/${hostId}/recrawl/queue`, { url });
    if (r.status === 202) { ok++; quota = (r as any).quota_remainder ?? quota; }
    else if (r.status === 429) { blocked++; break; }
    else blocked++;
  }
  return { ok, quota, blocked };
}

interface LogRow { ts: string; host: string; action: string; urls: number; result: string }

async function main() {
  const args = process.argv.slice(2);
  const all = args.includes('--all');
  let host = 'www.kalkremont.ru';
  let urlsFile = '';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--host') host = args[++i];
    else if (args[i] === '--urls') urlsFile = args[++i];
  }

  const hosts = await getHosts();
  const targets = all ? hosts : hosts.filter((h) => h.host === host);
  if (!targets.length) { console.error(`❌ Хост ${host} не найден в Вебмастере`); process.exit(1); }

  const excluded = await loadExcluded();
  const skipExcluded = !args.includes('--no-skip'); // --no-skip форсит обработку всех (для отладки)
  console.log(`🔔 Уведомление поисковиков · хостов: ${targets.length}${excluded.size ? ` · в exclude-листе ${excluded.size}` : ''}\n`);
  const log: LogRow[] = [];
  const ts = () => new Date().toISOString().slice(0, 19);
  let totalIndexNow = 0, totalRecrawl = 0, skipped = 0;

  for (const t of targets) {
    // 1) быстрый skip известных дублей из bad-hosts.csv
    if (skipExcluded && excluded.has(t.host)) {
      skipped++;
      log.push({ ts: ts(), host: t.host, action: 'skip', urls: 0, result: 'excluded (bad-hosts.csv)' });
      console.log(`  ${t.host.padEnd(38)} — SKIP (дубль-призрак, см. bad-hosts.csv)`);
      continue;
    }

    let urls: string[];
    if (urlsFile && !all) {
      urls = (await Bun.file(urlsFile).text()).split('\n').map((l) => l.trim()).filter(Boolean);
    } else {
      urls = await sitemapUrls(t.host);
    }
    if (!urls.length) { console.log(`  ${t.host.padEnd(38)} — нет URL в sitemap, пропуск`); continue; }

    // 2) надёжная защита: оставляем только URL, принадлежащие этому хосту.
    //    Это и устраняет IndexNow[422], и не даёт переобходу класть чужие URL.
    const ownUrls = urls.filter((u) => hostOf(u) === t.host);
    if (!ownUrls.length) {
      skipped++;
      const foreign = urls[0] ? hostOf(urls[0]) : '?';
      log.push({ ts: ts(), host: t.host, action: 'skip', urls: 0, result: `sitemap host mismatch → ${foreign}` });
      console.log(`  ${t.host.padEnd(38)} — SKIP (sitemap указывает на ${foreign}, не на этот хост)`);
      continue;
    }

    // IndexNow: первые INDEXNOW_PER_HOST (только свои URL)
    const inUrls = ownUrls.slice(0, INDEXNOW_PER_HOST);
    const inRes = await indexNow(t.host, inUrls);
    const inOk = inRes.status === 200 || inRes.status === 202;
    if (inOk) totalIndexNow += inRes.sent;
    log.push({ ts: ts(), host: t.host, action: 'indexnow', urls: inRes.sent, result: `HTTP ${inRes.status}` });

    // Recrawl: первые RECRAWL_PER_HOST (важные — начало sitemap обычно = главная+хабы)
    const rc = await recrawl(t.hostId, ownUrls);
    totalRecrawl += rc.ok;
    log.push({ ts: ts(), host: t.host, action: 'recrawl', urls: rc.ok, result: `quota_left=${rc.quota}${rc.blocked ? ` blocked=${rc.blocked}` : ''}` });

    console.log(`  ${t.host.padEnd(38)} IndexNow[${inRes.status}] ${inRes.sent} · recrawl ${rc.ok} (quota ${rc.quota})`);
    await new Promise((r) => setTimeout(r, 120));
  }

  // CSV-лог
  await Bun.$`mkdir -p reports`.quiet();
  const path = `reports/notify-log-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.csv`;
  const csv = ['ts,host,action,urls,result'].concat(log.map((l) => `${l.ts},${l.host},${l.action},${l.urls},"${l.result}"`)).join('\n');
  await Bun.write(path, csv);

  console.log(`\n📊 ИТОГ: IndexNow ${totalIndexNow} URL · recrawl ${totalRecrawl} URL · обработано ${targets.length - skipped}/${targets.length} (skip ${skipped})`);
  console.log(`💾 Лог: ${path}`);
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
