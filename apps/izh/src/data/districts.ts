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
  { slug: 'leninsky', name: 'Ленинский район', shortName: 'Ленинский', priceMultiplier: 1.15,
    intro: 'Центр Ижевска: эспланада, ул. Пушкинская. Премиум-сегмент.',
    housingProfile: 'Сталинки в центре, дореволюционка, премиум-новостройки.',
    uniqueFactors: ['Самые высокие цены', 'Близость к Ижевскому пруду', 'Премиум-аудитория'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'pervomajsky', name: 'Первомайский район', shortName: 'Первомайский', priceMultiplier: 1.05,
    intro: 'Юг центра: район Карлутка, Восточный посёлок. Сочетание старого и нового.',
    housingProfile: 'Сталинки, хрущёвки, активная новая застройка.',
    uniqueFactors: ['Развитая инфраструктура', 'Близость к ТЦ', 'Средний чек'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'oktyabrsky', name: 'Октябрьский район', shortName: 'Октябрьский', priceMultiplier: 1.00,
    intro: 'Большой район: Восточный посёлок, Север. Активная застройка.',
    housingProfile: 'Хрущёвки, брежневки, новостройки от ОПЗМ, Талан.',
    uniqueFactors: ['Север — массовая новая застройка', 'Близость к Удмуртскому Гос. Университету', 'Средние цены'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'industrialny', name: 'Индустриальный район', shortName: 'Индустриальный', priceMultiplier: 0.90,
    intro: 'Запад: Металлург, Соцгород. Рабочий район, низкие цены.',
    housingProfile: 'Сталинки Соцгорода, хрущёвки, частный сектор.',
    uniqueFactors: ['Сталинки Соцгорода — историческая ценность', 'Близость к Ижмаш', 'Низкие цены'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'ustinovsky', name: 'Устиновский район', shortName: 'Устиновский', priceMultiplier: 0.95,
    intro: 'Северо-запад: посёлок Машиностроителей. Большой жилой массив.',
    housingProfile: 'Хрущёвки, серии 80-90-х. Точечная новая застройка.',
    uniqueFactors: ['Близость к промзонам', 'Удалённость от центра', 'Низкий-средний чек'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  }
];

export const repairTypes: RepairType[] = [
  { key: 'cosmetic', name: 'Косметический ремонт', ruShort: 'Косметика', pricePerSqM: 6800, description: 'Поверхностная отделка без замены коммуникаций.', includes: ['Подготовка стен', 'Покраска или обои', 'Замена пола', 'Натяжной потолок', 'Замена дверей', 'Замена розеток'], durationDays: '14-30 дней' },
  { key: 'capital', name: 'Капитальный ремонт', ruShort: 'Капремонт', pricePerSqM: 12580, description: 'Замена всех коммуникаций, выравнивание стен и полов, полная отделка.', includes: ['Демонтаж', 'Замена проводки', 'Замена труб', 'Выравнивание стен', 'Стяжка пола', 'Чистовая отделка', 'Сантехника, двери'], durationDays: '60-120 дней' },
  { key: 'euro', name: 'Евроремонт', ruShort: 'Евро', pricePerSqM: 15640, description: 'Современный качественный ремонт со средне-высокого сегмента материалов.', includes: ['Капитальная замена коммуникаций', 'Импортные/премиум материалы', 'Дизайн-проект', 'Скрытая проводка', 'Сложные потолки', 'Тёплый пол'], durationDays: '90-150 дней' },
  { key: 'designer', name: 'Дизайнерский ремонт', ruShort: 'Дизайн', pricePerSqM: 29240, description: 'Премиум-ремонт по индивидуальному проекту.', includes: ['Авторский дизайн', 'Эксклюзивные материалы', 'Премиум-сантехника', 'Натуральные материалы', '"Умный дом"', 'Авторский надзор'], durationDays: '180-365 дней' }
];
