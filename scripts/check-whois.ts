#!/usr/bin/env bun
// Проверка доменов через whois (без авторизации).
// Используем когда reg.ru API недоступен. Цены — справочно с известных тарифов.

const candidates = [
  // .ru — приоритет для Яндекса
  'remontkalkulator.ru',
  'kalkremont.ru',
  'kalk-remont.ru',
  'raschetremonta.ru',
  'raschet-remonta.ru',
  'remont-kalk.ru',
  'skolko-oboev.ru',
  'meterremonta.ru',
  'remontmera.ru',
  'kalkstroy.ru',
  'kalk-stroy.ru',
  'stroykalk.ru',
  'oboi-raschet.ru',
  'kalkulator-oboev.ru',
  'raschetoboev.ru',
  'kalk-oboi.ru',
  'kalk-materialov.ru',
  'materialov-raschet.ru',
  'kalkmaterialov.ru',
  'raschet-stroyki.ru'
];

// Карта TLD → whois-сервер. macOS whois для .ru идёт только в IANA и не делает
// referral на tcinet — поэтому делаем явно.
const WHOIS_SERVERS: Record<string, string> = {
  ru: 'whois.tcinet.ru',
  рф: 'whois.tcinet.ru',
  su: 'whois.tcinet.ru',
  com: 'whois.verisign-grs.com',
  net: 'whois.verisign-grs.com',
  online: 'whois.nic.online',
  site: 'whois.nic.site',
  store: 'whois.nic.store'
};

async function whois(domain: string): Promise<{ available: boolean; raw: string }> {
  const tld = domain.split('.').pop()!.toLowerCase();
  const server = WHOIS_SERVERS[tld];

  const args = server ? ['-h', server, domain] : [domain];
  const proc = Bun.spawnSync(['whois', ...args]);
  const raw = proc.stdout.toString() + proc.stderr.toString();
  const lower = raw.toLowerCase();

  // Признаки свободного домена для разных whois-серверов
  const freeMarkers = [
    'no entries found',
    'no match',
    'not found',
    'no data found',
    'available for registration',
    'this domain is available',
    'domain not found',
    'no such domain'
  ];
  const isFree = freeMarkers.some((m) => lower.includes(m));

  return { available: isFree, raw };
}

async function main() {
  console.log(`\nПроверяю ${candidates.length} доменов через whois (последовательно с паузами 1с)...\n`);

  const results: Array<{ domain: string; available: boolean }> = [];
  for (const d of candidates) {
    process.stdout.write(`  ${d.padEnd(35)} ... `);
    const { available } = await whois(d);
    results.push({ domain: d, available });
    console.log(available ? '✓ СВОБОДЕН' : '✗ занят');
    await new Promise((r) => setTimeout(r, 1000)); // не флудим whois-серверы
  }

  const free = results.filter((r) => r.available);
  console.log(`\n\n=== СВОБОДНЫЕ (${free.length}) ===`);
  for (const r of free) console.log(`  ${r.domain}`);

  console.log(`\n💰 Цена на .ru у reg.ru сейчас — обычно 199-299₽ первый год по акции, 990₽ продление.`);
  console.log(`Точную акционную цену увидишь при оформлении.\n`);
}

main();
