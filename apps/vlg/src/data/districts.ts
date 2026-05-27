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
    intro: 'Центр Волгограда: Аллея Героев, Мамаев курган, центральная набережная. Премиум.',
    housingProfile: 'Сталинки на проспекте Ленина, премиум-новостройки на набережной.',
    uniqueFactors: ['Самые высокие цены', 'Близость к Мамаеву кургану — престижно', 'Длинный (узкий) город — особая логистика'],
    examples: [],
    topMetroStations: ['Площадь Ленина (скоростной трамвай)', 'Комсомольская', 'Площадь Чекистов']
  },
  { slug: 'voroshilovsky', name: 'Ворошиловский район', shortName: 'Ворошиловский', priceMultiplier: 1.00,
    intro: 'Юг центра: Дар-Гора, КИМ. Сталинский ансамбль и старый фонд.',
    housingProfile: 'Сталинки, хрущёвки, дореволюционка в районе старого ЦПКиО.',
    uniqueFactors: ['Сталинский ансамбль на ул. Двинская', 'Близость к центру', 'Средние цены'],
    examples: [],
    topMetroStations: ['Площадь Чекистов', 'ТЮЗ']
  },
  { slug: 'krasnoarmeysky', name: 'Красноармейский район', shortName: 'Красноармейский', priceMultiplier: 0.85,
    intro: 'Самый южный: Бекетовка. Самый удалённый от центра, низкие цены.',
    housingProfile: 'Хрущёвки, сталинки Бекетовки, частный сектор.',
    uniqueFactors: ['Самые низкие цены', 'Удалённость от центра (60+ мин)', 'Бекетовка — заводская история'],
    examples: [],
    topMetroStations: ['— (только скоростной трамвай не доходит)']
  },
  { slug: 'sovetsky', name: 'Советский район', shortName: 'Советский', priceMultiplier: 0.95,
    intro: 'Юг: ВПЗ, Дар-Гора. Средние цены, развитая инфраструктура.',
    housingProfile: 'Хрущёвки, брежневки, серии 90-х.',
    uniqueFactors: ['Близость к ВПЗ', 'Средние цены', 'Развитая инфраструктура'],
    examples: [],
    topMetroStations: ['Ельшанка', 'ЦПКиО']
  },
  { slug: 'traktorozavodsky', name: 'Тракторозаводский район', shortName: 'Тракторозаводский', priceMultiplier: 0.85,
    intro: 'Север: ВТЗ. Самые низкие цены, исторически рабочий район.',
    housingProfile: 'Сталинки соцгорода ВТЗ, хрущёвки, брежневки.',
    uniqueFactors: ['Сталинки ВТЗ — историческая ценность', 'Близость к ВТЗ', 'Самые низкие цены'],
    examples: [],
    topMetroStations: ['Тракторный завод (скоростной трамвай)']
  },
  { slug: 'krasnooktyabrsky', name: 'Краснооктябрьский район', shortName: 'Краснооктябрьский', priceMultiplier: 0.90,
    intro: 'Северо-центр: "Красный Октябрь". Большой жилой массив.',
    housingProfile: 'Сталинки, хрущёвки, точечная новая застройка.',
    uniqueFactors: ['Сталинки соцгорода "Красный Октябрь"', 'Промышленная история', 'Низкие цены'],
    examples: [],
    topMetroStations: ['Площадь Возрождения', 'Семь Ветров']
  },
  { slug: 'dzerzhinsky', name: 'Дзержинский район', shortName: 'Дзержинский', priceMultiplier: 0.95,
    intro: 'Северо-запад: Спартановка. Активная новая застройка.',
    housingProfile: 'Хрущёвки в Спартановке, активная новая застройка от ВКБ, ДомСтрой.',
    uniqueFactors: ['Спартановка — современная застройка', 'Средние цены', 'Близость к Волге'],
    examples: [],
    topMetroStations: ['Семь Ветров']
  }
];

export const repairTypes: RepairType[] = [
  { key: 'cosmetic', name: 'Косметический ремонт', ruShort: 'Косметика', pricePerSqM: 6500, description: 'Поверхностная отделка без замены коммуникаций.', includes: ['Подготовка стен', 'Покраска или обои', 'Замена пола', 'Натяжной потолок', 'Замена дверей', 'Замена розеток'], durationDays: '14-30 дней' },
  { key: 'capital', name: 'Капитальный ремонт', ruShort: 'Капремонт', pricePerSqM: 12025, description: 'Замена всех коммуникаций, выравнивание стен и полов, полная отделка.', includes: ['Демонтаж', 'Замена проводки', 'Замена труб', 'Выравнивание стен', 'Стяжка пола', 'Чистовая отделка', 'Сантехника, двери'], durationDays: '60-120 дней' },
  { key: 'euro', name: 'Евроремонт', ruShort: 'Евро', pricePerSqM: 14950, description: 'Современный качественный ремонт со средне-высокого сегмента материалов.', includes: ['Капитальная замена коммуникаций', 'Импортные/премиум материалы', 'Дизайн-проект (по желанию)', 'Скрытая проводка', 'Сложные потолки', 'Тёплый пол'], durationDays: '90-150 дней' },
  { key: 'designer', name: 'Дизайнерский ремонт', ruShort: 'Дизайн', pricePerSqM: 27950, description: 'Премиум-ремонт по индивидуальному проекту. Эксклюзивные материалы, авторский надзор.', includes: ['Авторский дизайн-проект', 'Эксклюзивные материалы', 'Премиум-сантехника', 'Натуральные материалы', 'Системы "Умный дом"', 'Авторский надзор'], durationDays: '180-365 дней' }
];
