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
    intro: 'Центр Кирова: ул. Спасская, Театральная площадь. Премиум.',
    housingProfile: 'Сталинки, дореволюционка, премиум-новостройки.',
    uniqueFactors: ['Самые высокие цены', 'Близость к парку Кирова', 'Узкие улицы старого центра'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'oktyabrsky', name: 'Октябрьский район', shortName: 'Октябрьский', priceMultiplier: 1.00,
    intro: 'Большой район: район ОЦМ. Активная застройка.',
    housingProfile: 'Хрущёвки, серии 80-90-х, новостройки от Кировспецмонтаж.',
    uniqueFactors: ['Активная новая застройка', 'Средние цены', 'Развитая инфраструктура'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'pervomajsky', name: 'Первомайский район', shortName: 'Первомайский', priceMultiplier: 0.90,
    intro: 'Запад: посёлок Чистые Пруды. Самые низкие цены.',
    housingProfile: 'Хрущёвки, частный сектор, дачи.',
    uniqueFactors: ['Самые низкие цены', 'Много частного сектора', 'Удалённость от центра'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'novovyatsky', name: 'Нововятский район', shortName: 'Нововятский', priceMultiplier: 0.85,
    intro: 'Юг (бывший посёлок): Нововятск. Удалённый, низкие цены.',
    housingProfile: 'Хрущёвки, частный сектор.',
    uniqueFactors: ['Самые низкие цены', 'Удалённость от центра', 'Промышленная история'],
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
