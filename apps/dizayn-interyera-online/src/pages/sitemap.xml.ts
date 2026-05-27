import type { APIRoute } from 'astro';

const services = [{"slug":"osnovnoy-paket","name":"Базовый пакет","price":"от 1 500 ₽/м²","description":"Планировка + развёртки + спецификация (без визуализации)"},{"slug":"standartnyy-paket","name":"Стандарт","price":"от 2 500 ₽/м²","description":"Базовый + 3D-визуализация всех комнат"},{"slug":"premium-paket","name":"Премиум","price":"от 4 500 ₽/м²","description":"Стандарт + авторский надзор + подбор материалов"},{"slug":"avtor-nadzor","name":"Авторский надзор","price":"от 50 000 ₽/мес","description":"Контроль ремонта по проекту, выезды на объект"}];
const cities = [{"slug":"moskva","name":"Москве","nameNom":"Москва","priceMult":1.4},{"slug":"spb","name":"Санкт-Петербурге","nameNom":"СПб","priceMult":1.3},{"slug":"ekb","name":"Екатеринбурге","nameNom":"Екатеринбург","priceMult":1},{"slug":"kzn","name":"Казани","nameNom":"Казань","priceMult":1},{"slug":"nsk","name":"Новосибирске","nameNom":"Новосибирск","priceMult":0.95}];

export const GET: APIRoute = ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? 'https://dizayn-interyera-online.ru';
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
