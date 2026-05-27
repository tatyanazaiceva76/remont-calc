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
  { slug: 'centralny', name: 'Центральный округ', shortName: 'Центральный', priceMultiplier: 1.20,
    intro: 'Центр Тюмени: ЦУМ, набережная Туры, ул. Республики. Премиум-сегмент.',
    housingProfile: 'Сталинки на Республики, дореволюционка в районе ЦУМа, премиум-новостройки на набережной.',
    uniqueFactors: ['Самые высокие цены', 'Близость к набережной — престижно', 'Узкие улицы старого центра'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'kalininsky', name: 'Калининский округ', shortName: 'Калининский', priceMultiplier: 1.05,
    intro: 'Большой район: Парфёново, Дом Обороны. Активная новая застройка.',
    housingProfile: 'Хрущёвки, серии 80-х, новостройки от ЭНКО, ТДСК.',
    uniqueFactors: ['Активная новая застройка', 'Развитая инфраструктура', 'Средне-высокий чек'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'leninsky', name: 'Ленинский округ', shortName: 'Ленинский', priceMultiplier: 0.95,
    intro: 'Тюменская слобода, район Дома Обороны. Смешанная застройка.',
    housingProfile: 'Хрущёвки, брежневки, точечная новая застройка.',
    uniqueFactors: ['Средние цены', 'Близость к лесопарку Затюменскому', 'Развитая инфраструктура'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'voskresenka', name: 'Восточный округ', shortName: 'Восточный', priceMultiplier: 0.95,
    intro: 'Заречная часть: Войновка, Лесобаза. Современная застройка.',
    housingProfile: 'Активная новая застройка от ТДСК, ЭНКО, Брусника.',
    uniqueFactors: ['Массовая новая застройка', 'Близость к Лесобазе', 'Средние цены'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'tsentralny-sad', name: 'Заречный округ', shortName: 'Заречный', priceMultiplier: 0.90,
    intro: 'За рекой Турой: ММС, Тарманы. Доступные цены.',
    housingProfile: 'Хрущёвки, частный сектор, точечная новая застройка.',
    uniqueFactors: ['Самые низкие цены', 'Большой частный сектор', 'Через реку от центра'],
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
