#!/usr/bin/env bun
// Конфиги для 10 новых ниш. Каждая ниша = 1 домен.
// Данные используются для генерации Astro-сайтов.

export interface NicheTemplate {
  domain: string;
  projectName: string;     // CF Pages project name (без kalkremont- префикса)
  niche: string;           // "Ипотека на ремонт"
  nicheNom: string;        // "Ипотека на ремонт"
  nicheGen: string;        // "ипотеки на ремонт"
  nicheDat: string;        // "ипотеке на ремонт"
  emoji: string;
  color: string;           // primary color #c0392b
  tagline: string;         // 1-line slogan
  description: string;     // SEO meta
  leadPrice: [number, number];  // диапазон цены лида для clients
  services: { slug: string; name: string; price: string; description: string }[];
  cities: { slug: string; name: string; nameNom: string; priceMult: number }[];
  faqs: { q: string; a: string }[];
}

export const NICHES: NicheTemplate[] = [
  {
    domain: 'ipoteka-remont.ru',
    projectName: 'ipoteka-remont',
    niche: 'Ипотека на ремонт',
    nicheNom: 'Ипотека на ремонт',
    nicheGen: 'ипотеки на ремонт',
    nicheDat: 'ипотеке на ремонт',
    emoji: '🏦',
    color: '#1abc9c',
    tagline: 'Ипотечный кредит на ремонт квартиры от 8% годовых',
    description: 'Ипотека и потребительский кредит на ремонт квартиры 2026. Калькулятор платежей, банки с лучшими условиями, оформление онлайн.',
    leadPrice: [5000, 30000],
    services: [
      { slug: 'kredit-na-remont', name: 'Потребительский кредит', price: 'от 8% годовых', description: 'Без залога, на 5-7 лет, до 5 млн ₽' },
      { slug: 'ipoteka-na-remont', name: 'Ипотека на ремонт', price: 'от 6.5% годовых', description: 'Под залог квартиры, на 25 лет, до 30 млн ₽' },
      { slug: 'kreditnaya-karta', name: 'Кредитная карта', price: '0% на 365 дней', description: 'Для небольшого ремонта, без переплат' },
      { slug: 'refinansirovanie', name: 'Рефинансирование', price: 'от 7% годовых', description: 'Снижаем ставку по действующему кредиту' }
    ],
    cities: [
      { slug: 'moskva', name: 'Москве', nameNom: 'Москва', priceMult: 1.4 },
      { slug: 'spb', name: 'Санкт-Петербурге', nameNom: 'СПб', priceMult: 1.3 },
      { slug: 'ekb', name: 'Екатеринбурге', nameNom: 'Екатеринбург', priceMult: 1.0 },
      { slug: 'kzn', name: 'Казани', nameNom: 'Казань', priceMult: 1.0 },
      { slug: 'nsk', name: 'Новосибирске', nameNom: 'Новосибирск', priceMult: 0.95 },
      { slug: 'krd', name: 'Краснодаре', nameNom: 'Краснодар', priceMult: 1.05 },
      { slug: 'nn', name: 'Нижнем Новгороде', nameNom: 'Нижний Новгород', priceMult: 0.95 },
      { slug: 'chel', name: 'Челябинске', nameNom: 'Челябинск', priceMult: 0.85 },
      { slug: 'ufa', name: 'Уфе', nameNom: 'Уфа', priceMult: 0.95 },
      { slug: 'sam', name: 'Самаре', nameNom: 'Самара', priceMult: 0.95 },
      { slug: 'rnd', name: 'Ростове-на-Дону', nameNom: 'Ростов-на-Дону', priceMult: 1.0 },
      { slug: 'vrn', name: 'Воронеже', nameNom: 'Воронеж', priceMult: 0.85 },
      { slug: 'perm', name: 'Перми', nameNom: 'Пермь', priceMult: 0.85 },
      { slug: 'vlg', name: 'Волгограде', nameNom: 'Волгоград', priceMult: 0.8 },
      { slug: 'tyumen', name: 'Тюмени', nameNom: 'Тюмень', priceMult: 1.0 },
      { slug: 'brn', name: 'Барнауле', nameNom: 'Барнаул', priceMult: 0.8 }
    ],
    faqs: [
      { q: 'Дают ли ипотеку специально на ремонт?', a: 'Да, банки выдают целевые ипотечные кредиты на ремонт квартиры. Главный плюс — ставка ниже потребкредита (6.5-12% против 12-25%). Условие — залог квартиры.' },
      { q: 'Какие документы нужны?', a: 'Паспорт, справка о доходах 2-НДФЛ или по форме банка, свидетельство о праве собственности или выписка из ЕГРН, технический паспорт квартиры.' },
      { q: 'Сколько максимум можно взять?', a: 'Зависит от стоимости квартиры (обычно до 70-80%). Например, при квартире за 10 млн — до 7-8 млн на ремонт.' }
    ]
  },
  {
    domain: 'kuhni-zakaz-online.ru',
    projectName: 'kuhni-zakaz-online',
    niche: 'Кухни на заказ',
    nicheNom: 'Кухни на заказ',
    nicheGen: 'кухни на заказ',
    nicheDat: 'кухне на заказ',
    emoji: '🍳',
    color: '#e67e22',
    tagline: 'Кухни на заказ от производителя — бесплатный замер и дизайн',
    description: 'Кухни на заказ 2026: каталог моделей, материалы (МДФ, акрил, эмаль), бесплатный замер и 3D-проект. Производство 30-45 дней.',
    leadPrice: [3000, 15000],
    services: [
      { slug: 'klassika', name: 'Классические кухни', price: 'от 80 000 ₽/пог.м', description: 'МДФ или массив, патина, фрезеровка' },
      { slug: 'sovremennyy', name: 'Современный стиль', price: 'от 60 000 ₽/пог.м', description: 'Акрил, пластик, ровные фасады' },
      { slug: 'loft', name: 'Лофт', price: 'от 70 000 ₽/пог.м', description: 'Бетон, металл, дерево необработанное' },
      { slug: 'skandinaviya', name: 'Скандинавский стиль', price: 'от 65 000 ₽/пог.м', description: 'Светлые тона, минимализм, дерево' }
    ],
    cities: [
      { slug: 'moskva', name: 'Москве', nameNom: 'Москва', priceMult: 1.4 },
      { slug: 'spb', name: 'Санкт-Петербурге', nameNom: 'СПб', priceMult: 1.3 },
      { slug: 'ekb', name: 'Екатеринбурге', nameNom: 'Екатеринбург', priceMult: 1.0 },
      { slug: 'kzn', name: 'Казани', nameNom: 'Казань', priceMult: 1.0 },
      { slug: 'nsk', name: 'Новосибирске', nameNom: 'Новосибирск', priceMult: 0.95 },
      { slug: 'krd', name: 'Краснодаре', nameNom: 'Краснодар', priceMult: 1.05 },
      { slug: 'nn', name: 'Нижнем Новгороде', nameNom: 'Нижний Новгород', priceMult: 0.95 },
      { slug: 'chel', name: 'Челябинске', nameNom: 'Челябинск', priceMult: 0.85 },
      { slug: 'ufa', name: 'Уфе', nameNom: 'Уфа', priceMult: 0.95 },
      { slug: 'sam', name: 'Самаре', nameNom: 'Самара', priceMult: 0.95 }
    ],
    faqs: [
      { q: 'Сколько ждать готовую кухню?', a: '30-45 дней с момента подписания договора. Сложные модели или импортная фурнитура — до 60 дней.' },
      { q: 'Какая фурнитура лучше?', a: 'Blum (Австрия) — премиум, 25 лет гарантии. Hettich (Германия) — средний сегмент. Boyard, GTV (Польша/Россия) — эконом.' },
      { q: 'Можно ли встроить технику?', a: 'Да, в проекте сразу учитывается ваша техника или мы подбираем под нужные параметры.' }
    ]
  },
  {
    domain: 'dom-stroy-online.ru',
    projectName: 'dom-stroy-online',
    niche: 'Загородные дома',
    nicheNom: 'Загородные дома',
    nicheGen: 'загородных домов',
    nicheDat: 'загородному дому',
    emoji: '🏡',
    color: '#27ae60',
    tagline: 'Строительство загородных домов под ключ от 25 000 ₽/м²',
    description: 'Строительство загородных домов и коттеджей 2026: каркасные, газобетон, кирпич. Проекты, цены, поэтапная оплата.',
    leadPrice: [3000, 20000],
    services: [
      { slug: 'karkasnye', name: 'Каркасные дома', price: 'от 25 000 ₽/м²', description: 'Быстрая постройка 2-3 месяца, тёплые, цена 1.5 млн на 60 м²' },
      { slug: 'gazobeton', name: 'Дома из газобетона', price: 'от 35 000 ₽/м²', description: 'Тёплые, долговечные, 4-6 месяцев' },
      { slug: 'kirpichnye', name: 'Кирпичные дома', price: 'от 55 000 ₽/м²', description: 'Премиум, 8-12 месяцев, срок службы 150+ лет' },
      { slug: 'iz-brusa', name: 'Дома из бруса', price: 'от 30 000 ₽/м²', description: 'Экологичные, аромат дерева, требуют усадки 1 год' }
    ],
    cities: [
      { slug: 'moskva', name: 'Подмосковье', nameNom: 'Подмосковье', priceMult: 1.4 },
      { slug: 'spb', name: 'Ленобласти', nameNom: 'Ленобласть', priceMult: 1.3 },
      { slug: 'ekb', name: 'Свердловской области', nameNom: 'Свердловская обл.', priceMult: 1.0 },
      { slug: 'kzn', name: 'Татарстане', nameNom: 'Татарстан', priceMult: 1.0 },
      { slug: 'nsk', name: 'Новосибирской области', nameNom: 'Новосибирская обл.', priceMult: 0.95 },
      { slug: 'krd', name: 'Краснодарском крае', nameNom: 'Краснодарский край', priceMult: 1.1 }
    ],
    faqs: [
      { q: 'Какой дом самый тёплый?', a: 'Каркасный с правильным утеплителем (минвата 200 мм). Газобетон тоже хорош. Кирпич без утепления — самый холодный.' },
      { q: 'Что быстрее построить?', a: 'Каркасный — 2-3 месяца. Газобетон — 4-6 месяцев. Кирпич — 8-12 месяцев.' },
      { q: 'Нужен ли проект?', a: 'Да, обязательно. Без проекта строить нельзя (нарушение СНиП). Готовый проект — 30-100 тыс ₽, индивидуальный — 100-300 тыс ₽.' }
    ]
  },
  {
    domain: 'natyazhnoi-master24.ru',
    projectName: 'natyazhnoi-master24',
    niche: 'Натяжные потолки',
    nicheNom: 'Натяжные потолки',
    nicheGen: 'натяжных потолков',
    nicheDat: 'натяжному потолку',
    emoji: '✨',
    color: '#3498db',
    tagline: 'Натяжные потолки от 350 ₽/м² — монтаж за 1 день',
    description: 'Натяжные потолки 2026: глянец, мат, сатин, фотопечать. Цена 350-1500 ₽/м². Установка за 1 день, гарантия 15 лет.',
    leadPrice: [800, 3000],
    services: [
      { slug: 'glyanec', name: 'Глянцевые потолки', price: 'от 450 ₽/м²', description: 'Отражают свет, визуально расширяют комнату' },
      { slug: 'mat', name: 'Матовые потолки', price: 'от 350 ₽/м²', description: 'Классика, выглядит как окрашенный потолок' },
      { slug: 'satin', name: 'Сатиновые потолки', price: 'от 400 ₽/м²', description: 'Нежный жемчужный отблеск, премиум' },
      { slug: 'mnogourovnevye', name: 'Многоуровневые', price: 'от 1200 ₽/м²', description: '2-3 уровня, с подсветкой, дизайнерские' },
      { slug: 'fotopechat', name: 'С фотопечатью', price: 'от 1500 ₽/м²', description: 'Любое изображение, звёздное небо, лофт' }
    ],
    cities: [
      { slug: 'moskva', name: 'Москве', nameNom: 'Москва', priceMult: 1.4 },
      { slug: 'spb', name: 'Санкт-Петербурге', nameNom: 'СПб', priceMult: 1.3 },
      { slug: 'ekb', name: 'Екатеринбурге', nameNom: 'Екатеринбург', priceMult: 1.0 },
      { slug: 'kzn', name: 'Казани', nameNom: 'Казань', priceMult: 1.0 },
      { slug: 'nsk', name: 'Новосибирске', nameNom: 'Новосибирск', priceMult: 0.95 },
      { slug: 'krd', name: 'Краснодаре', nameNom: 'Краснодар', priceMult: 1.05 },
      { slug: 'nn', name: 'Нижнем Новгороде', nameNom: 'Нижний Новгород', priceMult: 0.95 },
      { slug: 'chel', name: 'Челябинске', nameNom: 'Челябинск', priceMult: 0.85 },
      { slug: 'ufa', name: 'Уфе', nameNom: 'Уфа', priceMult: 0.95 },
      { slug: 'sam', name: 'Самаре', nameNom: 'Самара', priceMult: 0.95 }
    ],
    faqs: [
      { q: 'Сколько монтируется потолок?', a: '1 день на комнату 15-20 м². Сложные многоуровневые — 2-3 дня.' },
      { q: 'Боится ли потолок прорыва трубы?', a: 'Наоборот, защищает. ПВХ выдерживает до 100 л воды (растягивается пузырём). Сливается через монтажный угол.' },
      { q: 'Сколько служит натяжной?', a: '15-20 лет ПВХ, 10-15 лет тканевый. С гарантией 10-15 лет от установщика.' }
    ]
  },
  {
    domain: 'okna-pvh-online.ru',
    projectName: 'okna-pvh-online',
    niche: 'Окна ПВХ',
    nicheNom: 'Окна ПВХ',
    nicheGen: 'окон ПВХ',
    nicheDat: 'окнам ПВХ',
    emoji: '🪟',
    color: '#2980b9',
    tagline: 'Пластиковые окна от 8 000 ₽ — производство и монтаж',
    description: 'Окна ПВХ 2026: профили KBE, Rehau, VEKA, Salamander. Стеклопакеты 1-3 камерные. Монтаж 1-2 дня, гарантия 5 лет.',
    leadPrice: [500, 3000],
    services: [
      { slug: 'standart', name: 'Стандартные окна', price: 'от 8 000 ₽', description: '3-камерный профиль, 1-камерный стеклопакет, эконом' },
      { slug: 'premium', name: 'Премиум окна', price: 'от 15 000 ₽', description: '5-камерный профиль, 2-камерный стеклопакет, тёплые' },
      { slug: 'tonirovanie', name: 'Тонированные окна', price: 'от 12 000 ₽', description: 'Затемнение от солнца, защита от перегрева' },
      { slug: 'protivovzlomnye', name: 'Противовзломные', price: 'от 20 000 ₽', description: 'Класс защиты RC2/RC3, для 1 этажа и таунхаусов' },
      { slug: 'energosberegayushchie', name: 'Энергосберегающие', price: 'от 18 000 ₽', description: 'Низкоэмиссионное стекло, экономия на отоплении 30%' }
    ],
    cities: [
      { slug: 'moskva', name: 'Москве', nameNom: 'Москва', priceMult: 1.4 },
      { slug: 'spb', name: 'Санкт-Петербурге', nameNom: 'СПб', priceMult: 1.3 },
      { slug: 'ekb', name: 'Екатеринбурге', nameNom: 'Екатеринбург', priceMult: 1.0 },
      { slug: 'kzn', name: 'Казани', nameNom: 'Казань', priceMult: 1.0 },
      { slug: 'nsk', name: 'Новосибирске', nameNom: 'Новосибирск', priceMult: 0.95 },
      { slug: 'krd', name: 'Краснодаре', nameNom: 'Краснодар', priceMult: 1.05 },
      { slug: 'nn', name: 'Нижнем Новгороде', nameNom: 'Нижний Новгород', priceMult: 0.95 },
      { slug: 'chel', name: 'Челябинске', nameNom: 'Челябинск', priceMult: 0.85 }
    ],
    faqs: [
      { q: 'Какой профиль выбрать?', a: 'KBE, Rehau — Германия премиум. VEKA — Германия средний. Salamander — Германия эконом. WHS Halo — Россия эконом.' },
      { q: 'Сколько окно служит?', a: 'ПВХ-профиль 50+ лет, стеклопакет 25-30 лет, фурнитура 15-20 лет с обслуживанием. Полная замена через 25-40 лет.' },
      { q: 'Что входит в монтаж?', a: 'Демонтаж старого, установка нового, монтажная пена, гидро- и пароизоляция, откосы, подоконник, отлив, мусор.' }
    ]
  },
  {
    domain: 'kupeshkafy24.ru',
    projectName: 'kupeshkafy24',
    niche: 'Шкафы-купе',
    nicheNom: 'Шкафы-купе',
    nicheGen: 'шкафов-купе',
    nicheDat: 'шкафу-купе',
    emoji: '🚪',
    color: '#9b59b6',
    tagline: 'Шкафы-купе на заказ от 18 000 ₽ — замер бесплатно',
    description: 'Шкафы-купе на заказ 2026: модели для прихожей, спальни, гардероба. Зеркала, ЛДСП, стекло. Сборка за 1 день.',
    leadPrice: [2000, 10000],
    services: [
      { slug: 'prikhoznaya', name: 'В прихожую', price: 'от 18 000 ₽', description: 'С зеркалом, с антресолями, до 2.5 м высота' },
      { slug: 'spalnya', name: 'В спальню', price: 'от 25 000 ₽', description: 'До потолка, с подсветкой, ящиками для белья' },
      { slug: 'garderobnaya', name: 'Гардеробная', price: 'от 60 000 ₽', description: 'Целая комната, штанги, ящики, обувница' },
      { slug: 'detskaya', name: 'В детскую', price: 'от 20 000 ₽', description: 'С рисунками, безопасные углы, рассчитан на рост' }
    ],
    cities: [
      { slug: 'moskva', name: 'Москве', nameNom: 'Москва', priceMult: 1.4 },
      { slug: 'spb', name: 'Санкт-Петербурге', nameNom: 'СПб', priceMult: 1.3 },
      { slug: 'ekb', name: 'Екатеринбурге', nameNom: 'Екатеринбург', priceMult: 1.0 },
      { slug: 'kzn', name: 'Казани', nameNom: 'Казань', priceMult: 1.0 },
      { slug: 'nsk', name: 'Новосибирске', nameNom: 'Новосибирск', priceMult: 0.95 }
    ],
    faqs: [
      { q: 'Из чего делают шкаф?', a: 'ЛДСП Egger или Lamarty (тонкий ламинат). Фасады — ЛДСП, стекло, зеркало, ротанг, шпон.' },
      { q: 'Какие системы раздвижения?', a: 'Aristo — премиум. Versal — средний. Krauss — эконом. Все 10+ лет гарантии.' },
      { q: 'Сколько ждать?', a: '14-21 день производство + 1 день сборка. Срочно — 7-10 дней с надбавкой 20%.' }
    ]
  },
  {
    domain: 'dveri-stalnye24.ru',
    projectName: 'dveri-stalnye24',
    niche: 'Стальные двери',
    nicheNom: 'Стальные двери',
    nicheGen: 'стальных дверей',
    nicheDat: 'стальной двери',
    emoji: '🚪',
    color: '#34495e',
    tagline: 'Входные стальные двери от 12 000 ₽ — производство и установка',
    description: 'Стальные входные двери 2026: эконом, средний, премиум сегмент. С шумоизоляцией, противовзломом. Установка за 4 часа.',
    leadPrice: [800, 4000],
    services: [
      { slug: 'ekonom', name: 'Эконом-сегмент', price: 'от 12 000 ₽', description: 'Сталь 1.2 мм, базовая фурнитура, 2 замка' },
      { slug: 'sredniy', name: 'Средний сегмент', price: 'от 25 000 ₽', description: 'Сталь 1.5-2 мм, шумоизоляция, теплоизоляция' },
      { slug: 'premium', name: 'Премиум', price: 'от 60 000 ₽', description: 'Сталь 2-3 мм, MDF-отделка, защита класса 3' },
      { slug: 'protivovzlomnye', name: 'Противовзломные', price: 'от 80 000 ₽', description: 'Сертификат RC2/RC3, штифты, противосъёмные петли' }
    ],
    cities: [
      { slug: 'moskva', name: 'Москве', nameNom: 'Москва', priceMult: 1.4 },
      { slug: 'spb', name: 'Санкт-Петербурге', nameNom: 'СПб', priceMult: 1.3 },
      { slug: 'ekb', name: 'Екатеринбурге', nameNom: 'Екатеринбург', priceMult: 1.0 },
      { slug: 'kzn', name: 'Казани', nameNom: 'Казань', priceMult: 1.0 },
      { slug: 'nsk', name: 'Новосибирске', nameNom: 'Новосибирск', priceMult: 0.95 },
      { slug: 'krd', name: 'Краснодаре', nameNom: 'Краснодар', priceMult: 1.05 }
    ],
    faqs: [
      { q: 'Какой замок выбрать?', a: 'Cisa, Mottura (Италия) — премиум. Kale, Mauer (Турция/Германия) — средний. Меттэм, Эльбор — Россия эконом.' },
      { q: 'Стальная или железная?', a: '"Железная" = маркетинг. Все стальные. Разница в толщине стали (1.2-3 мм) и обработке.' },
      { q: 'Можно ли поставить за день?', a: 'Да, при наличии готового проёма. Демонтаж старой + установка новой = 3-5 часов.' }
    ]
  },
  {
    domain: 'perevodkvartiry.ru',
    projectName: 'perevodkvartiry',
    niche: 'Перепланировка',
    nicheNom: 'Перепланировка квартиры',
    nicheGen: 'перепланировки квартиры',
    nicheDat: 'перепланировке квартиры',
    emoji: '📐',
    color: '#16a085',
    tagline: 'Согласование перепланировки квартиры от 30 000 ₽ под ключ',
    description: 'Согласование перепланировки квартиры 2026: подготовка проекта, сбор документов, БТИ, жил.инспекция. Срок 1-4 месяца.',
    leadPrice: [1500, 5000],
    services: [
      { slug: 'proekt', name: 'Проект перепланировки', price: 'от 25 000 ₽', description: 'Архитектор + чертежи + спецификация' },
      { slug: 'soglasovanie', name: 'Согласование под ключ', price: 'от 60 000 ₽', description: 'Проект + БТИ + жил.инспекция + новый паспорт' },
      { slug: 'uzakonenie', name: 'Узаконить уже сделанную', price: 'от 80 000 ₽', description: 'Перепланировку "задним числом" с уже снесёнными стенами' },
      { slug: 'konsultaciya', name: 'Юридическая консультация', price: 'от 3 000 ₽', description: 'Можно ли согласовать вашу планировку' }
    ],
    cities: [
      { slug: 'moskva', name: 'Москве', nameNom: 'Москва', priceMult: 1.4 },
      { slug: 'spb', name: 'Санкт-Петербурге', nameNom: 'СПб', priceMult: 1.3 },
      { slug: 'ekb', name: 'Екатеринбурге', nameNom: 'Екатеринбург', priceMult: 1.0 },
      { slug: 'kzn', name: 'Казани', nameNom: 'Казань', priceMult: 1.0 },
      { slug: 'nsk', name: 'Новосибирске', nameNom: 'Новосибирск', priceMult: 0.95 }
    ],
    faqs: [
      { q: 'Что нельзя согласовать?', a: 'Снос несущих стен. Перенос мокрой зоны над сухой соседей. Перенос кухни в жилую комнату. Объединение жилой комнаты с балконом.' },
      { q: 'Что точно согласуют?', a: 'Снос ненесущих перегородок. Объединение санузла. Перенос двери в ненесущей стене. Установка ниш в стенах.' },
      { q: 'Сколько по времени?', a: 'Простая перепланировка — 1-2 месяца. Сложная — 3-6 месяцев. Узаконить задним числом — 3-9 месяцев.' }
    ]
  },
  {
    domain: 'dizayn-interyera-online.ru',
    projectName: 'dizayn-interyera-online',
    niche: 'Дизайн интерьера',
    nicheNom: 'Дизайн интерьера',
    nicheGen: 'дизайна интерьера',
    nicheDat: 'дизайну интерьера',
    emoji: '🎨',
    color: '#e74c3c',
    tagline: 'Дизайн интерьера квартиры от 1 500 ₽/м² — авторский надзор',
    description: 'Дизайн интерьера квартиры 2026: проект, визуализация, спецификация, авторский надзор. Стили лофт, минимализм, классика.',
    leadPrice: [1000, 8000],
    services: [
      { slug: 'osnovnoy-paket', name: 'Базовый пакет', price: 'от 1 500 ₽/м²', description: 'Планировка + развёртки + спецификация (без визуализации)' },
      { slug: 'standartnyy-paket', name: 'Стандарт', price: 'от 2 500 ₽/м²', description: 'Базовый + 3D-визуализация всех комнат' },
      { slug: 'premium-paket', name: 'Премиум', price: 'от 4 500 ₽/м²', description: 'Стандарт + авторский надзор + подбор материалов' },
      { slug: 'avtor-nadzor', name: 'Авторский надзор', price: 'от 50 000 ₽/мес', description: 'Контроль ремонта по проекту, выезды на объект' }
    ],
    cities: [
      { slug: 'moskva', name: 'Москве', nameNom: 'Москва', priceMult: 1.4 },
      { slug: 'spb', name: 'Санкт-Петербурге', nameNom: 'СПб', priceMult: 1.3 },
      { slug: 'ekb', name: 'Екатеринбурге', nameNom: 'Екатеринбург', priceMult: 1.0 },
      { slug: 'kzn', name: 'Казани', nameNom: 'Казань', priceMult: 1.0 },
      { slug: 'nsk', name: 'Новосибирске', nameNom: 'Новосибирск', priceMult: 0.95 }
    ],
    faqs: [
      { q: 'Чем отличаются пакеты?', a: 'Базовый — только чертежи. Стандарт — добавляются 3D-визуализации. Премиум — авторский надзор и подбор материалов.' },
      { q: 'Сколько по времени дизайн?', a: '2-3 недели на проект 50 м². 4-6 недель на 100+ м². С согласованиями — +1-2 недели.' },
      { q: 'Можно ли менять проект?', a: 'Да, до начала работ — бесплатно. После — переделка платная (50-150% от исходной цены раздела).' }
    ]
  },
  {
    domain: 'kamin-zakaz24.ru',
    projectName: 'kamin-zakaz24',
    niche: 'Камины и печи',
    nicheNom: 'Камины и печи',
    nicheGen: 'каминов и печей',
    nicheDat: 'камину и печи',
    emoji: '🔥',
    color: '#d35400',
    tagline: 'Камины и печи на дровах от 80 000 ₽ — монтаж под ключ',
    description: 'Камины, печи, дымоходы 2026: дровяные, газовые, электрические, биокамины. Монтаж, чистка, ремонт. Гарантия 5 лет.',
    leadPrice: [1000, 10000],
    services: [
      { slug: 'drovianye', name: 'Дровяные камины', price: 'от 80 000 ₽', description: 'Чугунные топки, печи длительного горения, аромат дров' },
      { slug: 'gazovye', name: 'Газовые камины', price: 'от 60 000 ₽', description: 'Без дымохода, имитация пламени, простой монтаж' },
      { slug: 'elektrokamin', name: 'Электрокамины', price: 'от 15 000 ₽', description: 'Без вытяжки, для квартиры, эффект пламени' },
      { slug: 'biokamin', name: 'Биокамины', price: 'от 25 000 ₽', description: 'На биоэтаноле, без дыма и дымохода' },
      { slug: 'dymokhody', name: 'Дымоходы и монтаж', price: 'от 30 000 ₽', description: 'Нержавейка, сэндвич, керамика. Под ключ.' }
    ],
    cities: [
      { slug: 'moskva', name: 'Москве и области', nameNom: 'Москва', priceMult: 1.4 },
      { slug: 'spb', name: 'СПб и Ленобласти', nameNom: 'СПб', priceMult: 1.3 },
      { slug: 'ekb', name: 'Екатеринбурге', nameNom: 'Екатеринбург', priceMult: 1.0 },
      { slug: 'nsk', name: 'Новосибирске', nameNom: 'Новосибирск', priceMult: 0.95 },
      { slug: 'krd', name: 'Краснодаре', nameNom: 'Краснодар', priceMult: 1.05 }
    ],
    faqs: [
      { q: 'Какой камин для квартиры?', a: 'Электро или биокамин — без дыма и дымохода. Дровяной нельзя — нужен сертифицированный дымоход через крышу.' },
      { q: 'Сколько служит чугунная топка?', a: '20-30 лет при правильной эксплуатации. Производители: Jotul (Норвегия), Invicta (Франция), Чугун-Сталь (Россия).' },
      { q: 'Газовый камин надо подключать?', a: 'Да, к магистральному газу или баллону. Требует разрешения газовой службы.' }
    ]
  }
];
