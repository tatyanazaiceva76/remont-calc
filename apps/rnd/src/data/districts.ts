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
  { slug: 'leninsky', name: 'Ленинский район', shortName: 'Ленинский', priceMultiplier: 1.25,
    intro: 'Центр Ростова: Большая Садовая, Пушкинская, набережная Дона. Премиум-сегмент.',
    housingProfile: 'Сталинки и дореволюционка на Большой Садовой, премиум-новостройки на набережной.',
    uniqueFactors: ['Самые высокие цены', 'Жаркий климат — кондиционирование обязательно', 'Высокий статус центра'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'kirovsky', name: 'Кировский район', shortName: 'Кировский', priceMultiplier: 1.00,
    intro: 'Центр и северная часть: Театральный, Будённовский. Средне-высокий сегмент.',
    housingProfile: 'Сталинки в Театральном, хрущёвки, новостройки от Дон-Строй, Лотос.',
    uniqueFactors: ['Театральная площадь — центральная локация', 'Близость к парку Революции', 'Средний чек'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'oktyabrsky', name: 'Октябрьский район', shortName: 'Октябрьский', priceMultiplier: 0.95,
    intro: 'Запад: Западный, Чкаловский. Большой жилой массив со смешанной застройкой.',
    housingProfile: 'Хрущёвки в Западном, новостройки в Чкаловском.',
    uniqueFactors: ['Чкаловский — активная застройка', 'Близость к ЗЖМ', 'Средние цены'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'voroshilovsky', name: 'Ворошиловский район', shortName: 'Ворошиловский', priceMultiplier: 1.00,
    intro: 'Северо-запад: Северный, Военвед. Развивающийся район с массой новостроек.',
    housingProfile: 'Хрущёвки, серии 90-х, активная новая застройка от Дон-Строй, Patriot.',
    uniqueFactors: ['Северный — современная застройка', 'Близость к аэропорту Платов', 'Средне-высокий чек'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'sovetsky', name: 'Советский район', shortName: 'Советский', priceMultiplier: 0.95,
    intro: 'ЗЖМ: Западный, Сельмаш. Большая массовая застройка.',
    housingProfile: 'Хрущёвки и брежневки, серии 90-х. Точечная новая застройка.',
    uniqueFactors: ['Массовая застройка', 'Близость к ТЦ "Мега"', 'Средние цены'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'pervomaisky', name: 'Первомайский район', shortName: 'Первомайский', priceMultiplier: 0.90,
    intro: 'Запад: Темерник, Стройгородок. Низкие цены, рабочий район.',
    housingProfile: 'Хрущёвки, серии 80-х, частный сектор.',
    uniqueFactors: ['Самые низкие цены', 'Близость к Левбердону', 'Рабочий район'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'proletarsky', name: 'Пролетарский район', shortName: 'Пролетарский', priceMultiplier: 0.90,
    intro: 'Восток: Нахичевань, Чкалово. Старый город с собственной идентичностью.',
    housingProfile: 'Дореволюционка в Нахичевани, сталинки, хрущёвки.',
    uniqueFactors: ['Нахичевань — исторический район армян', 'Старый фонд требует замены коммуникаций', 'Низкие цены'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  }
];

export const repairTypes: RepairType[] = [
  { key: 'cosmetic', name: 'Косметический ремонт', ruShort: 'Косметика', pricePerSqM: 8000, description: 'Поверхностная отделка без замены коммуникаций.', includes: ['Подготовка стен', 'Покраска или обои', 'Замена пола', 'Натяжной потолок', 'Замена дверей', 'Замена розеток'], durationDays: '14-30 дней' },
  { key: 'capital', name: 'Капитальный ремонт', ruShort: 'Капремонт', pricePerSqM: 14800, description: 'Замена всех коммуникаций, выравнивание стен и полов, полная отделка.', includes: ['Демонтаж', 'Замена проводки', 'Замена труб', 'Выравнивание стен', 'Стяжка пола', 'Чистовая отделка', 'Сантехника, двери'], durationDays: '60-120 дней' },
  { key: 'euro', name: 'Евроремонт', ruShort: 'Евро', pricePerSqM: 18400, description: 'Современный качественный ремонт со средне-высокого сегмента материалов.', includes: ['Капитальная замена коммуникаций', 'Импортные/премиум материалы', 'Дизайн-проект (по желанию)', 'Скрытая проводка', 'Сложные потолки', 'Тёплый пол'], durationDays: '90-150 дней' },
  { key: 'designer', name: 'Дизайнерский ремонт', ruShort: 'Дизайн', pricePerSqM: 34400, description: 'Премиум-ремонт по индивидуальному проекту. Эксклюзивные материалы, авторский надзор.', includes: ['Авторский дизайн-проект', 'Эксклюзивные материалы', 'Премиум-сантехника', 'Натуральные материалы', 'Системы "Умный дом"', 'Авторский надзор'], durationDays: '180-365 дней' }
];
