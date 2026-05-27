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
  { slug: 'kirovsky', name: 'Кировский район', shortName: 'Кировский', priceMultiplier: 1.25,
    intro: 'Центр Ярославля: Стрелка, площадь Волкова. ЮНЕСКО. Премиум.',
    housingProfile: 'Дореволюционка в центре, сталинки на Свободы, премиум-новостройки.',
    uniqueFactors: ['ЮНЕСКО — особые правила', 'Самые высокие цены', 'Узкие улицы исторического центра'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'leninsky', name: 'Ленинский район', shortName: 'Ленинский', priceMultiplier: 1.00,
    intro: 'Большой район: проспект Ленина, Сокол. Средне-высокий сегмент.',
    housingProfile: 'Сталинки, хрущёвки, серии 90-х.',
    uniqueFactors: ['Близость к парку "Юбилейный"', 'Развитая инфраструктура', 'Средне-высокий чек'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'frunzensky', name: 'Фрунзенский район', shortName: 'Фрунзенский', priceMultiplier: 0.90,
    intro: 'Юг: Брагино, Нефтяник. Большой массив, низкие цены.',
    housingProfile: 'Хрущёвки в Брагино, серии 80-90-х. Точечная новая застройка.',
    uniqueFactors: ['Самые низкие цены', 'Близость к ЯНОС', 'Сильная конкуренция бригад'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'krasnoperekopsky', name: 'Красноперекопский район', shortName: 'Красноперекопский', priceMultiplier: 0.95,
    intro: 'Юго-запад: Перекоп, район нефтяников. Рабочий.',
    housingProfile: 'Хрущёвки, сталинки нефтяников.',
    uniqueFactors: ['Близость к ЯНОС', 'Рабочая история', 'Низкие цены'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'dzerzhinsky', name: 'Дзержинский район', shortName: 'Дзержинский', priceMultiplier: 0.95,
    intro: 'Север: Заволжский, Северный. Большой жилой массив.',
    housingProfile: 'Хрущёвки, серии 80-90-х, новостройки.',
    uniqueFactors: ['Активная новая застройка', 'Близость к Волге', 'Средние цены'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'zavolzhsky', name: 'Заволжский район', shortName: 'Заволжский', priceMultiplier: 0.90,
    intro: 'За Волгой: Тверицы. Самый удалённый.',
    housingProfile: 'Хрущёвки, частный сектор, дачи.',
    uniqueFactors: ['Через мост от центра', 'Низкие цены', 'Много частного сектора'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  }
];

export const repairTypes: RepairType[] = [
  { key: 'cosmetic', name: 'Косметический ремонт', ruShort: 'Косметика', pricePerSqM: 7500, description: 'Поверхностная отделка без замены коммуникаций.', includes: ['Подготовка стен', 'Покраска или обои', 'Замена пола', 'Натяжной потолок', 'Замена дверей', 'Замена розеток'], durationDays: '14-30 дней' },
  { key: 'capital', name: 'Капитальный ремонт', ruShort: 'Капремонт', pricePerSqM: 13875, description: 'Замена всех коммуникаций, выравнивание стен и полов, полная отделка.', includes: ['Демонтаж', 'Замена проводки', 'Замена труб', 'Выравнивание стен', 'Стяжка пола', 'Чистовая отделка', 'Сантехника, двери'], durationDays: '60-120 дней' },
  { key: 'euro', name: 'Евроремонт', ruShort: 'Евро', pricePerSqM: 17250, description: 'Современный качественный ремонт со средне-высокого сегмента материалов.', includes: ['Капитальная замена коммуникаций', 'Импортные/премиум материалы', 'Дизайн-проект', 'Скрытая проводка', 'Сложные потолки', 'Тёплый пол'], durationDays: '90-150 дней' },
  { key: 'designer', name: 'Дизайнерский ремонт', ruShort: 'Дизайн', pricePerSqM: 32250, description: 'Премиум-ремонт по индивидуальному проекту.', includes: ['Авторский дизайн', 'Эксклюзивные материалы', 'Премиум-сантехника', 'Натуральные материалы', '"Умный дом"', 'Авторский надзор'], durationDays: '180-365 дней' }
];
