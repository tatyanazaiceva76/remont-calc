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
  { slug: 'centralny', name: 'Центральный район', shortName: 'Центральный', priceMultiplier: 1.20,
    intro: 'Сердце Кемерово: Советский проспект, Площадь Советов. Премиум.',
    housingProfile: 'Сталинки на Советском, дореволюционка, премиум.',
    uniqueFactors: ['Самые высокие цены', 'Близость к Томи', 'Узкие улицы центра'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'leninsky', name: 'Ленинский район', shortName: 'Ленинский', priceMultiplier: 0.95,
    intro: 'Большой район: ФПК, Лесная Поляна. Активная новая застройка.',
    housingProfile: 'Хрущёвки на ФПК, новостройки в Лесной Поляне.',
    uniqueFactors: ['Лесная Поляна — современный микрорайон', 'Хорошая инфраструктура', 'Средние цены'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'zavodsky', name: 'Заводский район', shortName: 'Заводский', priceMultiplier: 0.90,
    intro: 'Юг: район КузГТУ, Шахтёров. Рабочий район.',
    housingProfile: 'Хрущёвки, сталинки, частный сектор.',
    uniqueFactors: ['Близость к КузГТУ', 'Шахтёрская история', 'Низкие цены'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'kirovsky', name: 'Кировский район', shortName: 'Кировский', priceMultiplier: 0.85,
    intro: 'Юго-запад: Промышленновский, КХЗ. Самые низкие цены.',
    housingProfile: 'Хрущёвки, серии 80-х, частный сектор.',
    uniqueFactors: ['Самые низкие цены', 'Промышленная история', 'Удалённость от центра'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'rudnichny', name: 'Рудничный район', shortName: 'Рудничный', priceMultiplier: 0.95,
    intro: 'Север: Кедровка, Северный. Активная новая застройка.',
    housingProfile: 'Хрущёвки, новостройки от Программы развития Кузбасса.',
    uniqueFactors: ['Активная новая застройка', 'Близость к ТЦ "Лапландия"', 'Средние цены'],
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
