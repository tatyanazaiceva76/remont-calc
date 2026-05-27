import type { APIRoute } from 'astro';

const services = [{"slug":"glyanec","name":"Глянцевые потолки","price":"от 450 ₽/м²","description":"Отражают свет, визуально расширяют комнату"},{"slug":"mat","name":"Матовые потолки","price":"от 350 ₽/м²","description":"Классика, выглядит как окрашенный потолок"},{"slug":"satin","name":"Сатиновые потолки","price":"от 400 ₽/м²","description":"Нежный жемчужный отблеск, премиум"},{"slug":"mnogourovnevye","name":"Многоуровневые","price":"от 1200 ₽/м²","description":"2-3 уровня, с подсветкой, дизайнерские"},{"slug":"fotopechat","name":"С фотопечатью","price":"от 1500 ₽/м²","description":"Любое изображение, звёздное небо, лофт"}];
const cities = [{"slug":"moskva","name":"Москве","nameNom":"Москва","priceMult":1.4},{"slug":"spb","name":"Санкт-Петербурге","nameNom":"СПб","priceMult":1.3},{"slug":"ekb","name":"Екатеринбурге","nameNom":"Екатеринбург","priceMult":1},{"slug":"kzn","name":"Казани","nameNom":"Казань","priceMult":1},{"slug":"nsk","name":"Новосибирске","nameNom":"Новосибирск","priceMult":0.95},{"slug":"krd","name":"Краснодаре","nameNom":"Краснодар","priceMult":1.05},{"slug":"nn","name":"Нижнем Новгороде","nameNom":"Нижний Новгород","priceMult":0.95},{"slug":"chel","name":"Челябинске","nameNom":"Челябинск","priceMult":0.85},{"slug":"ufa","name":"Уфе","nameNom":"Уфа","priceMult":0.95},{"slug":"sam","name":"Самаре","nameNom":"Самара","priceMult":0.95},{"slug":"rnd","name":"Ростове-на-Дону","nameNom":"Ростов-на-Дону","priceMult":1},{"slug":"vrn","name":"Воронеже","nameNom":"Воронеж","priceMult":0.85},{"slug":"perm","name":"Перми","nameNom":"Пермь","priceMult":0.85},{"slug":"vlg","name":"Волгограде","nameNom":"Волгоград","priceMult":0.8},{"slug":"tyumen","name":"Тюмени","nameNom":"Тюмень","priceMult":1},{"slug":"brn","name":"Барнауле","nameNom":"Барнаул","priceMult":0.8},{"slug":"astr","name":"Астрахани","nameNom":"Астрахань","priceMult":0.85},{"slug":"cbx","name":"Чебоксарах","nameNom":"Чебоксары","priceMult":0.85},{"slug":"irk","name":"Иркутске","nameNom":"Иркутск","priceMult":1},{"slug":"izh","name":"Ижевске","nameNom":"Ижевск","priceMult":0.9},{"slug":"kem","name":"Кемерово","nameNom":"Кемерово","priceMult":0.9},{"slug":"khv","name":"Хабаровске","nameNom":"Хабаровск","priceMult":1.1},{"slug":"kir","name":"Кирове","nameNom":"Киров","priceMult":0.85},{"slug":"kld","name":"Калининграде","nameNom":"Калининград","priceMult":1.05},{"slug":"lpk","name":"Липецке","nameNom":"Липецк","priceMult":0.9},{"slug":"oren","name":"Оренбурге","nameNom":"Оренбург","priceMult":0.85},{"slug":"pnz","name":"Пензе","nameNom":"Пенза","priceMult":0.85},{"slug":"rzn","name":"Рязани","nameNom":"Рязань","priceMult":0.9},{"slug":"sar","name":"Саратове","nameNom":"Саратов","priceMult":0.9},{"slug":"tlt","name":"Тольятти","nameNom":"Тольятти","priceMult":0.85},{"slug":"tul","name":"Туле","nameNom":"Тула","priceMult":1},{"slug":"vvo","name":"Владивостоке","nameNom":"Владивосток","priceMult":1.15},{"slug":"yar","name":"Ярославле","nameNom":"Ярославль","priceMult":0.95},{"slug":"mah","name":"Махачкале","nameNom":"Махачкала","priceMult":0.85},{"slug":"tomsk","name":"Томске","nameNom":"Томск","priceMult":0.95},{"slug":"belgorod","name":"Белгороде","nameNom":"Белгород","priceMult":0.9},{"slug":"sochi","name":"Сочи","nameNom":"Сочи","priceMult":1.2},{"slug":"magnitogorsk","name":"Магнитогорске","nameNom":"Магнитогорск","priceMult":0.9},{"slug":"yakutsk","name":"Якутске","nameNom":"Якутск","priceMult":1.35},{"slug":"orel","name":"Орле","nameNom":"Орёл","priceMult":0.85}];

export const GET: APIRoute = ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? 'https://natyazhnoi-master24.ru';
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
