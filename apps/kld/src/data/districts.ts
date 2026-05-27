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
  { slug: 'centralny', name: 'Центральный район', shortName: 'Центральный', priceMultiplier: 1.25,
    intro: 'Сердце Калининграда: остров Канта, Рыбная деревня. Премиум.',
    housingProfile: 'Восстановленные немецкие дома, сталинки, премиум-новостройки в Рыбной деревне.',
    uniqueFactors: ['Немецкое архитектурное наследие', 'Самые высокие цены', 'Близость к острову Канта'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'leningradsky', name: 'Ленинградский район', shortName: 'Ленинградский', priceMultiplier: 1.05,
    intro: 'Север: район Сельмы, Северной горы. Развитый.',
    housingProfile: 'Сталинки, хрущёвки, серии 90-х, новостройки.',
    uniqueFactors: ['Близость к ТЦ "Эпицентр"', 'Средне-высокий чек', 'Развитая инфраструктура'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'moskovsky', name: 'Московский район', shortName: 'Московский', priceMultiplier: 1.00,
    intro: 'Восток: Чкаловск, Балтрайон. Активная застройка.',
    housingProfile: 'Хрущёвки, серии 90-х, новостройки от Балтстрой.',
    uniqueFactors: ['Активная новая застройка', 'Близость к ТЦ "Калина Молл"', 'Средние цены'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'oktyabrsky', name: 'Октябрьский район', shortName: 'Октябрьский', priceMultiplier: 0.95,
    intro: 'Юг: Сельма, посёлок Прибрежный. Большой массив.',
    housingProfile: 'Хрущёвки, частный сектор, новостройки.',
    uniqueFactors: ['Близость к Преголе', 'Средние цены', 'Удобная транспортная сеть'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  }
];

export const repairTypes: RepairType[] = [
  { key: 'cosmetic', name: 'Косметический ремонт', ruShort: 'Косметика', pricePerSqM: 8500, description: 'Поверхностная отделка без замены коммуникаций.', includes: ['Подготовка стен', 'Покраска или обои', 'Замена пола', 'Натяжной потолок', 'Замена дверей', 'Замена розеток'], durationDays: '14-30 дней' },
  { key: 'capital', name: 'Капитальный ремонт', ruShort: 'Капремонт', pricePerSqM: 15725, description: 'Замена всех коммуникаций, выравнивание стен и полов, полная отделка.', includes: ['Демонтаж', 'Замена проводки', 'Замена труб', 'Выравнивание стен', 'Стяжка пола', 'Чистовая отделка', 'Сантехника, двери'], durationDays: '60-120 дней' },
  { key: 'euro', name: 'Евроремонт', ruShort: 'Евро', pricePerSqM: 19550, description: 'Современный качественный ремонт со средне-высокого сегмента материалов.', includes: ['Капитальная замена коммуникаций', 'Импортные/премиум материалы', 'Дизайн-проект', 'Скрытая проводка', 'Сложные потолки', 'Тёплый пол'], durationDays: '90-150 дней' },
  { key: 'designer', name: 'Дизайнерский ремонт', ruShort: 'Дизайн', pricePerSqM: 36550, description: 'Премиум-ремонт по индивидуальному проекту.', includes: ['Авторский дизайн', 'Эксклюзивные материалы', 'Премиум-сантехника', 'Натуральные материалы', '"Умный дом"', 'Авторский надзор'], durationDays: '180-365 дней' }
];
