#!/usr/bin/env bun
// МАССИВНОЕ расширение контента: для каждой из 10 ниш добавляем 2 новых маршрута:
// /scenariy/{slug}/v-{city}/ — 4 сценария × 40 городов = 160 URL/ниша × 10 = 1600 URL
// /komnaty/{N}/v-{city}/ — 5 комнатностей × 40 городов = 200 URL/ниша × 10 = 2000 URL
// Также: /rayony/{city}/{district}/ для top 16 городов с районами = ~80 URL/ниша × 10 = 800 URL

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { NICHES } from './niche-templates';

const ROOT = '/Users/mac/remont-calc';

const SCENARIOS = [
  { slug: 'srochno', name: 'Срочный', emoji: '⚡', priceMult: 1.4, desc: 'Завершение за 7-14 дней' },
  { slug: 'ekonom', name: 'Эконом', emoji: '💰', priceMult: 0.7, desc: 'Минимальный бюджет, базовые материалы' },
  { slug: 'standart', name: 'Стандарт', emoji: '✅', priceMult: 1.0, desc: 'Оптимальное соотношение цена/качество' },
  { slug: 'premium', name: 'Премиум', emoji: '✨', priceMult: 2.0, desc: 'Топовые материалы и сервис' }
];

const ROOMS = [
  { num: 1, name: 'студия', emoji: '🏠', area: 25 },
  { num: 2, name: '1-комнатная', emoji: '🏘', area: 35 },
  { num: 3, name: '2-комнатная', emoji: '🏘', area: 55 },
  { num: 4, name: '3-комнатная', emoji: '🏢', area: 80 },
  { num: 5, name: 'большая', emoji: '🏛', area: 120 }
];

function writeFile(path: string, content: string) {
  const dir = path.substring(0, path.lastIndexOf('/'));
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(path, content);
}

function expandNiche(niche: typeof NICHES[0]) {
  const dir = `${ROOT}/apps/${niche.projectName}`;
  console.log(`\n▶ ${niche.projectName}`);

  // === 1. /scenariy/[scenario]/index.astro — хаб сценариев
  writeFile(`${dir}/src/pages/scenariy/index.astro`, `---
import Base from '~/layouts/Base.astro';
const scenarios = ${JSON.stringify(SCENARIOS)};
---
<Base title="Сценарии ${niche.nicheGen}" description="Выберите сценарий: ${SCENARIOS.map(s => s.name.toLowerCase()).join(', ')}.">
  <h1>📋 Сценарии ${niche.nicheGen}</h1>
  <div class="grid">
    {scenarios.map((s) => (
      <a href={\`/scenariy/\${s.slug}/\`} class="card">
        <span class="e">{s.emoji}</span>
        <strong>{s.name}</strong>
        <p>{s.desc}</p>
      </a>
    ))}
  </div>
</Base>
<style>
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .card{display:block;padding:16px;background:white;border:1px solid #e6e8eb;border-radius:10px;text-decoration:none;color:#1a1a1a;}
  .card:hover{border-color:${niche.color};}
  .e{font-size:32px;display:block;}
  .card strong{display:block;color:${niche.color};margin:6px 0;}
  .card p{font-size:13px;color:#666;margin:0;}
  @media (max-width: 600px){.grid{grid-template-columns:1fr;}}
</style>
`);

  // === 2. /scenariy/[scenario].astro — лендинг сценария (с городами)
  writeFile(`${dir}/src/pages/scenariy/[scenario].astro`, `---
import Base from '~/layouts/Base.astro';
const scenarios = ${JSON.stringify(SCENARIOS)};
const cities = ${JSON.stringify(niche.cities)};

export function getStaticPaths() {
  const scenarios = ${JSON.stringify(SCENARIOS)};
  return scenarios.map((s) => ({ params: { scenario: s.slug }, props: { sc: s } }));
}

const { sc } = Astro.props;
const url = new URL(Astro.url.pathname, Astro.site).href;
---
<Base title={\`\${sc.name} ${niche.niche.toLowerCase()} — \${sc.desc}\`} description={sc.desc + ' в городах России.'} canonical={url}>
  <nav class="bc"><a href="/">${niche.niche}</a> › <a href="/scenariy/">Сценарии</a> › <span>{sc.name}</span></nav>
  <h1>{sc.emoji} {sc.name} ${niche.niche.toLowerCase()}</h1>
  <p class="lead">{sc.desc}. Множитель цены: <strong>×{sc.priceMult}</strong> к стандартной.</p>

  <section class="cities">
    <h2>🏙 Выберите город</h2>
    <div class="grid">
      {cities.map((c) => (
        <a href={\`/scenariy/\${sc.slug}/v-\${c.slug}/\`} class="city">
          <strong>{c.nameNom}</strong>
        </a>
      ))}
    </div>
  </section>

  <section class="cta">
    <h2>💡 Получить расчёт</h2>
    <form onsubmit="event.preventDefault();fetch('https://www.kalkremont.ru/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:this.phone.value,source:'${niche.domain}/scenariy/{sc.slug}',scenario:'{sc.slug}',niche:'${niche.niche}',page:location.pathname})}).then(()=>{this.innerHTML='<p style=\\'color:#27ae60;\\'>✅ Заявка принята!</p>'});">
      <input type="tel" name="phone" placeholder="+7 (___) ___-__-__" required minlength="10" />
      <button>Получить →</button>
    </form>
  </section>
</Base>
<style>
  .bc{font-size:13px;color:#888;}
  .bc a{color:#888;}
  .lead{padding:16px;background:white;border-left:4px solid ${niche.color};border-radius:0 8px 8px 0;}
  .lead strong{color:${niche.color};}
  .grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;}
  .city{padding:10px;background:white;border:1px solid #e6e8eb;border-radius:6px;text-decoration:none;text-align:center;}
  .city:hover{border-color:${niche.color};}
  .city strong{color:${niche.color};font-size:13px;}
  .cta{background:white;padding:18px;border-radius:10px;margin-top:20px;}
  .cta form{display:flex;gap:8px;max-width:400px;}
  .cta input{flex:1;padding:12px;border:1.5px solid #ddd;border-radius:8px;}
  .cta button{padding:12px 18px;background:${niche.color};color:white;border:none;border-radius:8px;font-weight:700;cursor:pointer;}
  @media (max-width: 700px){.grid{grid-template-columns:1fr 1fr 1fr;}}
</style>
`);

  // === 3. /scenariy/[scenario]/v-[city].astro — главный масштаб контента
  writeFile(`${dir}/src/pages/scenariy/[scenario]/v-[city].astro`, `---
import Base from '~/layouts/Base.astro';
const scenarios = ${JSON.stringify(SCENARIOS)};
const cities = ${JSON.stringify(niche.cities)};

export function getStaticPaths() {
  const scenarios = ${JSON.stringify(SCENARIOS)};
  const cities = ${JSON.stringify(niche.cities)};
  const paths = [];
  for (const s of scenarios) for (const c of cities) {
    paths.push({ params: { scenario: s.slug, city: c.slug }, props: { sc: s, city: c } });
  }
  return paths;
}

const { sc, city } = Astro.props;
const url = new URL(Astro.url.pathname, Astro.site).href;
const services = ${JSON.stringify(niche.services)};

// Цены адаптированные под сценарий и город
const basePrice = parseInt((services[0].price.match(/\\d+/)||['10000'])[0]) * 1000;
const finalPrice = Math.round(basePrice * sc.priceMult * city.priceMult);

const title = sc.name + ' ${niche.niche.toLowerCase()} в ' + city.name + ' — от ' + finalPrice.toLocaleString('ru-RU') + ' ₽';
const description = sc.desc + ' в ' + city.name + '. ' + '${niche.tagline}';
---
<Base title={title} description={description} canonical={url}>
  <nav class="bc"><a href="/">${niche.niche}</a> › <a href="/scenariy/">Сценарии</a> › <a href={\`/scenariy/\${sc.slug}/\`}>{sc.name}</a> › <span>в {city.name}</span></nav>
  <h1>{sc.emoji} {sc.name} ${niche.niche.toLowerCase()} в {city.name}</h1>
  <p class="lead">{sc.desc} в {city.name}. Цена: <strong>от {finalPrice.toLocaleString('ru-RU')} ₽</strong>.</p>

  <section class="price">
    <h2>💰 Цены {sc.name.toLowerCase()} в {city.name}</h2>
    <div class="prices">
      <div><span>Эконом</span><strong>{Math.round(finalPrice * 0.7).toLocaleString('ru-RU')} ₽</strong></div>
      <div><span>Стандарт</span><strong>{finalPrice.toLocaleString('ru-RU')} ₽</strong></div>
      <div><span>Премиум</span><strong>{Math.round(finalPrice * 1.5).toLocaleString('ru-RU')} ₽</strong></div>
    </div>
  </section>

  <section class="cta">
    <h2>📞 Получить расчёт</h2>
    <form onsubmit="event.preventDefault();fetch('https://www.kalkremont.ru/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:this.phone.value,source:'${niche.domain}/scenariy',scenario:'{sc.slug}',city:'{city.slug}',niche:'${niche.niche}',page:location.pathname,host:'${niche.domain}'})}).then(()=>{this.innerHTML='<p style=\\'color:#27ae60;\\'>✅ Заявка принята!</p>'});">
      <input type="tel" name="phone" placeholder="+7 (___) ___-__-__" required minlength="10" />
      <button>Получить расчёт →</button>
    </form>
  </section>

  <section>
    <h2>🛒 Другие услуги в {city.name}</h2>
    <div class="services">
      {services.map((s) => (
        <a href={\`/uslugi/\${s.slug}/v-{city.slug}/\`} class="svc">
          <strong>{s.name}</strong>
          <span>{s.price}</span>
        </a>
      ))}
    </div>
  </section>
</Base>
<style>
  .bc{font-size:13px;color:#888;}
  .bc a{color:#888;}
  .lead{padding:16px;background:white;border-left:4px solid ${niche.color};}
  .lead strong{color:${niche.color};}
  .price{background:linear-gradient(135deg,#fff7e6,#ffe9c8);padding:20px;border-radius:12px;margin:20px 0;}
  .prices{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
  .prices > div{background:white;padding:12px;border-radius:8px;text-align:center;}
  .prices span{font-size:11px;color:#888;display:block;}
  .prices strong{font-size:18px;color:${niche.color};display:block;}
  .cta{background:white;padding:18px;border-radius:10px;}
  .cta form{display:flex;gap:8px;max-width:400px;}
  .cta input{flex:1;padding:12px;border:1.5px solid #ddd;border-radius:8px;}
  .cta button{padding:12px 18px;background:${niche.color};color:white;border:none;border-radius:8px;font-weight:700;cursor:pointer;}
  .services{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
  .svc{display:block;padding:12px;background:white;border:1px solid #e6e8eb;border-radius:8px;text-decoration:none;color:#1a1a1a;}
  .svc:hover{border-color:${niche.color};}
  .svc strong{color:${niche.color};display:block;}
  @media (max-width:700px){.prices{grid-template-columns:1fr;}.services{grid-template-columns:1fr;}}
</style>
`);

  // === 4. /komnaty/[rooms].astro и /komnaty/[rooms]/v-[city].astro — комнатность
  writeFile(`${dir}/src/pages/komnaty/[rooms]/v-[city].astro`, `---
import Base from '~/layouts/Base.astro';
const rooms = ${JSON.stringify(ROOMS)};
const cities = ${JSON.stringify(niche.cities)};

export function getStaticPaths() {
  const rooms = ${JSON.stringify(ROOMS)};
  const cities = ${JSON.stringify(niche.cities)};
  const paths = [];
  for (const r of rooms) for (const c of cities) {
    paths.push({ params: { rooms: String(r.num), city: c.slug }, props: { room: r, city: c } });
  }
  return paths;
}

const { room, city } = Astro.props;
const url = new URL(Astro.url.pathname, Astro.site).href;
const services = ${JSON.stringify(niche.services)};

const basePrice = parseInt((services[0].price.match(/\\d+/)||['10000'])[0]) * 1000;
const finalPrice = Math.round(basePrice * city.priceMult * (room.area / 50));

const title = '${niche.niche} ' + room.name + ' квартиры в ' + city.name + ' — ' + finalPrice.toLocaleString('ru-RU') + ' ₽';
const description = '${niche.niche} ' + room.name + ' квартиры (~' + room.area + ' м²) в ' + city.name + '. Бесплатный замер и расчёт.';
---
<Base title={title} description={description} canonical={url}>
  <nav class="bc"><a href="/">${niche.niche}</a> › <a href="/komnaty/">Комнаты</a> › <a href={\`/komnaty/\${room.num}/\`}>{room.name}</a> › <span>в {city.name}</span></nav>
  <h1>{room.emoji} ${niche.niche} {room.name} квартиры в {city.name}</h1>
  <p class="lead">{room.name.charAt(0).toUpperCase() + room.name.slice(1)} ({room.area} м²) в {city.name}. Цена: <strong>{finalPrice.toLocaleString('ru-RU')} ₽</strong>.</p>

  <section class="cta">
    <h2>📞 Получить расчёт для {room.name}</h2>
    <form onsubmit="event.preventDefault();fetch('https://www.kalkremont.ru/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:this.phone.value,source:'${niche.domain}/komnaty',rooms:'{room.num}-комн',city:'{city.slug}',area:{room.area},niche:'${niche.niche}',page:location.pathname,host:'${niche.domain}'})}).then(()=>{this.innerHTML='<p style=\\'color:#27ae60;\\'>✅ Заявка принята!</p>'});">
      <input type="tel" name="phone" placeholder="+7 (___) ___-__-__" required minlength="10" />
      <button>Получить расчёт →</button>
    </form>
  </section>
</Base>
<style>
  .bc{font-size:13px;color:#888;}
  .bc a{color:#888;}
  .lead{padding:16px;background:white;border-left:4px solid ${niche.color};}
  .lead strong{color:${niche.color};}
  .cta{background:white;padding:18px;border-radius:10px;margin-top:20px;}
  .cta form{display:flex;gap:8px;max-width:400px;}
  .cta input{flex:1;padding:12px;border:1.5px solid #ddd;border-radius:8px;}
  .cta button{padding:12px 18px;background:${niche.color};color:white;border:none;border-radius:8px;font-weight:700;cursor:pointer;}
</style>
`);

  // === 5. /komnaty/[rooms].astro — хаб комнатности
  writeFile(`${dir}/src/pages/komnaty/[rooms].astro`, `---
import Base from '~/layouts/Base.astro';
const rooms = ${JSON.stringify(ROOMS)};
const cities = ${JSON.stringify(niche.cities)};

export function getStaticPaths() {
  const rooms = ${JSON.stringify(ROOMS)};
  return rooms.map((r) => ({ params: { rooms: String(r.num) }, props: { room: r } }));
}

const { room } = Astro.props;
const url = new URL(Astro.url.pathname, Astro.site).href;
---
<Base title={\`${niche.niche} \${room.name} квартиры\`} description={'${niche.niche} ' + room.name + ' (~' + room.area + ' м²) — выберите город.'} canonical={url}>
  <nav class="bc"><a href="/">${niche.niche}</a> › <a href="/komnaty/">Комнаты</a> › <span>{room.name}</span></nav>
  <h1>{room.emoji} ${niche.niche} {room.name} квартиры</h1>
  <p class="lead">Средняя площадь: {room.area} м². Выберите город для расчёта.</p>

  <section>
    <h2>🏙 Выберите город</h2>
    <div class="grid">
      {cities.map((c) => (
        <a href={\`/komnaty/\${room.num}/v-\${c.slug}/\`} class="c">
          <strong>{c.nameNom}</strong>
        </a>
      ))}
    </div>
  </section>
</Base>
<style>
  .bc{font-size:13px;color:#888;}
  .lead{padding:16px;background:white;border-left:4px solid ${niche.color};}
  .grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;}
  .c{padding:10px;background:white;border:1px solid #e6e8eb;border-radius:6px;text-decoration:none;text-align:center;}
  .c:hover{border-color:${niche.color};}
  .c strong{color:${niche.color};font-size:13px;}
  @media (max-width:700px){.grid{grid-template-columns:1fr 1fr 1fr;}}
</style>
`);

  // === 6. /komnaty/index.astro — общий хаб
  writeFile(`${dir}/src/pages/komnaty/index.astro`, `---
import Base from '~/layouts/Base.astro';
const rooms = ${JSON.stringify(ROOMS)};
---
<Base title="${niche.niche} по комнатности" description="${niche.niche} студия / 1-комн / 2-комн / 3-комн / большая квартира.">
  <h1>🏘 ${niche.niche} по типу квартиры</h1>
  <div class="grid">
    {rooms.map((r) => (
      <a href={\`/komnaty/\${r.num}/\`} class="card">
        <span class="e">{r.emoji}</span>
        <strong>{r.name}</strong>
        <p>~{r.area} м²</p>
      </a>
    ))}
  </div>
</Base>
<style>
  .grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
  .card{display:block;padding:16px;background:white;border:1px solid #e6e8eb;border-radius:10px;text-decoration:none;color:#1a1a1a;text-align:center;}
  .card:hover{border-color:${niche.color};}
  .e{font-size:32px;display:block;}
  .card strong{display:block;color:${niche.color};margin:6px 0;}
  @media (max-width:600px){.grid{grid-template-columns:1fr 1fr;}}
</style>
`);

  console.log(`  ✓ ${niche.projectName}: +scenariy(${SCENARIOS.length}×${niche.cities.length}=${SCENARIOS.length*niche.cities.length}) +komnaty(${ROOMS.length}×${niche.cities.length}=${ROOMS.length*niche.cities.length}) URL`);
}

console.log('🚀 МАССИВНОЕ расширение контента 10 ниш...\n');
for (const n of NICHES) expandNiche(n);
console.log('\n✅ Готово. Запусти build чтобы увидеть итог.');
