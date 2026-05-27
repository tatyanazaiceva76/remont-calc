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
  { slug: 'volzhsky', name: 'Волжский район', shortName: 'Волжский', priceMultiplier: 1.20,
    intro: 'Центр: проспект Кирова, набережная Космонавтов. Премиум.',
    housingProfile: 'Сталинки на Кирова, дореволюционка, премиум на набережной.',
    uniqueFactors: ['Самые высокие цены', 'Близость к Волге', 'Узкие улицы старой части'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'kirovsky', name: 'Кировский район', shortName: 'Кировский', priceMultiplier: 0.95,
    intro: 'Северо-запад: 2-я Дачная, Юбилейный. Большой жилой массив.',
    housingProfile: 'Хрущёвки, серии 90-х, новостройки от Кронверк, Сарград.',
    uniqueFactors: ['Юбилейный — активная новая застройка', 'Средние цены', 'Удобная логистика'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'leninsky', name: 'Ленинский район', shortName: 'Ленинский', priceMultiplier: 0.90,
    intro: 'Северо-запад: Солнечный, 6-й Квартал. Рабочий район, низкие цены.',
    housingProfile: 'Хрущёвки, серии 80-х, частный сектор.',
    uniqueFactors: ['Низкие цены', 'Близость к промзонам', 'Удалённость от центра'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'oktyabrsky', name: 'Октябрьский район', shortName: 'Октябрьский', priceMultiplier: 1.00,
    intro: 'Центр: проспект 50 лет Октября. Средние цены.',
    housingProfile: 'Сталинки, хрущёвки, точечная новая застройка.',
    uniqueFactors: ['Близость к центру', 'Развитая транспортная сеть', 'Средний чек'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'frunzensky', name: 'Фрунзенский район', shortName: 'Фрунзенский', priceMultiplier: 1.05,
    intro: 'Центр: ул. Радищева, парк "Липки". Развитая инфраструктура.',
    housingProfile: 'Сталинки, дореволюционка, точечная новая застройка.',
    uniqueFactors: ['Близость к Липкам', 'Высокий чек', 'Старый фонд требует замены коммуникаций'],
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
