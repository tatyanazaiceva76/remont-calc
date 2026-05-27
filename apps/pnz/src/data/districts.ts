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
    intro: 'Центр Пензы: ул. Московская, площадь Ленина. Премиум.',
    housingProfile: 'Сталинки, дореволюционка, премиум-новостройки.',
    uniqueFactors: ['Самые высокие цены', 'Близость к парку им. Белинского', 'Узкие улицы старого центра'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'oktyabrsky', name: 'Октябрьский район', shortName: 'Октябрьский', priceMultiplier: 1.00,
    intro: 'Большой район: район ГПЗ, Арбеково. Активная застройка.',
    housingProfile: 'Хрущёвки, серии 90-х, новостройки от Сметанин.',
    uniqueFactors: ['Арбеково — массовая новая застройка', 'Средние цены', 'Удобная транспортная сеть'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'pervomajsky', name: 'Первомайский район', shortName: 'Первомайский', priceMultiplier: 0.95,
    intro: 'Юг: Терновка, Шуист. Большой жилой массив.',
    housingProfile: 'Хрущёвки, серии 80-90-х. Точечная новая застройка.',
    uniqueFactors: ['Терновка — активная новая застройка', 'Средние цены', 'Близость к ТЦ "Гермес"'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'zheleznodorozhny', name: 'Железнодорожный район', shortName: 'Железнодорожный', priceMultiplier: 0.90,
    intro: 'Запад: район ж/д вокзала. Рабочий, низкие цены.',
    housingProfile: 'Хрущёвки, сталинки, частный сектор.',
    uniqueFactors: ['Близость к ж/д вокзалу', 'Низкие цены', 'Рабочая история'],
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
