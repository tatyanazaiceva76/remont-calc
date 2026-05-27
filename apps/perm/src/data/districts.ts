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
  { slug: 'leninsky', name: 'Ленинский район', shortName: 'Ленинский', priceMultiplier: 1.20,
    intro: 'Центр Перми: Комсомольский проспект, набережная Камы. Премиум-сегмент.',
    housingProfile: 'Сталинки на Комсомольском, дореволюционка в районе Перми I, премиум на набережной.',
    uniqueFactors: ['Самые высокие цены', 'Близость к Каме — престижно', 'Узкие улицы центра'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'sverdlovsky', name: 'Свердловский район', shortName: 'Свердловский', priceMultiplier: 1.05,
    intro: 'Юг центра: ПКиО, Юбилейный. Активная новая застройка.',
    housingProfile: 'Сталинки, хрущёвки, активная новая застройка от Стройпанелькомплект.',
    uniqueFactors: ['Юбилейный — современная застройка', 'Близость к парку культуры', 'Средне-высокий чек'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'industrialny', name: 'Индустриальный район', shortName: 'Индустриальный', priceMultiplier: 0.95,
    intro: 'Восток: Балатово, Парковый. Большая массовая застройка.',
    housingProfile: 'Хрущёвки в Балатово, брежневки в Парковом. Точечная новая застройка.',
    uniqueFactors: ['Балатово — типовая позднесоветская застройка', 'Средние цены', 'Близость к ТЦ "Колизей"'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'kirovsky', name: 'Кировский район', shortName: 'Кировский', priceMultiplier: 0.85,
    intro: 'Запад: Закамск. Самый удалённый, низкие цены.',
    housingProfile: 'Хрущёвки, частный сектор. Точечная новая застройка.',
    uniqueFactors: ['Самые низкие цены', 'Закамск — отдельный мини-город', 'Удалённость через мост'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'motovilihinsky', name: 'Мотовилихинский район', shortName: 'Мотовилихинский', priceMultiplier: 0.90,
    intro: 'Север: Висим, Молодёжный. Рабочий район с богатой историей.',
    housingProfile: 'Сталинки Мотовилихи, хрущёвки, точечная новая застройка.',
    uniqueFactors: ['Сталинки Мотовилихи — историческая ценность', 'Близость к ПЗ "Мотовилихинские заводы"', 'Низкие цены'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'ordzhonikidzevsky', name: 'Орджоникидзевский район', shortName: 'Орджоникидзевский', priceMultiplier: 0.85,
    intro: 'Север: Гайва, Камская долина. Самые низкие цены, рабочий район.',
    housingProfile: 'Хрущёвки, серии 80-х, частный сектор.',
    uniqueFactors: ['Самые низкие цены', 'Промышленная история', 'Удалённость от центра'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'dzerzhinsky', name: 'Дзержинский район', shortName: 'Дзержинский', priceMultiplier: 0.95,
    intro: 'Центральная часть: ЦКР, Городские горки. Средние цены.',
    housingProfile: 'Сталинки, хрущёвки, серии 90-х.',
    uniqueFactors: ['Близость к Перми I', 'Средние цены', 'Развитая транспортная сеть'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  }
];

export const repairTypes: RepairType[] = [
  { key: 'cosmetic', name: 'Косметический ремонт', ruShort: 'Косметика', pricePerSqM: 7000, description: 'Поверхностная отделка без замены коммуникаций.', includes: ['Подготовка стен', 'Покраска или обои', 'Замена пола', 'Натяжной потолок', 'Замена дверей', 'Замена розеток'], durationDays: '14-30 дней' },
  { key: 'capital', name: 'Капитальный ремонт', ruShort: 'Капремонт', pricePerSqM: 12950, description: 'Замена всех коммуникаций, выравнивание стен и полов, полная отделка.', includes: ['Демонтаж', 'Замена проводки', 'Замена труб', 'Выравнивание стен', 'Стяжка пола', 'Чистовая отделка', 'Сантехника, двери'], durationDays: '60-120 дней' },
  { key: 'euro', name: 'Евроремонт', ruShort: 'Евро', pricePerSqM: 16100, description: 'Современный качественный ремонт со средне-высокого сегмента материалов.', includes: ['Капитальная замена коммуникаций', 'Импортные/премиум материалы', 'Дизайн-проект (по желанию)', 'Скрытая проводка', 'Сложные потолки', 'Тёплый пол'], durationDays: '90-150 дней' },
  { key: 'designer', name: 'Дизайнерский ремонт', ruShort: 'Дизайн', pricePerSqM: 30100, description: 'Премиум-ремонт по индивидуальному проекту. Эксклюзивные материалы, авторский надзор.', includes: ['Авторский дизайн-проект', 'Эксклюзивные материалы', 'Премиум-сантехника', 'Натуральные материалы', 'Системы "Умный дом"', 'Авторский надзор'], durationDays: '180-365 дней' }
];
