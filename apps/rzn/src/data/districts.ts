export interface RepairType {
  key: 'cosmetic' | 'capital' | 'euro' | 'designer';
  name: string;
  ruShort: string;
  pricePerSqM: number;
  description: string;
  includes: string[];
  durationDays: string;
}
export interface District {
  slug: string;
  name: string;
  shortName: string;
  intro: string;
  housingProfile: string;
  priceMultiplier: number;
  uniqueFactors: string[];
  examples: { type: string; price: string; details: string }[];
  topMetroStations: string[];
}

export const districts: District[] = [
  { slug: 'sovetsky', name: 'Советский район', shortName: 'Советский', priceMultiplier: 1.25,
    intro: 'Центр Рязани: Кремль, ул. Почтовая, ул. Соборная. Премиум.',
    housingProfile: 'Дореволюционка в центре, сталинки, премиум-новостройки.',
    uniqueFactors: ['Близость к Кремлю — историческое значение', 'Самые высокие цены', 'Узкие улицы старого центра'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'oktyabrsky', name: 'Октябрьский район', shortName: 'Октябрьский', priceMultiplier: 1.05,
    intro: 'Большой район: Дашково-Песочня, район завода САМ. Средне-высокий чек.',
    housingProfile: 'Хрущёвки, брежневки, новостройки от Зодчий, Рязангражданстрой.',
    uniqueFactors: ['Дашково-Песочня — активная застройка', 'Близость к ТЦ "Глобус"', 'Средне-высокий чек'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'moskovsky', name: 'Московский район', shortName: 'Московский', priceMultiplier: 0.95,
    intro: 'Северо-запад: Канищево, район автоВАЗа. Большой массив.',
    housingProfile: 'Хрущёвки в Канищево, новостройки от Глобус, Зодчий.',
    uniqueFactors: ['Активная новая застройка', 'Близость к ТЦ "Лента"', 'Средние цены'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'zheleznodorozhny', name: 'Железнодорожный район', shortName: 'Железнодорожный', priceMultiplier: 0.90,
    intro: 'Юг: район Рязань-1 вокзал. Промышленный, рабочий.',
    housingProfile: 'Хрущёвки, сталинки, частный сектор.',
    uniqueFactors: ['Близость к вокзалу', 'Низкие цены', 'Рабочая история'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  }
];

export const repairTypes: RepairType[] = [
  { key: 'cosmetic', name: 'Косметический ремонт', ruShort: 'Косметика', pricePerSqM: 7000, description: 'Поверхностная отделка без замены коммуникаций.', includes: ['Подготовка стен', 'Покраска или обои', 'Замена пола', 'Натяжной потолок', 'Замена дверей', 'Замена розеток'], durationDays: '14-30 дней' },
  { key: 'capital', name: 'Капитальный ремонт', ruShort: 'Капремонт', pricePerSqM: 12950, description: 'Замена всех коммуникаций, выравнивание стен и полов, полная отделка.', includes: ['Демонтаж', 'Замена проводки', 'Замена труб', 'Выравнивание стен', 'Стяжка пола', 'Чистовая отделка', 'Сантехника, двери'], durationDays: '60-120 дней' },
  { key: 'euro', name: 'Евроремонт', ruShort: 'Евро', pricePerSqM: 16100, description: 'Современный качественный ремонт со средне-высокого сегмента материалов.', includes: ['Капитальная замена коммуникаций', 'Импортные/премиум материалы', 'Дизайн-проект', 'Скрытая проводка', 'Сложные потолки', 'Тёплый пол'], durationDays: '90-150 дней' },
  { key: 'designer', name: 'Дизайнерский ремонт', ruShort: 'Дизайн', pricePerSqM: 30100, description: 'Премиум-ремонт по индивидуальному проекту.', includes: ['Авторский дизайн', 'Эксклюзивные материалы', 'Премиум-сантехника', 'Натуральные материалы', '"Умный дом"', 'Авторский надзор'], durationDays: '180-365 дней' }
];
