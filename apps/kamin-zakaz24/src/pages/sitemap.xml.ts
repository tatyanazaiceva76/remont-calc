import type { APIRoute } from 'astro';

const services = [{"slug":"drovianye","name":"Дровяные камины","price":"от 80 000 ₽","description":"Чугунные топки, печи длительного горения, аромат дров"},{"slug":"gazovye","name":"Газовые камины","price":"от 60 000 ₽","description":"Без дымохода, имитация пламени, простой монтаж"},{"slug":"elektrokamin","name":"Электрокамины","price":"от 15 000 ₽","description":"Без вытяжки, для квартиры, эффект пламени"},{"slug":"biokamin","name":"Биокамины","price":"от 25 000 ₽","description":"На биоэтаноле, без дыма и дымохода"},{"slug":"dymokhody","name":"Дымоходы и монтаж","price":"от 30 000 ₽","description":"Нержавейка, сэндвич, керамика. Под ключ."}];
const cities = [{"slug":"moskva","name":"Москве и области","nameNom":"Москва","priceMult":1.4},{"slug":"spb","name":"СПб и Ленобласти","nameNom":"СПб","priceMult":1.3},{"slug":"ekb","name":"Екатеринбурге","nameNom":"Екатеринбург","priceMult":1},{"slug":"nsk","name":"Новосибирске","nameNom":"Новосибирск","priceMult":0.95},{"slug":"krd","name":"Краснодаре","nameNom":"Краснодар","priceMult":1.05}];

export const GET: APIRoute = ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? 'https://kamin-zakaz24.ru';
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
