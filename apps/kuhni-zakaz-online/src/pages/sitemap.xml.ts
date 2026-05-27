import type { APIRoute } from 'astro';

const services = [{"slug":"klassika","name":"Классические кухни","price":"от 80 000 ₽/пог.м","description":"МДФ или массив, патина, фрезеровка"},{"slug":"sovremennyy","name":"Современный стиль","price":"от 60 000 ₽/пог.м","description":"Акрил, пластик, ровные фасады"},{"slug":"loft","name":"Лофт","price":"от 70 000 ₽/пог.м","description":"Бетон, металл, дерево необработанное"},{"slug":"skandinaviya","name":"Скандинавский стиль","price":"от 65 000 ₽/пог.м","description":"Светлые тона, минимализм, дерево"}];
const cities = [{"slug":"moskva","name":"Москве","nameNom":"Москва","priceMult":1.4},{"slug":"spb","name":"Санкт-Петербурге","nameNom":"СПб","priceMult":1.3},{"slug":"ekb","name":"Екатеринбурге","nameNom":"Екатеринбург","priceMult":1},{"slug":"kzn","name":"Казани","nameNom":"Казань","priceMult":1},{"slug":"nsk","name":"Новосибирске","nameNom":"Новосибирск","priceMult":0.95},{"slug":"krd","name":"Краснодаре","nameNom":"Краснодар","priceMult":1.05},{"slug":"nn","name":"Нижнем Новгороде","nameNom":"Нижний Новгород","priceMult":0.95},{"slug":"chel","name":"Челябинске","nameNom":"Челябинск","priceMult":0.85},{"slug":"ufa","name":"Уфе","nameNom":"Уфа","priceMult":0.95},{"slug":"sam","name":"Самаре","nameNom":"Самара","priceMult":0.95}];

export const GET: APIRoute = ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? 'https://kuhni-zakaz-online.ru';
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
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => '  <url><loc>' + u + '</loc><lastmod>' + now + '</lastmod></url>').join('\n') +
    '\n</urlset>';

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
