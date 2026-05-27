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
  { slug: 'samarsky', name: 'Самарский район', shortName: 'Самарский', priceMultiplier: 1.25,
    intro: 'Историческое сердце: Старая Самара, набережная Волги. Самый дорогой район.',
    housingProfile: 'Дореволюционка в Старой Самаре, сталинки на Куйбышева, премиум на набережной.',
    uniqueFactors: ['Объекты исторического наследия', 'Высокие потолки в сталинках 3-3,3 м', 'Премиум на набережной Волги'],
    examples: [],
    topMetroStations: ['Алабинская']
  },
  { slug: 'oktyabrsky', name: 'Октябрьский район', shortName: 'Октябрьский', priceMultiplier: 1.05,
    intro: 'Большой район: Московское шоссе, "Радио", Аврора. Активная застройка.',
    housingProfile: 'Сталинки, хрущёвки, брежневки. Новостройки от ПИК, СОФЖИ.',
    uniqueFactors: ['Развитая инфраструктура', 'Аврора — престижный микрорайон', 'Средне-высокий чек'],
    examples: [],
    topMetroStations: ['Алабинская', 'Российская', 'Московская']
  },
  { slug: 'kirovsky', name: 'Кировский район', shortName: 'Кировский', priceMultiplier: 0.90,
    intro: 'Север: Безымянка, Юнгородок. Рабочий район, низкие цены.',
    housingProfile: 'Сталинки соцгорода Безымянка, хрущёвки, брежневки.',
    uniqueFactors: ['Сталинки Безымянки — историческая ценность (соцгород)', 'Близость к авиапрому', 'Низкие цены'],
    examples: [],
    topMetroStations: ['Безымянка', 'Победа']
  },
  { slug: 'sovetsky', name: 'Советский район', shortName: 'Советский', priceMultiplier: 0.95,
    intro: 'Большой жилой массив: Юнгородок, Промышленный. Средние цены.',
    housingProfile: 'Хрущёвки, брежневки, серии 90-х.',
    uniqueFactors: ['Средние цены', 'Хорошая транспортная развязка', 'Близость к промзонам'],
    examples: [],
    topMetroStations: ['Победа', 'Гагаринская']
  },
  { slug: 'promyshlenny', name: 'Промышленный район', shortName: 'Промышленный', priceMultiplier: 0.90,
    intro: 'Северо-запад: Металлург, активная новая застройка.',
    housingProfile: 'Хрущёвки в Металлурге, активная новая застройка от ПИК.',
    uniqueFactors: ['Активная новая застройка', 'Близость к ТЦ "Космопорт"', 'Низкие цены'],
    examples: [],
    topMetroStations: ['Кировская', 'Безымянка']
  },
  { slug: 'krasnoglinsky', name: 'Красноглинский район', shortName: 'Красноглинский', priceMultiplier: 0.85,
    intro: 'Самый удалённый: Красная Глинка, Управленческий. Частный сектор + типовая.',
    housingProfile: 'Хрущёвки, частный сектор, дачи. Точечная новая застройка.',
    uniqueFactors: ['Самые низкие цены', 'Много частного сектора', 'Удалённость от центра'],
    examples: [],
    topMetroStations: ['— (далеко, маршрутки)']
  }
];

export const repairTypes: RepairType[] = [
  { key: 'cosmetic', name: 'Косметический ремонт', ruShort: 'Косметика', pricePerSqM: 7500, description: 'Поверхностная отделка без замены коммуникаций.', includes: ['Подготовка стен', 'Покраска или обои', 'Замена пола', 'Натяжной потолок', 'Замена дверей', 'Замена розеток'], durationDays: '14-30 дней' },
  { key: 'capital', name: 'Капитальный ремонт', ruShort: 'Капремонт', pricePerSqM: 13875, description: 'Замена всех коммуникаций, выравнивание стен и полов, полная отделка.', includes: ['Демонтаж', 'Замена проводки', 'Замена труб', 'Выравнивание стен', 'Стяжка пола', 'Чистовая отделка', 'Сантехника, двери'], durationDays: '60-120 дней' },
  { key: 'euro', name: 'Евроремонт', ruShort: 'Евро', pricePerSqM: 17250, description: 'Современный качественный ремонт со средне-высокого сегмента материалов.', includes: ['Капитальная замена коммуникаций', 'Импортные/премиум материалы', 'Дизайн-проект (по желанию)', 'Скрытая проводка', 'Сложные потолки', 'Тёплый пол'], durationDays: '90-150 дней' },
  { key: 'designer', name: 'Дизайнерский ремонт', ruShort: 'Дизайн', pricePerSqM: 32250, description: 'Премиум-ремонт по индивидуальному проекту. Эксклюзивные материалы, авторский надзор.', includes: ['Авторский дизайн-проект', 'Эксклюзивные материалы', 'Премиум-сантехника', 'Натуральные материалы', 'Системы "Умный дом"', 'Авторский надзор'], durationDays: '180-365 дней' }
];
