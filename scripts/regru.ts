#!/usr/bin/env bun
// reg.ru API helper
// Запуск:
//   bun scripts/regru.ts check foo.ru bar.com
//   bun scripts/regru.ts candidates
//   bun scripts/regru.ts prices ru com online
//   bun scripts/regru.ts buy foo.ru
//
// Использует SOCKS5 прокси из .env.local (если задан) — обходит GEO-блокировки.
// Docs: https://www.reg.ru/reseller/api2_doc

const API = process.env.REGRU_API_URL || 'https://api.reg.ru/api/regru2';
const USER = process.env.REGRU_USERNAME;
const PASS = process.env.REGRU_PASSWORD;
const PROXY = process.env.PROXY_HOST
  ? {
      host: process.env.PROXY_HOST!,
      port: process.env.PROXY_PORT!,
      user: process.env.PROXY_USER!,
      pass: process.env.PROXY_PASS!
    }
  : null;

if (!USER || !PASS) {
  console.error('❌ REGRU_USERNAME или REGRU_PASSWORD не заданы в .env.local');
  process.exit(1);
}

interface CheckResult {
  dname: string;
  error_code?: string;
  result?: string;
  price?: number;
  currency?: string;
}

async function callOnce(method: string, body: Record<string, unknown>, useProxy: boolean) {
  const form = [
    `username=${encodeURIComponent(USER!)}`,
    `password=${encodeURIComponent(PASS!)}`,
    `input_format=json`,
    `output_format=json`,
    `input_data=${encodeURIComponent(JSON.stringify(body))}`
  ].join('&');

  const curlArgs = [
    'curl', '--silent', '--show-error', '--max-time', '15',
    '-X', 'POST',
    '-H', 'Content-Type: application/x-www-form-urlencoded',
    '--data', form,
    `${API}/${method}`
  ];

  if (useProxy && PROXY) {
    curlArgs.splice(1, 0,
      '--socks5', `${PROXY.host}:${PROXY.port}`,
      '--proxy-user', `${PROXY.user}:${PROXY.pass}`,
      '--socks5-basic'
    );
  }

  const proc = Bun.spawnSync(curlArgs);
  return { exit: proc.exitCode ?? -1, stdout: proc.stdout.toString(), stderr: proc.stderr.toString() };
}

async function call(method: string, body: Record<string, unknown>) {
  // Сначала через прокси (если задан), при сетевой ошибке — fallback на прямой
  const attempts: Array<{ via: string; useProxy: boolean }> = PROXY
    ? [{ via: `proxy ${PROXY.host}`, useProxy: true }, { via: 'direct', useProxy: false }]
    : [{ via: 'direct', useProxy: false }];

  let last: { exit: number; stdout: string; stderr: string } | null = null;
  for (const a of attempts) {
    const r = await callOnce(method, body, a.useProxy);
    last = r;
    // Сетевая ошибка curl — пробуем следующий способ
    if (r.exit !== 0) continue;

    let json;
    try { json = JSON.parse(r.stdout); }
    catch (e) {
      throw new Error(`bad json from reg.ru: ${r.stdout.slice(0, 200)}`);
    }
    if (json.result === 'error') {
      // RATE_EXCEEDED — на стороне сервера, фолбэк не поможет
      throw new Error(`reg.ru error: ${json.error_code} — ${json.error_text} (via ${a.via})`);
    }
    return json;
  }

  throw new Error(`network: curl exit ${last?.exit}: ${last?.stderr?.trim() || 'unknown'}`);
}

async function check(dnames: string[]) {
  const res = await call('domain/check', {
    domains: dnames.map((dname) => ({ dname }))
  });
  return (res.answer?.domains ?? []) as CheckResult[];
}

async function getPrices() {
  const res = await call('domain/get_prices', { currency: 'RUB', show_renew_data: 1 });
  return res.answer?.prices ?? {};
}

function fmtPrice(n: number | undefined) {
  if (n === undefined || n === null) return '—';
  return `${Number(n).toLocaleString('ru-RU')}₽`;
}

async function main() {
  const cmd = process.argv[2];
  const args = process.argv.slice(3);

  if (PROXY) {
    console.log(`🌐 proxy: ${PROXY.host}:${PROXY.port}`);
  }

  if (cmd === 'check') {
    const results = await check(args);
    console.log('\nПроверка доменов:\n');
    for (const r of results) {
      const status = r.result === 'Available' ? '✓ свободен' : '✗ занят';
      const price = r.price ? `  ${fmtPrice(r.price)}` : '';
      console.log(`  ${r.dname.padEnd(35)} ${status}${price}`);
    }
    return;
  }

  if (cmd === 'candidates') {
    const candidates = [
      'kalkremont.ru', 'kalk-remont.ru', 'remontkalkulator.ru', 'raschetremonta.ru',
      'remont-kalk.ru', 'kalkstroy.ru', 'stroykalk.ru', 'kalk-stroy.ru',
      'oboi-raschet.ru', 'kalkulator-oboev.ru', 'kalk-oboi.ru',
      'kalk-materialov.ru', 'kalkmaterialov.ru', 'raschet-stroyki.ru',
      'skolko-oboev.ru', 'meterremonta.ru', 'remontmera.ru'
    ];

    console.log(`\nПроверяю ${candidates.length} доменов...\n`);
    const all: CheckResult[] = [];
    for (let i = 0; i < candidates.length; i += 10) {
      const batch = candidates.slice(i, i + 10);
      const res = await check(batch);
      all.push(...res);
    }

    const available = all
      .filter((r) => r.result === 'Available')
      .sort((a, b) => (a.price ?? 999999) - (b.price ?? 999999));

    console.log('=== СВОБОДНЫЕ (по возрастанию цены) ===');
    for (const r of available) {
      console.log(`  ${r.dname.padEnd(35)} ${fmtPrice(r.price)}`);
    }

    if (available.length > 0) {
      console.log(`\n💡 Самый дешёвый: ${available[0].dname} за ${fmtPrice(available[0].price)}`);
    }
    return;
  }

  if (cmd === 'prices') {
    const tldFilter = args;
    const prices = await getPrices();
    console.log('\nЦены по зонам:\n');
    for (const [tld, data] of Object.entries(prices)) {
      if (tldFilter.length > 0 && !tldFilter.includes(tld)) continue;
      const d = data as { create?: number; renew?: number };
      console.log(`  .${tld.padEnd(8)}  регистрация: ${fmtPrice(d.create)}  продление: ${fmtPrice(d.renew)}`);
    }
    return;
  }

  if (cmd === 'buy') {
    console.error('⚠️  Покупка требует ручного апрува — раскомментирую и допишу когда будет финальное добро');
    process.exit(1);
  }

  console.error(`Команды:
  bun scripts/regru.ts candidates           — проверить наш список + цены
  bun scripts/regru.ts check foo.ru bar.com — проверить конкретные домены
  bun scripts/regru.ts prices [ru com ...]  — цены по зонам
  bun scripts/regru.ts buy foo.ru           — купить (отдельно)`);
  process.exit(1);
}

main().catch((e) => {
  console.error('❌', e.message);
  process.exit(1);
});
