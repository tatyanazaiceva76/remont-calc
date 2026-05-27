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
  { slug: 'centralny', name: 'Центральный район', shortName: 'Центральный', priceMultiplier: 1.20,
    intro: 'Сердце Барнаула: проспект Ленина, парк "Изумрудный". Премиум-сегмент.',
    housingProfile: 'Сталинки на проспекте Ленина, дореволюционка в районе Старого Базара, новостройки.',
    uniqueFactors: ['Самые высокие цены', 'Узкие улицы старой части', 'Премиум-аудитория'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'oktyabrsky', name: 'Октябрьский район', shortName: 'Октябрьский', priceMultiplier: 1.00,
    intro: 'Большой район: Поток, Новосиликатный. Смешанная застройка.',
    housingProfile: 'Хрущёвки, брежневки, серии 90-х, точечная новая застройка.',
    uniqueFactors: ['Средний чек', 'Развитая инфраструктура', 'Близость к ТЦ "Галактика"'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'leninsky', name: 'Ленинский район', shortName: 'Ленинский', priceMultiplier: 0.95,
    intro: 'Запад: посёлок Южный, Шукшина. Большой жилой массив.',
    housingProfile: 'Хрущёвки и брежневки. Активная застройка от Жилстрой, Селф.',
    uniqueFactors: ['Средние цены', 'Близость к ТРЦ "Арена"', 'Удобная логистика по Шукшина'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'industrialny', name: 'Индустриальный район', shortName: 'Индустриальный', priceMultiplier: 0.85,
    intro: 'Север: Власиха, Новосиликатный. Промышленный, самые низкие цены.',
    housingProfile: 'Хрущёвки, частный сектор, типовая советская застройка.',
    uniqueFactors: ['Самые низкие цены', 'Близость к промзонам', 'Сильная конкуренция бригад'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'zheleznodorozhny', name: 'Железнодорожный район', shortName: 'Железнодорожный', priceMultiplier: 0.95,
    intro: 'Около ж/д вокзала: Гагарина, Северный Власихинский. Средние цены.',
    housingProfile: 'Хрущёвки, серии 90-х, новостройки.',
    uniqueFactors: ['Близость к ж/д вокзалу', 'Средний чек', 'Развитая транспортная сеть'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  }
];

export const repairTypes: RepairType[] = [
  { key: 'cosmetic', name: 'Косметический ремонт', ruShort: 'Косметика', pricePerSqM: 6500, description: 'Поверхностная отделка без замены коммуникаций.', includes: ['Подготовка стен', 'Покраска или обои', 'Замена пола', 'Натяжной потолок', 'Замена дверей', 'Замена розеток'], durationDays: '14-30 дней' },
  { key: 'capital', name: 'Капитальный ремонт', ruShort: 'Капремонт', pricePerSqM: 12025, description: 'Замена всех коммуникаций, выравнивание стен и полов, полная отделка.', includes: ['Демонтаж', 'Замена проводки', 'Замена труб', 'Выравнивание стен', 'Стяжка пола', 'Чистовая отделка', 'Сантехника, двери'], durationDays: '60-120 дней' },
  { key: 'euro', name: 'Евроремонт', ruShort: 'Евро', pricePerSqM: 14950, description: 'Современный качественный ремонт со средне-высокого сегмента материалов.', includes: ['Капитальная замена коммуникаций', 'Импортные/премиум материалы', 'Дизайн-проект', 'Скрытая проводка', 'Сложные потолки', 'Тёплый пол'], durationDays: '90-150 дней' },
  { key: 'designer', name: 'Дизайнерский ремонт', ruShort: 'Дизайн', pricePerSqM: 27950, description: 'Премиум-ремонт по индивидуальному проекту.', includes: ['Авторский дизайн', 'Эксклюзивные материалы', 'Премиум-сантехника', 'Натуральные материалы', '"Умный дом"', 'Авторский надзор'], durationDays: '180-365 дней' }
];
