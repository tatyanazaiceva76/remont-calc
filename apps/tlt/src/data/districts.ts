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
  { slug: 'avtozavodsky', name: 'Автозаводский район', shortName: 'Автозаводский', priceMultiplier: 1.00,
    intro: 'Самый большой район: 1-26 кварталы, ВАЗ. Преимущественно панельная застройка 70-80-х.',
    housingProfile: 'Хрущёвки и брежневки 70-80-х (массовая застройка под АвтоВАЗ), точечная новая застройка.',
    uniqueFactors: ['Типовая массовая застройка', 'Близость к АвтоВАЗу', 'Сильная конкуренция бригад'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'centralny', name: 'Центральный район', shortName: 'Центральный', priceMultiplier: 1.10,
    intro: 'Старая часть города (до постройки ВАЗ): Старый город. Сталинки и дореволюционка.',
    housingProfile: 'Сталинки 50-х, дореволюционка, точечная новая застройка.',
    uniqueFactors: ['Сталинский ансамбль 50-х', 'Высокие цены против других районов', 'Близость к Волге'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'komsomolsky', name: 'Комсомольский район', shortName: 'Комсомольский', priceMultiplier: 0.95,
    intro: 'Север-запад: Шлюзовой, Жигулёвское море. Промышленный.',
    housingProfile: 'Хрущёвки, частный сектор, точечная новая застройка.',
    uniqueFactors: ['Близость к шлюзам', 'Низкие цены', 'Промышленная зона'],
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
