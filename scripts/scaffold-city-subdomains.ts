#!/usr/bin/env bun
// Генерирует apps для 48 city subdomains.
// Каждый app — Astro проект с city-specific контентом для ниши.

import { writeFileSync, existsSync, mkdirSync } from 'fs';

const ROOT = '/Users/mac/remont-calc';

const NICHE_TEMPLATES: Record<string, { niche: string; nicheGen: string; tagline: string; color: string; emoji: string; basePrice: number; services: { slug: string; name: string; price: string; description: string }[]; faqs: { q: (city: string) => string; a: (city: string, mult: number) => string }[] }> = {
  'ipoteka-remont': {
    niche: 'Ипотека на ремонт',
    nicheGen: 'ипотеки на ремонт',
    tagline: 'Кредит на ремонт от 8% годовых',
    color: '#1abc9c',
    emoji: '🏦',
    basePrice: 200000,
    services: [
      { slug: 'kredit-na-remont', name: 'Потребкредит на ремонт', price: 'от 8% годовых', description: 'Без залога, до 5 млн ₽, на 5-7 лет' },
      { slug: 'ipoteka', name: 'Ипотека на ремонт', price: 'от 6.5% годовых', description: 'Под залог квартиры, до 30 млн ₽' },
      { slug: 'kreditnaya-karta', name: 'Кредитная карта', price: '0% на 12 мес', description: 'Без переплат при возврате в срок' },
      { slug: 'refinansirovanie', name: 'Рефинансирование', price: 'от 7% годовых', description: 'Снизить ставку по действующему кредиту' }
    ],
    faqs: [
      { q: (c) => `Где взять ипотеку на ремонт в ${c}?`, a: (c) => `В ${c} ипотеку на ремонт выдают Сбербанк, ВТБ, Альфа-банк, Газпромбанк. Ставки от 6.5-9% годовых на 25 лет.` },
      { q: (c) => `Дадут ли кредит в ${c} с зарплатой 50к ₽?`, a: (c) => `Да, при зарплате 50к ₽ в ${c} одобрят кредит до 1-1.5 млн ₽ на 5-7 лет. Платёж не должен превышать 40-50% дохода.` },
      { q: (c) => `Документы для ипотеки в ${c}?`, a: (c) => `Паспорт, СНИЛС, 2-НДФЛ за 12 мес, трудовая, копия паспорта супруга. Если самозанятый — налоговая декларация.` }
    ]
  },
  'kuhni-zakaz': {
    niche: 'Кухни на заказ',
    nicheGen: 'кухни на заказ',
    tagline: 'Кухни от производителя — замер бесплатно',
    color: '#e67e22',
    emoji: '🍳',
    basePrice: 250000,
    services: [
      { slug: 'klassika', name: 'Классические кухни', price: 'от 80k ₽/пог.м', description: 'МДФ, патина, фрезеровка' },
      { slug: 'sovremennyy', name: 'Современные кухни', price: 'от 60k ₽/пог.м', description: 'Акрил, пластик, минимализм' },
      { slug: 'loft', name: 'Кухни в стиле лофт', price: 'от 70k ₽/пог.м', description: 'Бетон, металл, дерево' },
      { slug: 'malenkaya', name: 'Маленькие кухни (до 6 м²)', price: 'от 80k ₽', description: 'Эргономика, до потолка, встроенная техника' }
    ],
    faqs: [
      { q: (c) => `Сколько стоит кухня в ${c}?`, a: (c, m) => `Средняя цена в ${c}: ${Math.round(120000 * m).toLocaleString('ru-RU')} ₽ за 2 пог.м эконом и до ${Math.round(800000 * m).toLocaleString('ru-RU')} ₽ за премиум.` },
      { q: (c) => `Где заказать кухню в ${c}?`, a: (c) => `В ${c} работают локальные фабрики и федеральные сети: Mr.Doors, Maria, Кухонный двор. Выбирайте по отзывам и срокам.` },
      { q: (c) => `Сколько ждать кухню в ${c}?`, a: (c) => `30-45 дней с момента подписания договора. Сложные модели — до 60 дней. Срочно (с надбавкой 20%) — 14-21 день.` }
    ]
  },
  'dom-stroy': {
    niche: 'Загородные дома',
    nicheGen: 'загородных домов',
    tagline: 'Строительство домов под ключ от 25 000 ₽/м²',
    color: '#27ae60',
    emoji: '🏡',
    basePrice: 2500000,
    services: [
      { slug: 'karkasnye', name: 'Каркасные дома', price: 'от 25k ₽/м²', description: '2-3 месяца, до 1.5 млн на 60 м²' },
      { slug: 'gazobeton', name: 'Дома из газобетона', price: 'от 35k ₽/м²', description: 'Тёплые, долговечные' },
      { slug: 'kirpich', name: 'Кирпичные дома', price: 'от 55k ₽/м²', description: 'Срок 8-12 месяцев, премиум' },
      { slug: 'iz-brusa', name: 'Дома из бруса', price: 'от 30k ₽/м²', description: 'Экологичность, усадка 1 год' }
    ],
    faqs: [
      { q: (c) => `Сколько стоит построить дом 100 м² в ${c}?`, a: (c, m) => `В ${c} каркасный 2.5-3.5 млн ₽, газобетон 3.5-5 млн ₽, кирпич 5.5-8 млн ₽ за 100 м².` },
      { q: (c) => `Какой фундамент в ${c}?`, a: (c) => `Для ${c} подходят свайно-винтовой (100-200к ₽), ленточный (300-600к ₽), плита (500-1500к ₽). Зависит от грунта.` },
      { q: (c) => `Кто строит в ${c} надёжно?`, a: (c) => `В ${c} есть локальные строители и федеральные сети. Главное — договор, поэтапная оплата и портфолио ≥5 работ.` }
    ]
  }
};

interface City {
  slug: string;
  name: string;
  nom: string;
  priceMult: number;
}

const CITIES: City[] = [
  { slug: 'moskva', name: 'Москве', nom: 'Москва', priceMult: 1.4 },
  { slug: 'spb', name: 'Санкт-Петербурге', nom: 'СПб', priceMult: 1.3 },
  { slug: 'ekb', name: 'Екатеринбурге', nom: 'Екатеринбург', priceMult: 1.0 },
  { slug: 'kzn', name: 'Казани', nom: 'Казань', priceMult: 1.0 },
  { slug: 'nsk', name: 'Новосибирске', nom: 'Новосибирск', priceMult: 0.95 },
  { slug: 'krd', name: 'Краснодаре', nom: 'Краснодар', priceMult: 1.05 },
  { slug: 'nn', name: 'Нижнем Новгороде', nom: 'Нижний Новгород', priceMult: 0.95 },
  { slug: 'chel', name: 'Челябинске', nom: 'Челябинск', priceMult: 0.85 },
  { slug: 'ufa', name: 'Уфе', nom: 'Уфа', priceMult: 0.95 },
  { slug: 'sam', name: 'Самаре', nom: 'Самара', priceMult: 0.95 },
  { slug: 'rnd', name: 'Ростове-на-Дону', nom: 'Ростов-на-Дону', priceMult: 1.0 },
  { slug: 'vrn', name: 'Воронеже', nom: 'Воронеж', priceMult: 0.85 },
  { slug: 'perm', name: 'Перми', nom: 'Пермь', priceMult: 0.85 },
  { slug: 'vlg', name: 'Волгограде', nom: 'Волгоград', priceMult: 0.8 },
  { slug: 'tyumen', name: 'Тюмени', nom: 'Тюмень', priceMult: 1.0 },
  { slug: 'brn', name: 'Барнауле', nom: 'Барнаул', priceMult: 0.8 }
];

const NICHE_DOMAINS: Record<string, string> = {
  'ipoteka-remont': 'ipoteka-remont.ru',
  'kuhni-zakaz': 'kuhni-zakaz-online.ru',
  'dom-stroy': 'dom-stroy-online.ru'
};

function writeFile(path: string, content: string) {
  const dir = path.substring(0, path.lastIndexOf('/'));
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(path, content);
}

function generateApp(nicheKey: string, city: City) {
  const t = NICHE_TEMPLATES[nicheKey];
  const baseDomain = NICHE_DOMAINS[nicheKey];
  const subdomain = `${city.slug}.${baseDomain}`;
  const projectName = `${nicheKey}-${city.slug}`;
  const dir = `${ROOT}/apps/${projectName}`;

  const cityPrice = Math.round(t.basePrice * city.priceMult);
  const faqs = t.faqs.map((f) => ({ q: f.q(city.nom), a: f.a(city.nom, city.priceMult) }));
  const services = t.services.map((s) => ({ ...s, slug: s.slug }));
  const cityServicePrice = (s: typeof services[0]) => {
    const match = s.price.match(/(\d+)/);
    const base = match ? parseInt(match[0]) * 1000 : 100000;
    return Math.round(base * city.priceMult);
  };

  // package.json
  writeFile(`${dir}/package.json`, JSON.stringify({
    name: `kalkremont-${projectName}`,
    type: 'module',
    version: '0.1.0',
    scripts: { build: 'astro build' },
    dependencies: { astro: '^4.16.18' }
  }, null, 2));

  writeFile(`${dir}/tsconfig.json`, JSON.stringify({
    extends: 'astro/tsconfigs/strict',
    compilerOptions: { baseUrl: '.', paths: { '~/*': ['src/*'] } }
  }, null, 2));

  writeFile(`${dir}/astro.config.mjs`, `import { defineConfig } from 'astro/config';
export default defineConfig({ site: 'https://${subdomain}', trailingSlash: 'always' });
`);

  writeFile(`${dir}/src/env.d.ts`, `/// <reference types="astro/client" />`);

  writeFile(`${dir}/public/robots.txt`, `User-agent: *
Allow: /

Sitemap: https://${subdomain}/sitemap.xml
Host: ${subdomain}
`);

  writeFile(`${dir}/public/indexnow_854bcff9c2383ba0f9d3566077bdbae3.txt`, '854bcff9c2383ba0f9d3566077bdbae3');

  // Base layout с city + niche контекстом + AI чат + Telegram форма
  writeFile(`${dir}/src/layouts/Base.astro`, `---
interface Props { title: string; description: string; canonical?: string; schema?: object; }
const { title, description, canonical, schema } = Astro.props;
const url = canonical || new URL(Astro.url.pathname, Astro.site).href;
---
<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={url} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="ru_RU" />
  {schema && <script type="application/ld+json" set:html={JSON.stringify(schema)} />}
</head>
<body>
  <header><div class="container"><a href="/" class="logo">${t.emoji} ${t.niche} в ${city.nom}</a></div></header>
  <main class="container"><slot /></main>
  <footer>
    <div class="container">
      <p>${t.niche} в ${city.nom} · © 2026</p>
      <p style="font-size:11px;opacity:.6;margin-top:8px;">
        Также: <a href="https://${baseDomain}/" rel="noopener">${t.niche} по России</a> ·
        <a href="https://www.kalkremont.ru/" rel="noopener">Калькулятор ремонта</a>
      </p>
    </div>
  </footer>
  <button class="chat-btn" id="cb">💬</button>
  <div class="chat-wrap" id="cw">
    <div class="ch-head"><strong>Анна</strong><button id="cc">×</button></div>
    <div class="ch-msgs" id="cm"><div class="m bot"><div class="b">Здравствуйте! Помогу с ${t.nicheGen} в ${city.nom}. Что интересует?</div></div></div>
    <div class="ch-inp"><input id="ci" placeholder="Ваш вопрос..." /><button id="cs">➤</button></div>
  </div>
  <style is:global>
    *{box-sizing:border-box;}
    body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;margin:0;line-height:1.5;color:#1a1a1a;background:#fafafa;}
    .container{max-width:1100px;margin:0 auto;padding:0 20px;}
    header{background:white;border-bottom:1px solid #e6e8eb;padding:14px 0;}
    .logo{font-weight:700;font-size:18px;color:${t.color};text-decoration:none;}
    main{padding:24px 20px;min-height:60vh;}
    h1{font-size:26px;color:${t.color};margin:0 0 16px;}
    h2{font-size:20px;color:${t.color};margin-top:24px;}
    footer{background:#1a1a1a;color:#ccc;padding:24px 0;text-align:center;font-size:13px;}
    footer a{color:#999;}
    .chat-btn{position:fixed;bottom:20px;right:20px;width:56px;height:56px;border-radius:50%;background:${t.color};color:white;border:none;font-size:24px;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,0.2);z-index:999;}
    .chat-wrap{position:fixed;bottom:84px;right:20px;width:320px;background:white;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.2);display:none;flex-direction:column;z-index:998;}
    .chat-wrap.show{display:flex;}
    .ch-head{background:${t.color};color:white;padding:10px 14px;display:flex;justify-content:space-between;border-radius:12px 12px 0 0;}
    .ch-head button{background:none;border:none;color:white;font-size:22px;cursor:pointer;}
    .ch-msgs{padding:12px;max-height:280px;min-height:200px;overflow-y:auto;background:#fafafa;display:flex;flex-direction:column;gap:8px;}
    .m{display:flex;}.m.bot{justify-content:flex-start;}.m.user{justify-content:flex-end;}
    .b{max-width:80%;padding:8px 12px;border-radius:14px;font-size:13px;}
    .m.bot .b{background:white;}.m.user .b{background:${t.color};color:white;}
    .ch-inp{display:flex;gap:6px;padding:10px;border-top:1px solid #eee;}
    .ch-inp input{flex:1;padding:8px 12px;border:1.5px solid #ddd;border-radius:16px;font-size:13px;outline:none;}
    .ch-inp button{width:32px;height:32px;background:${t.color};color:white;border:none;border-radius:50%;cursor:pointer;}
  </style>
  <script is:inline>
    (function(){var w=document.getElementById('cw'),b=document.getElementById('cb'),c=document.getElementById('cc'),m=document.getElementById('cm'),i=document.getElementById('ci'),s=document.getElementById('cs');
    b.onclick=function(){w.classList.toggle('show');};c.onclick=function(){w.classList.remove('show');};
    function add(t,o){var d=document.createElement('div');d.className='m '+o;d.innerHTML='<div class="b">'+t.replace(/</g,'&lt;')+'</div>';m.appendChild(d);m.scrollTop=m.scrollHeight;}
    function ask(t){if(!t)return;add(t,'user');i.value='';add('...','bot');fetch('https://www.kalkremont.ru/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:t,context:{niche:'${t.niche}',city:'${city.nom}'},source:'${subdomain}/chat'})}).then(function(r){return r.json();}).then(function(j){m.lastChild.querySelector('.b').textContent=j.reply||'Не понял';}).catch(function(){m.lastChild.querySelector('.b').textContent='Ошибка. Оставьте телефон в форме.';});}
    s.onclick=function(){ask(i.value.trim());};i.onkeydown=function(e){if(e.key==='Enter')ask(i.value.trim());};
    })();
  </script>
</body>
</html>
`);

  // Главная страница — city × niche
  writeFile(`${dir}/src/pages/index.astro`, `---
import Base from '~/layouts/Base.astro';
const services = ${JSON.stringify(services)};
const faqs = ${JSON.stringify(faqs)};
---
<Base title="${t.niche} в ${city.nom} 2026 — ${t.tagline}" description="${t.niche} в ${city.nom}: цены от ${cityPrice.toLocaleString('ru-RU')} ₽. Бесплатный замер и расчёт.">
  <h1>${t.emoji} ${t.niche} в ${city.nom}</h1>
  <p style="font-size:17px;background:white;padding:14px 18px;border-left:4px solid ${t.color};border-radius:0 8px 8px 0;">${t.tagline} в ${city.nom}. Население ${city.nom}: ${city.priceMult > 1 ? '> 1 млн' : '500к-1млн'}.</p>

  <section style="background:white;padding:20px;border-radius:10px;margin:20px 0;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
    <h2>📞 Получить расчёт ${t.nicheGen} в ${city.nom}</h2>
    <form id="lf" style="display:flex;flex-direction:column;gap:10px;max-width:400px;">
      <input type="tel" name="phone" placeholder="+7 (___) ___-__-__" required minlength="10" style="padding:12px;border:2px solid #ddd;border-radius:8px;font-size:16px;" />
      <input type="text" name="name" placeholder="Имя" style="padding:12px;border:2px solid #ddd;border-radius:8px;font-size:16px;" />
      <button type="submit" style="padding:14px;background:${t.color};color:white;border:none;border-radius:8px;font-size:16px;font-weight:700;cursor:pointer;">Получить расчёт →</button>
    </form>
    <script is:inline>
      document.getElementById('lf').onsubmit=function(e){e.preventDefault();var d=new FormData(e.target);fetch('https://www.kalkremont.ru/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:d.get('phone'),name:d.get('name'),host:'${subdomain}',niche:'${t.niche}',city:'${city.slug}',source:'${subdomain}/index',url:location.href,page:'/'})}).then(function(){e.target.innerHTML='<p style="color:#27ae60;font-size:18px;">✅ Заявка принята! Перезвоним в течение 30 минут.</p>';});};
    </script>
  </section>

  <section>
    <h2>🛒 Услуги ${t.nicheGen} в ${city.nom}</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      {services.map((s) => (
        <div style="padding:16px;background:white;border:1px solid #e6e8eb;border-radius:10px;">
          <strong style="color:${t.color};font-size:15px;">{s.name}</strong>
          <div style="font-size:13px;color:#2980b9;margin:6px 0;font-weight:600;">{s.price}</div>
          <p style="font-size:13px;color:#555;margin:0;">{s.description}</p>
        </div>
      ))}
    </div>
  </section>

  <section>
    <h2>❓ FAQ — ${t.niche} в ${city.nom}</h2>
    {faqs.map((f) => (
      <details style="background:white;padding:14px 18px;border-radius:8px;margin:8px 0;border:1px solid #e6e8eb;">
        <summary style="font-weight:600;cursor:pointer;">{f.q}</summary>
        <p style="margin:10px 0 0;color:#555;">{f.a}</p>
      </details>
    ))}
  </section>

  <script type="application/ld+json" set:html={JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: '${t.niche} в ${city.nom}',
    description: '${t.niche} в ${city.nom}: ${t.tagline}',
    address: { '@type': 'PostalAddress', addressLocality: '${city.nom}', addressCountry: 'RU' },
    areaServed: { '@type': 'City', name: '${city.nom}' }
  })} />
  <script type="application/ld+json" set:html={JSON.stringify({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
  })} />
</Base>
`);

  // Sitemap
  writeFile(`${dir}/src/pages/sitemap.xml.ts`, `import type { APIRoute } from 'astro';
export const GET: APIRoute = ({ site }) => {
  const base = site?.href.replace(/\\/$/, '') ?? 'https://${subdomain}';
  const services = ${JSON.stringify(services.map(s => s.slug))};
  const urls = [base + '/', ...services.map((s) => base + '/uslugi/' + s + '/')];
  const now = new Date().toISOString().slice(0, 10);
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n' +
    urls.map((u) => '  <url><loc>' + u + '</loc><lastmod>' + now + '</lastmod></url>').join('\\n') + '\\n</urlset>';
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
`);

  // Pages for each service
  for (const s of services) {
    writeFile(`${dir}/src/pages/uslugi/${s.slug}.astro`, `---
import Base from '~/layouts/Base.astro';
---
<Base title="${s.name} в ${city.nom} — ${s.price} | ${t.niche}" description="${s.description} в ${city.nom}. Бесплатный замер.">
  <h1>${s.name} в ${city.nom}</h1>
  <p style="font-size:17px;background:white;padding:14px;border-left:4px solid ${t.color};border-radius:0 8px 8px 0;">${s.description}. Цена: <strong>${s.price}</strong> в ${city.nom}.</p>

  <section style="background:white;padding:20px;border-radius:10px;margin:20px 0;">
    <h2>📞 Заказать «${s.name}» в ${city.nom}</h2>
    <form id="lf2" style="display:flex;gap:8px;max-width:400px;">
      <input type="tel" name="phone" placeholder="+7 (___) ___-__-__" required minlength="10" style="flex:1;padding:12px;border:2px solid #ddd;border-radius:8px;" />
      <button type="submit" style="padding:12px 20px;background:${t.color};color:white;border:none;border-radius:8px;font-weight:700;cursor:pointer;">Заказать →</button>
    </form>
    <script is:inline>
      document.getElementById('lf2').onsubmit=function(e){e.preventDefault();fetch('https://www.kalkremont.ru/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:e.target.phone.value,host:'${subdomain}',niche:'${t.niche}',city:'${city.slug}',service:'${s.slug}',source:'${subdomain}/uslugi/${s.slug}',url:location.href,page:'/uslugi/${s.slug}/'})}).then(function(){e.target.innerHTML='<p style="color:#27ae60;">✅ Заявка принята!</p>';});};
    </script>
  </section>
</Base>
`);
  }
}

// Создаём apps для всех 48 поддоменов
const niches = ['ipoteka-remont', 'kuhni-zakaz', 'dom-stroy'];
let count = 0;
for (const n of niches) {
  console.log(`\n=== ${n} ===`);
  for (const c of CITIES) {
    generateApp(n, c);
    count++;
    console.log(`  ✓ ${n}-${c.slug}`);
  }
}
console.log(`\n✅ Создано ${count} apps для городских поддоменов`);
