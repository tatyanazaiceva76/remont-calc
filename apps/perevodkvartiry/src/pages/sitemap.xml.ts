import type { APIRoute } from 'astro';

const services = [{"slug":"proekt","name":"Проект перепланировки","price":"от 25 000 ₽","description":"Архитектор + чертежи + спецификация"},{"slug":"soglasovanie","name":"Согласование под ключ","price":"от 60 000 ₽","description":"Проект + БТИ + жил.инспекция + новый паспорт"},{"slug":"uzakonenie","name":"Узаконить уже сделанную","price":"от 80 000 ₽","description":"Перепланировку \"задним числом\" с уже снесёнными стенами"},{"slug":"konsultaciya","name":"Юридическая консультация","price":"от 3 000 ₽","description":"Можно ли согласовать вашу планировку"}];
const cities = [{"slug":"moskva","name":"Москве","nameNom":"Москва","priceMult":1.4},{"slug":"spb","name":"Санкт-Петербурге","nameNom":"СПб","priceMult":1.3},{"slug":"ekb","name":"Екатеринбурге","nameNom":"Екатеринбург","priceMult":1},{"slug":"kzn","name":"Казани","nameNom":"Казань","priceMult":1},{"slug":"nsk","name":"Новосибирске","nameNom":"Новосибирск","priceMult":0.95}];

export const GET: APIRoute = ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? 'https://perevodkvartiry.ru';
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
