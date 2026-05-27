import type { APIRoute } from 'astro';

const services = [{"slug":"karkasnye","name":"Каркасные дома","price":"от 25 000 ₽/м²","description":"Быстрая постройка 2-3 месяца, тёплые, цена 1.5 млн на 60 м²"},{"slug":"gazobeton","name":"Дома из газобетона","price":"от 35 000 ₽/м²","description":"Тёплые, долговечные, 4-6 месяцев"},{"slug":"kirpichnye","name":"Кирпичные дома","price":"от 55 000 ₽/м²","description":"Премиум, 8-12 месяцев, срок службы 150+ лет"},{"slug":"iz-brusa","name":"Дома из бруса","price":"от 30 000 ₽/м²","description":"Экологичные, аромат дерева, требуют усадки 1 год"}];
const cities = [{"slug":"moskva","name":"Подмосковье","nameNom":"Подмосковье","priceMult":1.4},{"slug":"spb","name":"Ленобласти","nameNom":"Ленобласть","priceMult":1.3},{"slug":"ekb","name":"Свердловской области","nameNom":"Свердловская обл.","priceMult":1},{"slug":"kzn","name":"Татарстане","nameNom":"Татарстан","priceMult":1},{"slug":"nsk","name":"Новосибирской области","nameNom":"Новосибирская обл.","priceMult":0.95},{"slug":"krd","name":"Краснодарском крае","nameNom":"Краснодарский край","priceMult":1.1}];

export const GET: APIRoute = ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? 'https://dom-stroy-online.ru';
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
