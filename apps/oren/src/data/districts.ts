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
    intro: 'Центр Оренбурга: ул. Советская, Беловка. Премиум-сегмент.',
    housingProfile: 'Сталинки, дореволюционка, премиум-новостройки.',
    uniqueFactors: ['Самые высокие цены', 'Близость к Уралу', 'Узкие улицы старой части'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'promyshlenny', name: 'Промышленный район', shortName: 'Промышленный', priceMultiplier: 0.90,
    intro: 'Юг: Газпром, посёлок Кушкуль. Промышленный.',
    housingProfile: 'Хрущёвки, частный сектор, точечная новая застройка.',
    uniqueFactors: ['Близость к Газпрому', 'Низкие цены', 'Удалённость от центра'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'dzerzhinsky', name: 'Дзержинский район', shortName: 'Дзержинский', priceMultiplier: 1.00,
    intro: 'Север-восток: Степной, 23-й Микрорайон. Современная застройка.',
    housingProfile: 'Хрущёвки, серии 90-х, новостройки от ОренСтрой.',
    uniqueFactors: ['Степной — современный микрорайон', 'Средние цены', 'Близость к ТЦ "Краснодарский"'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'severny', name: 'Северный округ', shortName: 'Северный', priceMultiplier: 0.95,
    intro: 'Север: Маяк, Степной-2. Активная новая застройка.',
    housingProfile: 'Хрущёвки, серии 80-х, новостройки.',
    uniqueFactors: ['Активная новая застройка', 'Средне-низкий чек', 'Развивающаяся инфраструктура'],
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
