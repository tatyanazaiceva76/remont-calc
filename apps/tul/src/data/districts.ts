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
    intro: 'Сердце Тулы: Кремль, проспект Ленина. Премиум-сегмент.',
    housingProfile: 'Сталинки, дореволюционка вокруг Кремля, премиум.',
    uniqueFactors: ['Объекты культурного наследия', 'Самые высокие цены', 'Узкие улицы исторического центра'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'zarechensky', name: 'Зареченский район', shortName: 'Зареченский', priceMultiplier: 0.95,
    intro: 'Заречная часть: ул. Демонстрации, ул. Декабристов. Рабочий район.',
    housingProfile: 'Хрущёвки и сталинки. Точечная новая застройка.',
    uniqueFactors: ['Промышленная история', 'Низкие-средние цены', 'Удобная транспортная сеть'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'proletarsky', name: 'Пролетарский район', shortName: 'Пролетарский', priceMultiplier: 0.90,
    intro: 'Юг: район ТОЗ. Самые низкие цены.',
    housingProfile: 'Хрущёвки соцгорода ТОЗ, частный сектор.',
    uniqueFactors: ['Близость к Тульскому Оружейному Заводу', 'Самые низкие цены', 'Сталинки ТОЗ — историческая ценность'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'sovetsky', name: 'Советский район', shortName: 'Советский', priceMultiplier: 1.05,
    intro: 'Юг-восток: район ТСХА. Активная новая застройка.',
    housingProfile: 'Хрущёвки, новостройки от Атом-Строй, Тулстрой.',
    uniqueFactors: ['Активная новая застройка', 'Близость к ТЦ "РИО"', 'Средне-высокий чек'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'privokzalny', name: 'Привокзальный район', shortName: 'Привокзальный', priceMultiplier: 0.95,
    intro: 'Около вокзала: Криволучье. Средние цены.',
    housingProfile: 'Хрущёвки, серии 90-х, точечная новая застройка.',
    uniqueFactors: ['Близость к ж/д вокзалу', 'Средние цены', 'Развитая инфраструктура'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  }
];

export const repairTypes: RepairType[] = [
  { key: 'cosmetic', name: 'Косметический ремонт', ruShort: 'Косметика', pricePerSqM: 7800, description: 'Поверхностная отделка без замены коммуникаций.', includes: ['Подготовка стен', 'Покраска или обои', 'Замена пола', 'Натяжной потолок', 'Замена дверей', 'Замена розеток'], durationDays: '14-30 дней' },
  { key: 'capital', name: 'Капитальный ремонт', ruShort: 'Капремонт', pricePerSqM: 14430, description: 'Замена всех коммуникаций, выравнивание стен и полов, полная отделка.', includes: ['Демонтаж', 'Замена проводки', 'Замена труб', 'Выравнивание стен', 'Стяжка пола', 'Чистовая отделка', 'Сантехника, двери'], durationDays: '60-120 дней' },
  { key: 'euro', name: 'Евроремонт', ruShort: 'Евро', pricePerSqM: 17940, description: 'Современный качественный ремонт со средне-высокого сегмента материалов.', includes: ['Капитальная замена коммуникаций', 'Импортные/премиум материалы', 'Дизайн-проект', 'Скрытая проводка', 'Сложные потолки', 'Тёплый пол'], durationDays: '90-150 дней' },
  { key: 'designer', name: 'Дизайнерский ремонт', ruShort: 'Дизайн', pricePerSqM: 33540, description: 'Премиум-ремонт по индивидуальному проекту.', includes: ['Авторский дизайн', 'Эксклюзивные материалы', 'Премиум-сантехника', 'Натуральные материалы', '"Умный дом"', 'Авторский надзор'], durationDays: '180-365 дней' }
];
