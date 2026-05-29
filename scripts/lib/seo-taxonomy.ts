/**
 * seo-taxonomy.ts — справочники для скоринга и генерации (ЭТАП 4/6).
 * Значения коммерческой ценности/спроса — экспертная оценка под ремонтные ниши РФ (0..1).
 */

// Города: slug → {название, спрос 0..1} (по размеру рынка/платёжеспособности)
export const CITIES: Record<string, { name: string; demand: number; loc: string }> = {
  moskva: { name: 'Москва', demand: 1.0, loc: 'в Москве' },
  spb: { name: 'Санкт-Петербург', demand: 0.85, loc: 'в Санкт-Петербурге' },
  ekb: { name: 'Екатеринбург', demand: 0.62, loc: 'в Екатеринбурге' },
  nsk: { name: 'Новосибирск', demand: 0.6, loc: 'в Новосибирске' },
  kzn: { name: 'Казань', demand: 0.58, loc: 'в Казани' },
  krd: { name: 'Краснодар', demand: 0.57, loc: 'в Краснодаре' },
  nn: { name: 'Нижний Новгород', demand: 0.5, loc: 'в Нижнем Новгороде' },
  chel: { name: 'Челябинск', demand: 0.47, loc: 'в Челябинске' },
  sam: { name: 'Самара', demand: 0.47, loc: 'в Самаре' },
  rnd: { name: 'Ростов-на-Дону', demand: 0.5, loc: 'в Ростове-на-Дону' },
  ufa: { name: 'Уфа', demand: 0.46, loc: 'в Уфе' },
  vrn: { name: 'Воронеж', demand: 0.45, loc: 'в Воронеже' },
  perm: { name: 'Пермь', demand: 0.44, loc: 'в Перми' },
  vlg: { name: 'Волгоград', demand: 0.42, loc: 'в Волгограде' },
  tyumen: { name: 'Тюмень', demand: 0.45, loc: 'в Тюмени' },
  brn: { name: 'Барнаул', demand: 0.35, loc: 'в Барнауле' },
  astr: { name: 'Астрахань', demand: 0.32, loc: 'в Астрахани' },
  izh: { name: 'Ижевск', demand: 0.35, loc: 'в Ижевске' },
  irk: { name: 'Иркутск', demand: 0.36, loc: 'в Иркутске' },
  kem: { name: 'Кемерово', demand: 0.33, loc: 'в Кемерове' },
  khv: { name: 'Хабаровск', demand: 0.36, loc: 'в Хабаровске' },
  kir: { name: 'Киров', demand: 0.32, loc: 'в Кирове' },
  kld: { name: 'Калининград', demand: 0.4, loc: 'в Калининграде' },
  lpk: { name: 'Липецк', demand: 0.33, loc: 'в Липецке' },
  oren: { name: 'Оренбург', demand: 0.33, loc: 'в Оренбурге' },
  pnz: { name: 'Пенза', demand: 0.32, loc: 'в Пензе' },
  rzn: { name: 'Рязань', demand: 0.34, loc: 'в Рязани' },
  sar: { name: 'Саратов', demand: 0.36, loc: 'в Саратове' },
  tlt: { name: 'Тольятти', demand: 0.34, loc: 'в Тольятти' },
  tul: { name: 'Тула', demand: 0.36, loc: 'в Туле' },
  vvo: { name: 'Владивосток', demand: 0.38, loc: 'во Владивостоке' },
  yar: { name: 'Ярославль', demand: 0.36, loc: 'в Ярославле' },
  cbx: { name: 'Чебоксары', demand: 0.31, loc: 'в Чебоксарах' },
};

// Сервис-слуги → {название, коммерческая ценность 0..1} (по среднему чеку/марже)
export const SERVICES: Record<string, { name: string; value: number }> = {
  'remont-kvartir': { name: 'Ремонт квартир', value: 1.0 },
  'remont-kvartiry': { name: 'Ремонт квартиры', value: 1.0 },
  'remont-pod-klyuch': { name: 'Ремонт под ключ', value: 1.0 },
  'kapitalnyy-remont': { name: 'Капитальный ремонт', value: 0.95 },
  'dizayn-interyera': { name: 'Дизайн интерьера', value: 0.9 },
  'remont-vannoy': { name: 'Ремонт ванной', value: 0.85 },
  'remont-vannoy-komnaty': { name: 'Ремонт ванной комнаты', value: 0.85 },
  'remont-kuhni': { name: 'Ремонт кухни', value: 0.82 },
  'remont-komnaty': { name: 'Ремонт комнаты', value: 0.78 },
  'natyazhnye-potolki': { name: 'Натяжные потолки', value: 0.7 },
  'kuhni-na-zakaz': { name: 'Кухни на заказ', value: 0.72 },
  'shkafy-kupe': { name: 'Шкафы-купе', value: 0.68 },
  'ustanovka-dverey': { name: 'Установка дверей', value: 0.6 },
  'zamena-okon': { name: 'Замена окон', value: 0.65 },
  'okna': { name: 'Окна ПВХ', value: 0.65 },
  'elektromontazh': { name: 'Электромонтаж', value: 0.6 },
  'santehnicheskie-raboty': { name: 'Сантехнические работы', value: 0.6 },
  'styazhka-pola': { name: 'Стяжка пола', value: 0.55 },
  'balkony-i-lodzhii': { name: 'Остекление балконов', value: 0.58 },
  'uteplenie-balkona': { name: 'Утепление балкона', value: 0.5 },
  'uteplenie-fasada': { name: 'Утепление фасада', value: 0.55 },
  'poklejka-oboev': { name: 'Поклейка обоев', value: 0.42 },
  'zvukoizolyatsiya': { name: 'Звукоизоляция', value: 0.5 },
  'montazh-konditsionerov': { name: 'Монтаж кондиционеров', value: 0.55 },
  'uborka-posle-remonta': { name: 'Уборка после ремонта', value: 0.32 },
  'uborka-posle-stroyki': { name: 'Уборка после стройки', value: 0.32 },
  'snos-i-demontazh': { name: 'Снос и демонтаж', value: 0.35 },
  'demontazh-rabot': { name: 'Демонтажные работы', value: 0.35 },
  // Типы ремонта квартир — последний сегмент в /regiony/{city}/{district}/{type}/
  'euro': { name: 'Евроремонт', value: 0.92 },
  'designer': { name: 'Дизайнерский ремонт', value: 0.95 },
  'capital': { name: 'Капитальный ремонт', value: 0.9 },
  'cosmetic': { name: 'Косметический ремонт', value: 0.6 },
};

/**
 * Локативные слаги городов из URL → ключ CITIES.
 * Покрывает форму /{service}/v-{город-в-предложном-падеже}/ (v-moskve, v-yaroslavle …).
 * Короткие слаги (v-spb, v-ekb, izh) матчатся напрямую по ключу CITIES (см. cityKeyFromSlug).
 */
export const LOC_SLUG_TO_KEY: Record<string, string> = {
  moskve: 'moskva', 'sankt-peterburge': 'spb', ekaterinburge: 'ekb', novosibirske: 'nsk',
  kazani: 'kzn', 'nizhnem-novgorode': 'nn', chelyabinske: 'chel', samare: 'sam', ufe: 'ufa',
  'rostove-na-donu': 'rnd', krasnodare: 'krd', voronezhe: 'vrn', permi: 'perm', volgograde: 'vlg',
  tyumeni: 'tyumen', barnaule: 'brn', tolyatti: 'tlt', saratove: 'sar', orenburge: 'oren',
  izhevske: 'izh', irkutske: 'irk', habarovske: 'khv', yaroslavle: 'yar', astrahani: 'astr',
  kirove: 'kir', kaliningrade: 'kld', lipetske: 'lpk', penze: 'pnz', ryazani: 'rzn', tule: 'tul',
  vladivostoke: 'vvo', cheboksarah: 'cbx',
};

/** Слаг города из URL/сабдомена → ключ CITIES (или '' если неизвестен). */
export function cityKeyFromSlug(raw: string): string {
  const s = raw.toLowerCase().replace(/^v-/, '');
  if (CITIES[s]) return s;           // короткий слаг: spb, ekb, izh, moskva …
  if (LOC_SLUG_TO_KEY[s]) return LOC_SLUG_TO_KEY[s]; // предложный падеж: moskve → moskva
  return '';
}

// Нишевые домены → {услуга, ценность} (для нишевой сети)
export const NICHE_BY_DOMAIN: Record<string, { name: string; value: number; serviceSlug: string }> = {
  'kalkremont.ru': { name: 'Ремонт квартир', value: 1.0, serviceSlug: 'remont-kvartir' },
  'natyazhnoi-master24.ru': { name: 'Натяжные потолки', value: 0.7, serviceSlug: 'natyazhnye-potolki' },
  'okna-pvh-online.ru': { name: 'Окна ПВХ', value: 0.65, serviceSlug: 'okna' },
  'dveri-stalnye24.ru': { name: 'Стальные двери', value: 0.6, serviceSlug: 'ustanovka-dverey' },
  'kuhni-zakaz-online.ru': { name: 'Кухни на заказ', value: 0.72, serviceSlug: 'kuhni-na-zakaz' },
  'kupeshkafy24.ru': { name: 'Шкафы-купе', value: 0.68, serviceSlug: 'shkafy-kupe' },
  'kamin-zakaz24.ru': { name: 'Камины и порталы', value: 0.66, serviceSlug: 'kamin' },
  'dizayn-interyera-online.ru': { name: 'Дизайн интерьера', value: 0.9, serviceSlug: 'dizayn-interyera' },
  'ipoteka-remont.ru': { name: 'Ремонт в ипотеку', value: 0.8, serviceSlug: 'remont-pod-klyuch' },
  'dom-stroy-online.ru': { name: 'Строительство домов', value: 0.92, serviceSlug: 'stroitelstvo-domov' },
  'perevodkvartiry.ru': { name: 'Перевод в нежилой фонд', value: 0.7, serviceSlug: 'perevod-v-nezhiloy' },
};

export function prettifySlug(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
