#!/usr/bin/env bun
/**
 * check-recrawl-quota.ts — READ-ONLY: показывает дневную квоту переобхода
 * Я.Вебмастера и остаток (quota_remainder) по хосту(ам). Никаких записей/POST.
 *
 * Зачем: квота переобхода = 150/хост/сутки, сбрасывается в 00:00 МСК. Чтобы
 * автоном-крон не «жёг» вызовы впустую и чтобы понимать, когда реально есть
 * свободные слоты под money-страницы, нужно уметь спросить остаток.
 *
 *   set -a && source .env.local && set +a && bun scripts/check-recrawl-quota.ts            # www
 *   ... bun scripts/check-recrawl-quota.ts --host spb.kalkremont.ru
 *   ... bun scripts/check-recrawl-quota.ts --all
 */
const TOKEN = process.env.YANDEX_OAUTH_TOKEN!;
const USER = process.env.YANDEX_WEBMASTER_USER_ID!;
if (!TOKEN || !USER) { console.error('❌ Нет env: YANDEX_OAUTH_TOKEN / YANDEX_WEBMASTER_USER_ID'); process.exit(1); }

async function ya(path: string) {
  const r = await fetch(`https://api.webmaster.yandex.net/v4${path}`, {
    headers: { Authorization: `OAuth ${TOKEN}` },
  });
  const t = await r.text();
  try { return { status: r.status, ...JSON.parse(t) }; } catch { return { status: r.status, raw: t }; }
}

async function main() {
  const args = process.argv.slice(2);
  const all = args.includes('--all');
  let host = 'www.kalkremont.ru';
  for (let i = 0; i < args.length; i++) if (args[i] === '--host') host = args[++i];

  const hr = await ya(`/user/${USER}/hosts`);
  const hosts: Array<{ host: string; hostId: string }> = ((hr as any).hosts || []).map((h: any) => ({
    host: h.ascii_host_url.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    hostId: h.host_id,
  }));
  const targets = all ? hosts : hosts.filter((h) => h.host === host);
  if (!targets.length) { console.error(`❌ Хост ${host} не найден в Вебмастере`); process.exit(1); }

  const now = new Date();
  // МСК = UTC+3 (независимо от локального TZ машины — тут +07). Берём абсолютный
  // epoch и сдвигаем на +3ч, затем toISOString() даёт «настенное» время Москвы.
  const mskNow = new Date(now.getTime() + 3 * 3600 * 1000);
  console.log(`🕒 Сейчас МСК: ${mskNow.toISOString().slice(0, 16).replace('T', ' ')} (сброс квоты в 00:00 МСК)\n`);

  let totalRemain = 0;
  for (const t of targets) {
    const q = await ya(`/user/${USER}/hosts/${t.hostId}/recrawl/quota`);
    const daily = (q as any).daily_quota ?? '?';
    const remain = (q as any).quota_remainder ?? '?';
    if (typeof remain === 'number') totalRemain += remain;
    console.log(`  ${t.host.padEnd(34)} daily=${daily} · remainder=${remain}${q.status !== 200 ? ` (HTTP ${q.status})` : ''}`);
    await new Promise((r) => setTimeout(r, 80));
  }
  if (all) console.log(`\n📊 Суммарный остаток по ${targets.length} хостам: ${totalRemain}`);
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
