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
  { slug: 'pravoberezhny', name: 'Правобережный округ', shortName: 'Правобережный', priceMultiplier: 1.25,
    intro: 'Центр: ул. Карла Маркса, 130-й квартал, Иркутская слобода. Самый дорогой.',
    housingProfile: 'Дореволюционные деревянные дома (восстановленные), сталинки, премиум-новостройки.',
    uniqueFactors: ['Объекты ЮНЕСКО — 130-й квартал', 'Высокие цены', 'Сложная логистика по узким улицам'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'oktyabrsky', name: 'Октябрьский округ', shortName: 'Октябрьский', priceMultiplier: 1.05,
    intro: 'Большой район: Солнечный, Берёзовый. Активная новая застройка.',
    housingProfile: 'Хрущёвки, серии 80-90-х, новостройки от Норд-Вест, Восток-Центр.',
    uniqueFactors: ['Активная новая застройка', 'Близость к Ангаре', 'Средне-высокий чек'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'leninsky', name: 'Ленинский округ', shortName: 'Ленинский', priceMultiplier: 0.90,
    intro: 'Левый берег: Ново-Ленино, Иркутск-II. Доступные цены.',
    housingProfile: 'Хрущёвки, частный сектор, точечная новая застройка.',
    uniqueFactors: ['Самые низкие цены', 'Через мост от центра', 'Близость к авиазаводу'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'sverdlovsky', name: 'Свердловский округ', shortName: 'Свердловский', priceMultiplier: 1.00,
    intro: 'Академгородок, Студгородок. Научно-образовательный район.',
    housingProfile: 'Хрущёвки, брежневки, точечная новая застройка.',
    uniqueFactors: ['Близость к университетам', 'Большая концентрация научных работников', 'Средние цены'],
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
