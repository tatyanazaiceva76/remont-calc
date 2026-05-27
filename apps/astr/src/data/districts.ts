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
  { slug: 'kirovsky', name: 'Кировский район', shortName: 'Кировский', priceMultiplier: 1.20,
    intro: 'Центр Астрахани: Кремль, ул. Советская. Премиум-сегмент.',
    housingProfile: 'Дореволюционка в районе Косы, сталинки, премиум.',
    uniqueFactors: ['Близость к Кремлю', 'Высокие цены', 'Жаркий климат — кондиционирование обязательно'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'leninsky', name: 'Ленинский район', shortName: 'Ленинский', priceMultiplier: 0.95,
    intro: 'Юг: район завода им. Ленина, посёлок Свободный. Рабочий район.',
    housingProfile: 'Хрущёвки, серии 90-х, частный сектор.',
    uniqueFactors: ['Близость к промзонам', 'Низкие цены', 'Жаркий климат'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'sovetsky', name: 'Советский район', shortName: 'Советский', priceMultiplier: 1.00,
    intro: 'Большой район: III Интернационал, Цаги. Средние цены.',
    housingProfile: 'Хрущёвки, брежневки, новостройки от АСРО.',
    uniqueFactors: ['Развитая инфраструктура', 'Средне-высокий чек', 'Близость к Волге'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'trusovsky', name: 'Трусовский район', shortName: 'Трусовский', priceMultiplier: 0.85,
    intro: 'Через Волгу: Трусово, Балчуг. Самые низкие цены.',
    housingProfile: 'Хрущёвки, частный сектор, дачи.',
    uniqueFactors: ['Через Волгу от центра', 'Самые низкие цены', 'Много частного сектора'],
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
