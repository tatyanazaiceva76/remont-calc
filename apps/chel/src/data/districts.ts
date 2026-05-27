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
    intro: 'Сердце города: Кировка, Театральная площадь, набережная Миасса. Премиум-сегмент.',
    housingProfile: 'Сталинки на проспекте Ленина, дореволюционка в районе Кировки, премиум-новостройки.',
    uniqueFactors: ['Самые высокие цены', 'Промышленный смог — обязательная вентиляция', 'Премиум-аудитория'],
    examples: [],
    topMetroStations: ['— (метро не достроено)']
  },
  { slug: 'kalininsky', name: 'Калининский район', shortName: 'Калининский', priceMultiplier: 1.00,
    intro: 'Большой район: Северо-запад, "Тополиная аллея". Сочетание старой и новой застройки.',
    housingProfile: 'Хрущёвки, серии 80-х, активная застройка ПИК и местных в Тополиной аллее.',
    uniqueFactors: ['Тополиная аллея — массовая новая застройка', 'Средние цены', 'Развитая инфраструктура'],
    examples: [],
    topMetroStations: ['— (метро не достроено)']
  },
  { slug: 'leninsky', name: 'Ленинский район', shortName: 'Ленинский', priceMultiplier: 0.90,
    intro: 'Север города, рядом с ЧТЗ. Рабочий район с большим жилфондом.',
    housingProfile: 'Сталинки соцгорода ЧТЗ, хрущёвки, брежневки. Активная новая застройка.',
    uniqueFactors: ['Сталинки ЧТЗ — историческая ценность', 'Близость к промзоне', 'Низкие цены'],
    examples: [],
    topMetroStations: ['— (метро не достроено)']
  },
  { slug: 'sovetsky', name: 'Советский район', shortName: 'Советский', priceMultiplier: 1.00,
    intro: 'Запад: 12-й микрорайон, АМЗ. Развивающийся район с активной новой застройкой.',
    housingProfile: 'Хрущёвки, серии 90-х, новостройки от Гринфлайт, Технология.',
    uniqueFactors: ['12-й микрорайон — современная застройка', 'Близость к Шершнёвскому водохранилищу', 'Средний чек'],
    examples: [],
    topMetroStations: ['— (метро не достроено)']
  },
  { slug: 'traktorozavodsky', name: 'Тракторозаводский район', shortName: 'Тракторозаводский', priceMultiplier: 0.85,
    intro: 'Восток: ЧТЗ, Чурилово. Самый недорогой район с типовой советской застройкой.',
    housingProfile: 'Хрущёвки и серии 90-х. Точечная новая застройка.',
    uniqueFactors: ['Самые низкие цены', 'Близость к ЧТЗ — рабочий район', 'Сильная конкуренция местных бригад'],
    examples: [],
    topMetroStations: ['— (метро не достроено)']
  },
  { slug: 'kurchatovsky', name: 'Курчатовский район', shortName: 'Курчатовский', priceMultiplier: 0.95,
    intro: 'Северо-запад. Активная новая застройка от Гринфлайт и Технология.',
    housingProfile: 'Активная новая застройка 2010-х, точечно старый фонд.',
    uniqueFactors: ['Много новостроек', 'Молодые семьи — спрос на евро', 'Близость к Шершнёвскому водохранилищу'],
    examples: [],
    topMetroStations: ['— (метро не достроено)']
  }
];

export const repairTypes: RepairType[] = [
  { key: 'cosmetic', name: 'Косметический ремонт', ruShort: 'Косметика', pricePerSqM: 7000, description: 'Поверхностная отделка без замены коммуникаций.', includes: ['Подготовка стен', 'Покраска или обои', 'Замена пола', 'Натяжной потолок', 'Замена дверей', 'Замена розеток'], durationDays: '14-30 дней' },
  { key: 'capital', name: 'Капитальный ремонт', ruShort: 'Капремонт', pricePerSqM: 12950, description: 'Замена всех коммуникаций, выравнивание стен и полов, полная отделка.', includes: ['Демонтаж', 'Замена проводки', 'Замена труб', 'Выравнивание стен', 'Стяжка пола', 'Чистовая отделка', 'Сантехника, двери'], durationDays: '60-120 дней' },
  { key: 'euro', name: 'Евроремонт', ruShort: 'Евро', pricePerSqM: 16100, description: 'Современный качественный ремонт со средне-высокого сегмента материалов.', includes: ['Капитальная замена коммуникаций', 'Импортные/премиум материалы', 'Дизайн-проект (по желанию)', 'Скрытая проводка', 'Сложные потолки', 'Тёплый пол'], durationDays: '90-150 дней' },
  { key: 'designer', name: 'Дизайнерский ремонт', ruShort: 'Дизайн', pricePerSqM: 30100, description: 'Премиум-ремонт по индивидуальному проекту. Эксклюзивные материалы, авторский надзор.', includes: ['Авторский дизайн-проект', 'Эксклюзивные материалы', 'Премиум-сантехника', 'Натуральные материалы', 'Системы "Умный дом"', 'Авторский надзор'], durationDays: '180-365 дней' }
];
