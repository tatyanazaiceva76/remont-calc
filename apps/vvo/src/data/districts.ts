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
  { slug: 'leninsky', name: 'Ленинский район', shortName: 'Ленинский', priceMultiplier: 1.25,
    intro: 'Центр: ул. Светланская, набережная Спортивной гавани. Премиум.',
    housingProfile: 'Сталинки, дореволюционка, премиум-новостройки на сопках.',
    uniqueFactors: ['Самые высокие цены', 'Сейсмика — обязательно усиление', 'Сложный рельеф — сложности с доставкой'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'pervorechensky', name: 'Первореченский район', shortName: 'Первореченский', priceMultiplier: 1.00,
    intro: 'Юг: Чуркин, Эгершельд. Сложный рельеф, разнообразная застройка.',
    housingProfile: 'Хрущёвки, сталинки, точечная новая застройка.',
    uniqueFactors: ['Сложный рельеф (сопки)', 'Близость к порту', 'Средние цены'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'sovetsky', name: 'Советский район', shortName: 'Советский', priceMultiplier: 0.95,
    intro: 'Северо-восток: Окатовая, Снеговая Падь. Активная новая застройка.',
    housingProfile: 'Хрущёвки, серии 80-х, новостройки в Снеговой Пади.',
    uniqueFactors: ['Снеговая Падь — массовая новая застройка', 'Удалённость от центра', 'Средние цены'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'frunzensky', name: 'Фрунзенский район', shortName: 'Фрунзенский', priceMultiplier: 1.05,
    intro: 'Около ДВФУ (Русский остров), 2-я Речка. Современная застройка.',
    housingProfile: 'Хрущёвки на 2-й Речке, новостройки около ДВФУ.',
    uniqueFactors: ['Близость к ДВФУ', 'Океанская — премиум-район', 'Средне-высокий чек'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  }
];

export const repairTypes: RepairType[] = [
  { key: 'cosmetic', name: 'Косметический ремонт', ruShort: 'Косметика', pricePerSqM: 10500, description: 'Поверхностная отделка без замены коммуникаций.', includes: ['Подготовка стен', 'Покраска или обои', 'Замена пола', 'Натяжной потолок', 'Замена дверей', 'Замена розеток'], durationDays: '14-30 дней' },
  { key: 'capital', name: 'Капитальный ремонт', ruShort: 'Капремонт', pricePerSqM: 19425, description: 'Замена всех коммуникаций, выравнивание стен и полов, полная отделка.', includes: ['Демонтаж', 'Замена проводки', 'Замена труб', 'Выравнивание стен', 'Стяжка пола', 'Чистовая отделка', 'Сантехника, двери'], durationDays: '60-120 дней' },
  { key: 'euro', name: 'Евроремонт', ruShort: 'Евро', pricePerSqM: 24150, description: 'Современный качественный ремонт со средне-высокого сегмента материалов.', includes: ['Капитальная замена коммуникаций', 'Импортные/премиум материалы', 'Дизайн-проект', 'Скрытая проводка', 'Сложные потолки', 'Тёплый пол'], durationDays: '90-150 дней' },
  { key: 'designer', name: 'Дизайнерский ремонт', ruShort: 'Дизайн', pricePerSqM: 45150, description: 'Премиум-ремонт по индивидуальному проекту.', includes: ['Авторский дизайн', 'Эксклюзивные материалы', 'Премиум-сантехника', 'Натуральные материалы', '"Умный дом"', 'Авторский надзор'], durationDays: '180-365 дней' }
];
