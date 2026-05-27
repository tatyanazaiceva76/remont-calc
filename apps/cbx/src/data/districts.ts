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
    intro: 'Центр Чебоксар: Площадь Республики, ул. Калинина. Премиум.',
    housingProfile: 'Сталинки, премиум-новостройки на берегу Волги.',
    uniqueFactors: ['Самые высокие цены', 'Близость к Волге', 'Премиум-аудитория'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'kalininsky', name: 'Калининский район', shortName: 'Калининский', priceMultiplier: 1.05,
    intro: 'Большой район: Новоюжный, Дубравный. Активная застройка.',
    housingProfile: 'Хрущёвки, серии 90-х, новостройки от Чувашгражданстрой.',
    uniqueFactors: ['Новоюжный — активная застройка', 'Развитая инфраструктура', 'Средне-высокий чек'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'moskovsky', name: 'Московский район', shortName: 'Московский', priceMultiplier: 0.95,
    intro: 'Юго-восток: Эгерский, Чандрово. Средние цены.',
    housingProfile: 'Хрущёвки, серии 80-90-х, точечная новая застройка.',
    uniqueFactors: ['Близость к промзонам', 'Средние цены', 'Развитая транспортная сеть'],
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
