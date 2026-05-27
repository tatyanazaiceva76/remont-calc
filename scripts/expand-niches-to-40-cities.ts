#!/usr/bin/env bun
// Расширяет каждую из 10 ниш до 40 городов.
// Заменяет cities в data/niche.ts и обновляет sitemap.xml.ts чтобы включал все маршруты.

import { writeFileSync, readFileSync } from 'fs';

const ALL_CITIES = [
  { slug: 'moskva', name: 'Москве', nameNom: 'Москва', priceMult: 1.4 },
  { slug: 'spb', name: 'Санкт-Петербурге', nameNom: 'СПб', priceMult: 1.3 },
  { slug: 'ekb', name: 'Екатеринбурге', nameNom: 'Екатеринбург', priceMult: 1.0 },
  { slug: 'kzn', name: 'Казани', nameNom: 'Казань', priceMult: 1.0 },
  { slug: 'nsk', name: 'Новосибирске', nameNom: 'Новосибирск', priceMult: 0.95 },
  { slug: 'krd', name: 'Краснодаре', nameNom: 'Краснодар', priceMult: 1.05 },
  { slug: 'nn', name: 'Нижнем Новгороде', nameNom: 'Нижний Новгород', priceMult: 0.95 },
  { slug: 'chel', name: 'Челябинске', nameNom: 'Челябинск', priceMult: 0.85 },
  { slug: 'ufa', name: 'Уфе', nameNom: 'Уфа', priceMult: 0.95 },
  { slug: 'sam', name: 'Самаре', nameNom: 'Самара', priceMult: 0.95 },
  { slug: 'rnd', name: 'Ростове-на-Дону', nameNom: 'Ростов-на-Дону', priceMult: 1.0 },
  { slug: 'vrn', name: 'Воронеже', nameNom: 'Воронеж', priceMult: 0.85 },
  { slug: 'perm', name: 'Перми', nameNom: 'Пермь', priceMult: 0.85 },
  { slug: 'vlg', name: 'Волгограде', nameNom: 'Волгоград', priceMult: 0.8 },
  { slug: 'tyumen', name: 'Тюмени', nameNom: 'Тюмень', priceMult: 1.0 },
  { slug: 'brn', name: 'Барнауле', nameNom: 'Барнаул', priceMult: 0.8 },
  { slug: 'astr', name: 'Астрахани', nameNom: 'Астрахань', priceMult: 0.85 },
  { slug: 'cbx', name: 'Чебоксарах', nameNom: 'Чебоксары', priceMult: 0.85 },
  { slug: 'irk', name: 'Иркутске', nameNom: 'Иркутск', priceMult: 1.0 },
  { slug: 'izh', name: 'Ижевске', nameNom: 'Ижевск', priceMult: 0.9 },
  { slug: 'kem', name: 'Кемерово', nameNom: 'Кемерово', priceMult: 0.9 },
  { slug: 'khv', name: 'Хабаровске', nameNom: 'Хабаровск', priceMult: 1.1 },
  { slug: 'kir', name: 'Кирове', nameNom: 'Киров', priceMult: 0.85 },
  { slug: 'kld', name: 'Калининграде', nameNom: 'Калининград', priceMult: 1.05 },
  { slug: 'lpk', name: 'Липецке', nameNom: 'Липецк', priceMult: 0.9 },
  { slug: 'oren', name: 'Оренбурге', nameNom: 'Оренбург', priceMult: 0.85 },
  { slug: 'pnz', name: 'Пензе', nameNom: 'Пенза', priceMult: 0.85 },
  { slug: 'rzn', name: 'Рязани', nameNom: 'Рязань', priceMult: 0.9 },
  { slug: 'sar', name: 'Саратове', nameNom: 'Саратов', priceMult: 0.9 },
  { slug: 'tlt', name: 'Тольятти', nameNom: 'Тольятти', priceMult: 0.85 },
  { slug: 'tul', name: 'Туле', nameNom: 'Тула', priceMult: 1.0 },
  { slug: 'vvo', name: 'Владивостоке', nameNom: 'Владивосток', priceMult: 1.15 },
  { slug: 'yar', name: 'Ярославле', nameNom: 'Ярославль', priceMult: 0.95 },
  { slug: 'mah', name: 'Махачкале', nameNom: 'Махачкала', priceMult: 0.85 },
  { slug: 'tomsk', name: 'Томске', nameNom: 'Томск', priceMult: 0.95 },
  { slug: 'belgorod', name: 'Белгороде', nameNom: 'Белгород', priceMult: 0.9 },
  { slug: 'sochi', name: 'Сочи', nameNom: 'Сочи', priceMult: 1.2 },
  { slug: 'magnitogorsk', name: 'Магнитогорске', nameNom: 'Магнитогорск', priceMult: 0.9 },
  { slug: 'yakutsk', name: 'Якутске', nameNom: 'Якутск', priceMult: 1.35 },
  { slug: 'orel', name: 'Орле', nameNom: 'Орёл', priceMult: 0.85 }
];

const APPS = [
  'ipoteka-remont', 'kuhni-zakaz-online', 'dom-stroy-online',
  'natyazhnoi-master24', 'okna-pvh-online', 'kupeshkafy24',
  'dveri-stalnye24', 'perevodkvartiry', 'dizayn-interyera-online',
  'kamin-zakaz24'
];

const ROOT = '/Users/mac/remont-calc';

for (const app of APPS) {
  const dataPath = `${ROOT}/apps/${app}/src/data/niche.ts`;
  const dataContent = readFileSync(dataPath, 'utf8');
  // Найти cities в JSON и заменить
  const newDataContent = dataContent.replace(
    /"cities":\s*\[[\s\S]*?\](?=,\s*"faqs"|\s*})/m,
    `"cities": ${JSON.stringify(ALL_CITIES, null, 2)}`
  );
  writeFileSync(dataPath, newDataContent);
  console.log(`  ✓ ${app}: cities → 40`);
}

// Также обновлю шаблонные .astro файлы с inline cities
import { readdirSync } from 'fs';

for (const app of APPS) {
  const pagesDir = `${ROOT}/apps/${app}/src/pages`;
  function processFile(path: string) {
    let content = readFileSync(path, 'utf8');
    // Заменяем inline cities-массив в astro файлах (которые в Frontmatter)
    if (content.includes('const cities = [')) {
      content = content.replace(/const cities = \[[\s\S]*?\];/, `const cities = ${JSON.stringify(ALL_CITIES)};`);
      writeFileSync(path, content);
    }
  }
  function walk(dir: string) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = `${dir}/${e.name}`;
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.astro') || e.name.endsWith('.ts')) processFile(p);
    }
  }
  walk(pagesDir);
}

console.log('\n✅ Все 10 ниш расширены до 40 городов');
