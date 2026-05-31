#!/usr/bin/env bun
/**
 * check-traffic.ts — READ-ONLY телеметрия воронки из Я.Вебмастера.
 * Никаких записей/POST. Это «приборная панель» автономного оператора: чтобы
 * гнать трафик, надо видеть, где воронка стоит — индексация → показы → клики.
 *
 * Показывает по хосту(ам):
 *   • SQI (ИКС), в поиске / исключено страниц, проблемы сайта;
 *   • тренд обхода (HTTP_2XX за N дней) — сколько Яндекс реально краулит;
 *   • топ поисковых запросов с показами/кликами за N дней (+ суммы).
 *
 * Зачем именно это: в холодном старте (новый домен, SQI 0) узкое место —
 * ИНДЕКСАЦИЯ, а не CTR. Эта метрика (searchable_pages_count во времени +
 * появление money-запросов) — сигнал, когда переключаться с «толкаем индекс»
 * на «оптимизируем заголовки/конверсию».
 *
 *   set -a && source .env.local && set +a && bun scripts/check-traffic.ts            # www, 14 дней
 *   ... bun scripts/check-traffic.ts --host spb.kalkremont.ru --days 28
 *   ... bun scripts/check-traffic.ts --all
 */
const TOKEN = process.env.YANDEX_OAUTH_TOKEN!;
const USER = process.env.YANDEX_WEBMASTER_USER_ID!;
if (!TOKEN || !USER) { console.error('❌ Нет env: YANDEX_OAUTH_TOKEN / YANDEX_WEBMASTER_USER_ID'); process.exit(1); }

async function ya(path: string) {
  try {
    const r = await fetch(`https://api.webmaster.yandex.net/v4${path}`, { headers: { Authorization: `OAuth ${TOKEN}` } });
    const t = await r.text();
    try { return { status: r.status, ...JSON.parse(t) }; } catch { return { status: r.status, raw: t }; }
  } catch (e) { return { status: 0, raw: String(e) }; }
}

const day = (n: number) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);

async function main() {
  const args = process.argv.slice(2);
  const all = args.includes('--all');
  let host = 'www.kalkremont.ru';
  let days = 14;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--host') host = args[++i];
    else if (args[i] === '--days') days = parseInt(args[++i], 10) || 14;
  }

  const hr = await ya(`/user/${USER}/hosts`);
  const hosts: Array<{ host: string; hostId: string }> = ((hr as any).hosts || []).map((h: any) => ({
    host: h.ascii_host_url.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    hostId: h.host_id,
  }));
  const targets = all ? hosts : hosts.filter((h) => h.host === host);
  if (!targets.length) { console.error(`❌ Хост ${host} не найден в Вебмастере`); process.exit(1); }

  const from = day(days), to = day(0);
  console.log(`📈 Воронка из Я.Вебмастера · окно ${from}…${to} (${days} дн.)\n`);

  let netShows = 0, netClicks = 0, netSearchable = 0;
  for (const t of targets) {
    const sum = await ya(`/user/${USER}/hosts/${t.hostId}/summary`);
    const sqi = (sum as any).sqi ?? '?';
    const searchable = (sum as any).searchable_pages_count ?? '?';
    const excluded = (sum as any).excluded_pages_count ?? '?';
    const probs = (sum as any).site_problems ? Object.entries((sum as any).site_problems).map(([k, v]) => `${k}:${v}`).join(',') : '—';
    if (typeof searchable === 'number') netSearchable += searchable;

    // тренд обхода: последнее значение HTTP_2XX
    const idx = await ya(`/user/${USER}/hosts/${t.hostId}/indexing/history?date_from=${from}&date_to=${to}`);
    const series = (idx as any).indicators?.HTTP_2XX ?? [];
    const lastCrawl = series.length ? series[series.length - 1].value : '?';

    const sq = await ya(`/user/${USER}/hosts/${t.hostId}/search-queries/popular?order_by=TOTAL_SHOWS&query_indicator=TOTAL_SHOWS&query_indicator=TOTAL_CLICKS&date_from=${from}&date_to=${to}`);
    const queries: any[] = (sq as any).queries || [];
    let shows = 0, clicks = 0;
    for (const q of queries) { shows += q.indicators?.TOTAL_SHOWS || 0; clicks += q.indicators?.TOTAL_CLICKS || 0; }
    netShows += shows; netClicks += clicks;

    console.log(`■ ${t.host}`);
    console.log(`   SQI ${sqi} · в поиске ${searchable} · исключено ${excluded} · обход(посл.) ${lastCrawl} · проблемы ${probs}`);
    console.log(`   запросов ${queries.length} · показы ${shows} · клики ${clicks}${shows ? ` · CTR ${(100 * clicks / shows).toFixed(1)}%` : ''}`);
    if (!all && queries.length) {
      for (const q of queries.slice(0, 12)) {
        console.log(`     ${String(q.query_text || '').slice(0, 46).padEnd(47)} показы=${q.indicators?.TOTAL_SHOWS ?? 0} клики=${q.indicators?.TOTAL_CLICKS ?? 0}`);
      }
    }
    await new Promise((r) => setTimeout(r, 90));
  }
  if (all) console.log(`\n📊 ПО СЕТИ (${targets.length} хостов): в поиске ${netSearchable} · показы ${netShows} · клики ${netClicks}`);
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
