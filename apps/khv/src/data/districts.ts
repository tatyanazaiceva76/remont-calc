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
    intro: 'Сердце Хабаровска: набережная Амура, площадь Ленина. Премиум.',
    housingProfile: 'Сталинки на Амурском бульваре, дореволюционка в районе Муравьёва-Амурского, премиум.',
    uniqueFactors: ['Самые высокие цены', 'Высокие цены логистики (Дальний Восток)', 'Сейсмика — особые требования'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'kirovsky', name: 'Кировский район', shortName: 'Кировский', priceMultiplier: 1.05,
    intro: 'Большой район: Центральный микрорайон, парк "Динамо". Развитая инфраструктура.',
    housingProfile: 'Сталинки, хрущёвки, серии 90-х, новостройки.',
    uniqueFactors: ['Близость к стадиону "Динамо"', 'Средне-высокий чек', 'Развитая транспортная сеть'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'krasnoflotsky', name: 'Краснофлотский район', shortName: 'Краснофлотский', priceMultiplier: 0.95,
    intro: 'Север: посёлок Энергетиков. Промышленный, рабочий.',
    housingProfile: 'Хрущёвки, серии 80-х, частный сектор.',
    uniqueFactors: ['Близость к ТЭЦ', 'Низкие цены', 'Удалённость от центра'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'industrialny', name: 'Индустриальный район', shortName: 'Индустриальный', priceMultiplier: 0.90,
    intro: 'Юго-запад: 4 км, Большой Уссурийский. Самые низкие цены.',
    housingProfile: 'Хрущёвки, частный сектор.',
    uniqueFactors: ['Самые низкие цены', 'Промышленная история', 'Логистика — через мост'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'zheleznodorozhny', name: 'Железнодорожный район', shortName: 'Железнодорожный', priceMultiplier: 0.95,
    intro: 'Около ж/д вокзала: Большой посёлок. Средние цены.',
    housingProfile: 'Хрущёвки, серии 90-х, новостройки.',
    uniqueFactors: ['Близость к вокзалу', 'Удобная транспортная развязка', 'Средние цены'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  }
];

export const repairTypes: RepairType[] = [
  { key: 'cosmetic', name: 'Косметический ремонт', ruShort: 'Косметика', pricePerSqM: 9500, description: 'Поверхностная отделка без замены коммуникаций.', includes: ['Подготовка стен', 'Покраска или обои', 'Замена пола', 'Натяжной потолок', 'Замена дверей', 'Замена розеток'], durationDays: '14-30 дней' },
  { key: 'capital', name: 'Капитальный ремонт', ruShort: 'Капремонт', pricePerSqM: 17575, description: 'Замена всех коммуникаций, выравнивание стен и полов, полная отделка.', includes: ['Демонтаж', 'Замена проводки', 'Замена труб', 'Выравнивание стен', 'Стяжка пола', 'Чистовая отделка', 'Сантехника, двери'], durationDays: '60-120 дней' },
  { key: 'euro', name: 'Евроремонт', ruShort: 'Евро', pricePerSqM: 21850, description: 'Современный качественный ремонт со средне-высокого сегмента материалов.', includes: ['Капитальная замена коммуникаций', 'Импортные/премиум материалы', 'Дизайн-проект', 'Скрытая проводка', 'Сложные потолки', 'Тёплый пол'], durationDays: '90-150 дней' },
  { key: 'designer', name: 'Дизайнерский ремонт', ruShort: 'Дизайн', pricePerSqM: 40850, description: 'Премиум-ремонт по индивидуальному проекту.', includes: ['Авторский дизайн', 'Эксклюзивные материалы', 'Премиум-сантехника', 'Натуральные материалы', '"Умный дом"', 'Авторский надзор'], durationDays: '180-365 дней' }
];
