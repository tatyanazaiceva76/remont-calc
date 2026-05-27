import type { APIRoute } from 'astro';

const services = [{"slug":"ekonom","name":"Эконом-сегмент","price":"от 12 000 ₽","description":"Сталь 1.2 мм, базовая фурнитура, 2 замка"},{"slug":"sredniy","name":"Средний сегмент","price":"от 25 000 ₽","description":"Сталь 1.5-2 мм, шумоизоляция, теплоизоляция"},{"slug":"premium","name":"Премиум","price":"от 60 000 ₽","description":"Сталь 2-3 мм, MDF-отделка, защита класса 3"},{"slug":"protivovzlomnye","name":"Противовзломные","price":"от 80 000 ₽","description":"Сертификат RC2/RC3, штифты, противосъёмные петли"}];
const cities = [{"slug":"moskva","name":"Москве","nameNom":"Москва","priceMult":1.4},{"slug":"spb","name":"Санкт-Петербурге","nameNom":"СПб","priceMult":1.3},{"slug":"ekb","name":"Екатеринбурге","nameNom":"Екатеринбург","priceMult":1},{"slug":"kzn","name":"Казани","nameNom":"Казань","priceMult":1},{"slug":"nsk","name":"Новосибирске","nameNom":"Новосибирск","priceMult":0.95},{"slug":"krd","name":"Краснодаре","nameNom":"Краснодар","priceMult":1.05}];

export const GET: APIRoute = ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? 'https://dveri-stalnye24.ru';
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
