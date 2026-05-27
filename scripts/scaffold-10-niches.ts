#!/usr/bin/env bun
// Генерирует apps/{niche}/ для всех 10 ниш из шаблона.
// Каждое app — отдельный Astro проект с уникальным контентом.

import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { NICHES } from './niche-templates';

const ROOT = '/Users/mac/remont-calc';
const APPS_DIR = `${ROOT}/apps`;

function writeFile(path: string, content: string) {
  const dir = path.substring(0, path.lastIndexOf('/'));
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(path, content);
}

function generateApp(niche: typeof NICHES[0]) {
  const dir = `${APPS_DIR}/${niche.projectName}`;
  console.log(`\n▶ ${niche.projectName} (${niche.niche})`);

  // package.json
  writeFile(`${dir}/package.json`, JSON.stringify({
    name: `kalkremont-${niche.projectName}`,
    type: 'module',
    version: '0.1.0',
    scripts: { dev: 'astro dev', build: 'astro build' },
    dependencies: { astro: '^4.16.18' }
  }, null, 2));

  // tsconfig.json
  writeFile(`${dir}/tsconfig.json`, JSON.stringify({
    extends: 'astro/tsconfigs/strict',
    compilerOptions: { baseUrl: '.', paths: { '~/*': ['src/*'] } }
  }, null, 2));

  // astro.config.mjs
  writeFile(`${dir}/astro.config.mjs`, `import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://${niche.domain}',
  trailingSlash: 'always'
});
`);

  // env.d.ts
  writeFile(`${dir}/src/env.d.ts`, `/// <reference types="astro/client" />`);

  // robots.txt
  writeFile(`${dir}/public/robots.txt`, `User-agent: *
Allow: /

Sitemap: https://${niche.domain}/sitemap.xml
Host: ${niche.domain}
`);

  // config.ts
  writeFile(`${dir}/src/config.ts`, `export const SITE_CONFIG = {
  domain: '${niche.domain}',
  siteName: '${niche.niche}',
  tagline: '${niche.tagline}',
  emoji: '${niche.emoji}',
  color: '${niche.color}',
  metrikaId: 99000001
};
`);

  // data/niche.ts
  writeFile(`${dir}/src/data/niche.ts`, `// Auto-generated niche config for ${niche.domain}
export const NICHE = ${JSON.stringify(niche, null, 2)};
`);

  // layouts/Base.astro
  writeFile(`${dir}/src/layouts/Base.astro`, `---
import { SITE_CONFIG } from '~/config';
interface Props {
  title: string;
  description: string;
  canonical?: string;
  schema?: object;
}
const { title, description, canonical, schema } = Astro.props;
const canonicalUrl = canonical || new URL(Astro.url.pathname, Astro.site).href;
---
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonicalUrl} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonicalUrl} />
    <meta property="og:locale" content="ru_RU" />
    {schema && <script type="application/ld+json" set:html={JSON.stringify(schema)} />}
  </head>
  <body>
    <header class="site-header">
      <div class="container">
        <a href="/" class="logo">${niche.emoji} ${niche.niche}</a>
        <nav>
          <a href="/uslugi/">Услуги</a>
          <a href="/goroda/">Города</a>
          <a href="/faq/">FAQ</a>
        </nav>
      </div>
    </header>
    <main class="container"><slot /></main>
    <footer class="site-footer">
      <div class="container">
        <p>© ${niche.niche} 2026 · Все права защищены</p>
        <p><a href="/kontakty/">Контакты</a> · <a href="/politika/">Политика конфиденциальности</a></p>
      </div>
    </footer>
    <style is:global>
      * { box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; margin: 0; line-height: 1.5; color: #1a1a1a; background: #fafafa; }
      .container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
      .site-header { background: white; border-bottom: 1px solid #e6e8eb; padding: 14px 0; position: sticky; top: 0; z-index: 100; }
      .site-header .container { display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; }
      .logo { font-weight: 700; font-size: 18px; color: ${niche.color}; text-decoration: none; }
      nav { display: flex; gap: 16px; }
      nav a { color: #555; text-decoration: none; font-size: 14px; }
      nav a:hover { color: ${niche.color}; }
      main { padding: 24px 20px; min-height: 70vh; }
      h1 { font-size: 28px; color: ${niche.color}; }
      h2 { font-size: 22px; color: ${niche.color}; margin-top: 28px; }
      h3 { font-size: 18px; }
      .site-footer { background: #1a1a1a; color: #ccc; padding: 24px 0; margin-top: 48px; text-align: center; font-size: 13px; }
      .site-footer a { color: #999; }
      @media (max-width: 600px) { .site-header .container { flex-direction: column; gap: 8px; } nav { gap: 12px; } h1 { font-size: 22px; } }
    </style>
  </body>
</html>
`);

  // pages/index.astro
  const servicesData = JSON.stringify(niche.services);
  const citiesData = JSON.stringify(niche.cities);
  const faqsData = JSON.stringify(niche.faqs);

  writeFile(`${dir}/src/pages/index.astro`, `---
import Base from '~/layouts/Base.astro';
const services = ${servicesData};
const cities = ${citiesData};
const faqs = ${faqsData};

const title = '${niche.niche} 2026 — ${niche.tagline}';
const description = '${niche.description}';
const schema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: '${niche.niche}',
  description: '${niche.description}',
  areaServed: { '@type': 'Country', name: 'Россия' },
  provider: { '@type': 'Organization', name: '${niche.niche}' }
};
---
<Base title={title} description={description} schema={schema}>
  <h1>${niche.emoji} ${niche.niche}</h1>
  <p class="lead">${niche.tagline}</p>

  <section class="lead-form">
    <h2>💡 Получить расчёт</h2>
    <p>Оставьте телефон — перезвоним в течение 30 минут и пришлём предложение:</p>
    <form id="lead-form" onsubmit="event.preventDefault();fetch('https://www.kalkremont.ru/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:this.phone.value,name:this.name?.value,source:'${niche.domain}',page:location.pathname})}).then(()=>{this.innerHTML='<p style=\\'color:#27ae60;font-size:18px;\\'>✅ Заявка принята! Перезвоним в течение 30 минут.</p>'});">
      <input type="tel" name="phone" placeholder="+7 (___) ___-__-__" required minlength="10" />
      <input type="text" name="name" placeholder="Как к вам обращаться" />
      <button type="submit">Получить расчёт →</button>
    </form>
  </section>

  <section>
    <h2>🛒 Услуги</h2>
    <div class="services">
      {services.map((s) => (
        <a href={\`/uslugi/\${s.slug}/\`} class="service-card">
          <strong>{s.name}</strong>
          <span class="price">{s.price}</span>
          <p>{s.description}</p>
        </a>
      ))}
    </div>
  </section>

  <section>
    <h2>🏙 Работаем в городах</h2>
    <div class="cities">
      {cities.map((c) => (
        <a href={\`/goroda/\${c.slug}/\`} class="city-card">
          <strong>{c.nameNom}</strong>
          <span>${niche.niche} в {c.name}</span>
        </a>
      ))}
    </div>
  </section>

  <section>
    <h2>❓ FAQ</h2>
    <div class="faqs">
      {faqs.map((f) => (
        <details class="faq">
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  </section>

  <script type="application/ld+json" set:html={JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  })} />
</Base>
<style>
  .lead { font-size: 17px; padding: 16px 20px; background: white; border-left: 4px solid ${niche.color}; border-radius: 0 8px 8px 0; }
  .lead-form { background: white; padding: 24px; border-radius: 12px; margin: 24px 0; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
  .lead-form form { display: flex; flex-direction: column; gap: 10px; max-width: 400px; }
  .lead-form input { padding: 12px 14px; border: 1.5px solid #e6e8eb; border-radius: 8px; font-size: 16px; }
  .lead-form input:focus { border-color: ${niche.color}; outline: none; }
  .lead-form button { padding: 14px; background: ${niche.color}; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 700; cursor: pointer; }
  .services { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .service-card { display: block; padding: 16px 18px; background: white; border: 1px solid #e6e8eb; border-radius: 10px; text-decoration: none; color: #1a1a1a; transition: all 0.2s; }
  .service-card:hover { border-color: ${niche.color}; transform: translateY(-2px); }
  .service-card strong { display: block; font-size: 16px; color: ${niche.color}; }
  .price { display: inline-block; font-size: 13px; font-weight: 600; color: #2980b9; margin: 4px 0; }
  .service-card p { font-size: 13px; color: #555; margin: 6px 0 0; }
  .cities { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
  .city-card { display: block; padding: 12px; background: white; border: 1px solid #e6e8eb; border-radius: 8px; text-decoration: none; color: #1a1a1a; }
  .city-card:hover { border-color: ${niche.color}; }
  .city-card strong { color: ${niche.color}; display: block; }
  .city-card span { font-size: 12px; color: #888; }
  .faqs { display: flex; flex-direction: column; gap: 8px; }
  .faq { background: white; padding: 14px 16px; border-radius: 8px; border: 1px solid #e6e8eb; }
  .faq summary { font-weight: 600; cursor: pointer; }
  .faq p { margin: 10px 0 0; color: #555; }
  @media (max-width: 700px) { .services, .cities { grid-template-columns: 1fr; } }
</style>
`);

  // pages/uslugi/[slug].astro — динамическая страница услуги
  writeFile(`${dir}/src/pages/uslugi/[slug].astro`, `---
import Base from '~/layouts/Base.astro';
const services = ${servicesData};
const cities = ${citiesData};

export function getStaticPaths() {
  const services = ${servicesData};
  return services.map((s) => ({ params: { slug: s.slug }, props: { service: s } }));
}

const { service } = Astro.props;
const url = new URL(Astro.url.pathname, Astro.site).href;

const title = service.name + ' — ' + service.price + ' | ${niche.niche}';
const description = service.description + ' ' + '${niche.tagline}';
---
<Base title={title} description={description} canonical={url}>
  <nav class="bc"><a href="/">${niche.niche}</a> › <a href="/uslugi/">Услуги</a> › <span>{service.name}</span></nav>

  <h1>{service.name}</h1>
  <p class="lead">{service.description}. Цена: <strong>{service.price}</strong>.</p>

  <section class="lead-form">
    <h2>💡 Заказать «{service.name}»</h2>
    <p>Оставьте телефон — перезвоним в течение 30 минут:</p>
    <form id="lead-form-svc" onsubmit="event.preventDefault();fetch('https://www.kalkremont.ru/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:this.phone.value,name:this.name?.value,service:'{service.slug}',source:'${niche.domain}',page:location.pathname})}).then(()=>{this.innerHTML='<p style=\\'color:#27ae60;font-size:18px;\\'>✅ Заявка принята!</p>'});">
      <input type="tel" name="phone" placeholder="+7 (___) ___-__-__" required minlength="10" />
      <button type="submit">Заказать →</button>
    </form>
  </section>

  <section>
    <h2>🏙 «{service.name}» в городах</h2>
    <div class="cities">
      {cities.map((c) => (
        <a href={\`/uslugi/{service.slug}/v-\${c.slug}/\`} class="city-card">
          <strong>{c.nameNom}</strong>
        </a>
      ))}
    </div>
  </section>
</Base>
<style>
  .bc { font-size: 13px; color: #888; }
  .bc a { color: #888; }
  .lead { padding: 16px; background: white; border-left: 4px solid ${niche.color}; border-radius: 0 8px 8px 0; }
  .lead-form { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
  .lead-form form { display: flex; gap: 8px; max-width: 500px; }
  .lead-form input { flex: 1; padding: 12px; border: 1.5px solid #e6e8eb; border-radius: 8px; }
  .lead-form button { padding: 12px 20px; background: ${niche.color}; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
  .cities { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; }
  .city-card { display: block; padding: 12px; background: white; border: 1px solid #e6e8eb; border-radius: 8px; text-decoration: none; color: #1a1a1a; }
  .city-card strong { color: ${niche.color}; }
  @media (max-width: 700px) { .cities { grid-template-columns: 1fr 1fr; } }
</style>
`);

  // pages/uslugi/index.astro
  writeFile(`${dir}/src/pages/uslugi/index.astro`, `---
import Base from '~/layouts/Base.astro';
const services = ${servicesData};
---
<Base title="Услуги ${niche.nicheGen}" description="Полный список услуг по ${niche.nicheDat} с ценами 2026.">
  <h1>Услуги ${niche.nicheGen}</h1>
  <div class="services">
    {services.map((s) => (
      <a href={\`/uslugi/\${s.slug}/\`} class="service-card">
        <strong>{s.name}</strong>
        <span>{s.price}</span>
        <p>{s.description}</p>
      </a>
    ))}
  </div>
</Base>
<style>
  .services { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .service-card { display: block; padding: 16px; background: white; border: 1px solid #e6e8eb; border-radius: 10px; text-decoration: none; color: #1a1a1a; }
  .service-card:hover { border-color: ${niche.color}; }
  .service-card strong { display: block; color: ${niche.color}; }
  @media (max-width: 700px) { .services { grid-template-columns: 1fr; } }
</style>
`);

  // pages/uslugi/[slug]/v-[city].astro — услуга × город
  writeFile(`${dir}/src/pages/uslugi/[slug]/v-[city].astro`, `---
import Base from '~/layouts/Base.astro';

export function getStaticPaths() {
  const services = ${servicesData};
  const cities = ${citiesData};
  const paths = [];
  for (const s of services) {
    for (const c of cities) {
      paths.push({ params: { slug: s.slug, city: c.slug }, props: { service: s, city: c } });
    }
  }
  return paths;
}

const { service, city } = Astro.props;
const url = new URL(Astro.url.pathname, Astro.site).href;

const title = service.name + ' в ' + city.name + ' — ${niche.niche}';
const description = service.description + ' в ' + city.name + '. ' + service.price + '. Замер бесплатно, быстрый монтаж.';
---
<Base title={title} description={description} canonical={url}>
  <nav class="bc"><a href="/">${niche.niche}</a> › <a href="/uslugi/">Услуги</a> › <a href={\`/uslugi/\${service.slug}/\`}>{service.name}</a> › <span>в {city.name}</span></nav>

  <h1>{service.name} в {city.name}</h1>
  <p class="lead">{service.description} в {city.name}. <strong>Цена: {service.price}</strong>.</p>

  <section class="lead-form">
    <h2>💡 Заказать в {city.name}</h2>
    <form onsubmit="event.preventDefault();fetch('https://www.kalkremont.ru/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:this.phone.value,city:'{city.slug}',service:'{service.slug}',source:'${niche.domain}',page:location.pathname})}).then(()=>{this.innerHTML='<p style=\\'color:#27ae60;font-size:18px;\\'>✅ Заявка принята!</p>'});">
      <input type="tel" name="phone" placeholder="+7 (___) ___-__-__" required minlength="10" />
      <button type="submit">Получить расчёт →</button>
    </form>
  </section>
</Base>
<style>
  .bc { font-size: 13px; color: #888; }
  .bc a { color: #888; }
  .lead { padding: 16px; background: white; border-left: 4px solid ${niche.color}; border-radius: 0 8px 8px 0; }
  .lead-form { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
  .lead-form form { display: flex; gap: 8px; max-width: 500px; }
  .lead-form input { flex: 1; padding: 12px; border: 1.5px solid #e6e8eb; border-radius: 8px; }
  .lead-form button { padding: 12px 20px; background: ${niche.color}; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
</style>
`);

  // pages/goroda/[city].astro
  writeFile(`${dir}/src/pages/goroda/[city].astro`, `---
import Base from '~/layouts/Base.astro';

export function getStaticPaths() {
  const cities = ${citiesData};
  return cities.map((c) => ({ params: { city: c.slug }, props: { city: c } }));
}

const { city } = Astro.props;
const services = ${servicesData};
const url = new URL(Astro.url.pathname, Astro.site).href;

const title = '${niche.niche} в ' + city.name + ' 2026 — ${niche.tagline}';
const description = '${niche.niche} в ' + city.name + '. Все услуги, цены 2026, отзывы.';
---
<Base title={title} description={description} canonical={url}>
  <nav class="bc"><a href="/">${niche.niche}</a> › <a href="/goroda/">Города</a> › <span>в {city.name}</span></nav>

  <h1>${niche.emoji} ${niche.niche} в {city.name}</h1>
  <p class="lead">Полный спектр услуг по ${niche.nicheDat} в {city.name}. Бесплатный замер, выезд мастера.</p>

  <section class="lead-form">
    <h2>💡 Получить расчёт в {city.name}</h2>
    <form onsubmit="event.preventDefault();fetch('https://www.kalkremont.ru/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:this.phone.value,city:'{city.slug}',source:'${niche.domain}',page:location.pathname})}).then(()=>{this.innerHTML='<p style=\\'color:#27ae60;font-size:18px;\\'>✅ Заявка принята!</p>'});">
      <input type="tel" name="phone" placeholder="+7 (___) ___-__-__" required minlength="10" />
      <button type="submit">Заказать →</button>
    </form>
  </section>

  <section>
    <h2>🛒 Услуги в {city.name}</h2>
    <div class="services">
      {services.map((s) => (
        <a href={\`/uslugi/\${s.slug}/v-{city.slug}/\`} class="service-card">
          <strong>{s.name}</strong>
          <span>{s.price}</span>
        </a>
      ))}
    </div>
  </section>
</Base>
<style>
  .bc { font-size: 13px; color: #888; }
  .bc a { color: #888; }
  .lead { padding: 16px; background: white; border-left: 4px solid ${niche.color}; border-radius: 0 8px 8px 0; }
  .lead-form { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
  .lead-form form { display: flex; gap: 8px; max-width: 500px; }
  .lead-form input { flex: 1; padding: 12px; border: 1.5px solid #e6e8eb; border-radius: 8px; }
  .lead-form button { padding: 12px 20px; background: ${niche.color}; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
  .services { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .service-card { display: block; padding: 16px; background: white; border: 1px solid #e6e8eb; border-radius: 10px; text-decoration: none; color: #1a1a1a; }
  .service-card:hover { border-color: ${niche.color}; }
  .service-card strong { color: ${niche.color}; display: block; }
  @media (max-width: 700px) { .services { grid-template-columns: 1fr; } }
</style>
`);

  // pages/goroda/index.astro
  writeFile(`${dir}/src/pages/goroda/index.astro`, `---
import Base from '~/layouts/Base.astro';
const cities = ${citiesData};
---
<Base title="${niche.niche} в городах России" description="Список городов где доступны услуги.">
  <h1>${niche.niche} в городах России</h1>
  <div class="cities">
    {cities.map((c) => (
      <a href={\`/goroda/\${c.slug}/\`} class="city-card">
        <strong>{c.nameNom}</strong>
      </a>
    ))}
  </div>
</Base>
<style>
  .cities { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; }
  .city-card { padding: 14px; background: white; border: 1px solid #e6e8eb; border-radius: 8px; text-decoration: none; color: ${niche.color}; text-align: center; }
  .city-card:hover { border-color: ${niche.color}; }
  @media (max-width: 700px) { .cities { grid-template-columns: 1fr 1fr; } }
</style>
`);

  // pages/faq/index.astro
  writeFile(`${dir}/src/pages/faq/index.astro`, `---
import Base from '~/layouts/Base.astro';
const faqs = ${faqsData};
---
<Base title="FAQ ${niche.nicheGen}" description="Ответы на главные вопросы по ${niche.nicheDat}.">
  <h1>❓ FAQ — ${niche.niche}</h1>
  <div class="faqs">
    {faqs.map((f, i) => (
      <details class="faq" open={i < 2}>
        <summary>{f.q}</summary>
        <p>{f.a}</p>
      </details>
    ))}
  </div>

  <script type="application/ld+json" set:html={JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  })} />
</Base>
<style>
  .faqs { display: flex; flex-direction: column; gap: 10px; }
  .faq { background: white; padding: 14px 18px; border-radius: 8px; border: 1px solid #e6e8eb; }
  .faq summary { font-weight: 600; cursor: pointer; }
  .faq[open] { border-color: ${niche.color}; }
  .faq p { margin: 12px 0 0; color: #555; }
</style>
`);

  // pages/kontakty.astro
  writeFile(`${dir}/src/pages/kontakty.astro`, `---
import Base from '~/layouts/Base.astro';
---
<Base title="Контакты — ${niche.niche}" description="Связаться с нами по ${niche.nicheDat}.">
  <h1>📞 Контакты</h1>
  <p>Email: <a href="mailto:info@${niche.domain}">info@${niche.domain}</a></p>
  <p>Работаем по всей России, выезд бесплатный.</p>
</Base>
`);

  // pages/sitemap.xml.ts
  writeFile(`${dir}/src/pages/sitemap.xml.ts`, `import type { APIRoute } from 'astro';

const services = ${servicesData};
const cities = ${citiesData};

export const GET: APIRoute = ({ site }) => {
  const base = site?.href.replace(/\\/$/, '') ?? 'https://${niche.domain}';
  const urls: string[] = [
    base + '/',
    base + '/uslugi/',
    base + '/goroda/',
    base + '/faq/',
    base + '/kontakty/'
  ];
  for (const s of services) {
    urls.push(base + '/uslugi/' + s.slug + '/');
    for (const c of cities) {
      urls.push(base + '/uslugi/' + s.slug + '/v-' + c.slug + '/');
    }
  }
  for (const c of cities) {
    urls.push(base + '/goroda/' + c.slug + '/');
  }

  const now = new Date().toISOString().slice(0, 10);
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n' +
    urls.map((u) => '  <url><loc>' + u + '</loc><lastmod>' + now + '</lastmod></url>').join('\\n') +
    '\\n</urlset>';

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
`);

  // robots в public — уже выше

  // Yandex verification файл создаётся скриптом launch (с UIN)

  console.log(`  ✓ ${niche.projectName}: ${5 + niche.services.length + niche.cities.length + niche.services.length * niche.cities.length} pages`);
}

console.log(`🚀 Генерация ${NICHES.length} apps...`);
for (const n of NICHES) generateApp(n);
console.log('\n✅ Готово');
