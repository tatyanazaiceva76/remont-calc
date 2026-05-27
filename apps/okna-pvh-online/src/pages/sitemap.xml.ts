import type { APIRoute } from 'astro';

const services = [{"slug":"standart","name":"Стандартные окна","price":"от 8 000 ₽","description":"3-камерный профиль, 1-камерный стеклопакет, эконом"},{"slug":"premium","name":"Премиум окна","price":"от 15 000 ₽","description":"5-камерный профиль, 2-камерный стеклопакет, тёплые"},{"slug":"tonirovanie","name":"Тонированные окна","price":"от 12 000 ₽","description":"Затемнение от солнца, защита от перегрева"},{"slug":"protivovzlomnye","name":"Противовзломные","price":"от 20 000 ₽","description":"Класс защиты RC2/RC3, для 1 этажа и таунхаусов"},{"slug":"energosberegayushchie","name":"Энергосберегающие","price":"от 18 000 ₽","description":"Низкоэмиссионное стекло, экономия на отоплении 30%"}];
const cities = [{"slug":"moskva","name":"Москве","nameNom":"Москва","priceMult":1.4},{"slug":"spb","name":"Санкт-Петербурге","nameNom":"СПб","priceMult":1.3},{"slug":"ekb","name":"Екатеринбурге","nameNom":"Екатеринбург","priceMult":1},{"slug":"kzn","name":"Казани","nameNom":"Казань","priceMult":1},{"slug":"nsk","name":"Новосибирске","nameNom":"Новосибирск","priceMult":0.95},{"slug":"krd","name":"Краснодаре","nameNom":"Краснодар","priceMult":1.05},{"slug":"nn","name":"Нижнем Новгороде","nameNom":"Нижний Новгород","priceMult":0.95},{"slug":"chel","name":"Челябинске","nameNom":"Челябинск","priceMult":0.85}];

export const GET: APIRoute = ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? 'https://okna-pvh-online.ru';
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
