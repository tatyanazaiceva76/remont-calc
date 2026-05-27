import type { APIRoute } from 'astro';

const services = [{"slug":"kredit-na-remont","name":"Потребительский кредит","price":"от 8% годовых","description":"Без залога, на 5-7 лет, до 5 млн ₽"},{"slug":"ipoteka-na-remont","name":"Ипотека на ремонт","price":"от 6.5% годовых","description":"Под залог квартиры, на 25 лет, до 30 млн ₽"},{"slug":"kreditnaya-karta","name":"Кредитная карта","price":"0% на 365 дней","description":"Для небольшого ремонта, без переплат"},{"slug":"refinansirovanie","name":"Рефинансирование","price":"от 7% годовых","description":"Снижаем ставку по действующему кредиту"}];
const cities = [{"slug":"moskva","name":"Москве","nameNom":"Москва","priceMult":1.4},{"slug":"spb","name":"Санкт-Петербурге","nameNom":"СПб","priceMult":1.3},{"slug":"ekb","name":"Екатеринбурге","nameNom":"Екатеринбург","priceMult":1},{"slug":"kzn","name":"Казани","nameNom":"Казань","priceMult":1},{"slug":"nsk","name":"Новосибирске","nameNom":"Новосибирск","priceMult":0.95},{"slug":"krd","name":"Краснодаре","nameNom":"Краснодар","priceMult":1.05},{"slug":"nn","name":"Нижнем Новгороде","nameNom":"Нижний Новгород","priceMult":0.95},{"slug":"chel","name":"Челябинске","nameNom":"Челябинск","priceMult":0.85},{"slug":"ufa","name":"Уфе","nameNom":"Уфа","priceMult":0.95},{"slug":"sam","name":"Самаре","nameNom":"Самара","priceMult":0.95},{"slug":"rnd","name":"Ростове-на-Дону","nameNom":"Ростов-на-Дону","priceMult":1},{"slug":"vrn","name":"Воронеже","nameNom":"Воронеж","priceMult":0.85},{"slug":"perm","name":"Перми","nameNom":"Пермь","priceMult":0.85},{"slug":"vlg","name":"Волгограде","nameNom":"Волгоград","priceMult":0.8},{"slug":"tyumen","name":"Тюмени","nameNom":"Тюмень","priceMult":1},{"slug":"brn","name":"Барнауле","nameNom":"Барнаул","priceMult":0.8}];

export const GET: APIRoute = ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? 'https://ipoteka-remont.ru';
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
