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
  { slug: 'sovetsky', name: 'Советский район', shortName: 'Советский', priceMultiplier: 1.20,
    intro: 'Центр Липецка: пл. Ленина, ул. Советская. Премиум.',
    housingProfile: 'Сталинки на пл. Ленина, дореволюционка, премиум-новостройки.',
    uniqueFactors: ['Самые высокие цены', 'Близость к парку Победы', 'Узкие улицы центра'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'oktyabrsky', name: 'Октябрьский район', shortName: 'Октябрьский', priceMultiplier: 1.00,
    intro: 'Большой район: Левобережный, посёлок НЛМК. Промышленный.',
    housingProfile: 'Хрущёвки и сталинки соцгорода НЛМК, серии 90-х, новостройки.',
    uniqueFactors: ['Близость к НЛМК — рабочий район', 'Сталинки соцгорода НЛМК — историческая ценность', 'Средние цены'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'pravoberezhny', name: 'Правобережный район', shortName: 'Правобережный', priceMultiplier: 0.95,
    intro: 'Правый берег: Сокол, Тракторный. Развитый.',
    housingProfile: 'Хрущёвки, серии 80-90-х, новостройки от ЛПЗ.',
    uniqueFactors: ['Сокол — активная застройка', 'Средние цены', 'Развитая инфраструктура'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'levoberezhny', name: 'Левобережный район', shortName: 'Левобережный', priceMultiplier: 0.90,
    intro: 'Левый берег: НЛМК, Тракторный. Рабочий район.',
    housingProfile: 'Хрущёвки соцгорода, частный сектор.',
    uniqueFactors: ['Близость к НЛМК', 'Низкие цены', 'Промышленная история'],
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
