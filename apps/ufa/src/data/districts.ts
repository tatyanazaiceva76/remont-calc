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
  { slug: 'kirovsky', name: 'Кировский район', shortName: 'Кировский', priceMultiplier: 1.20,
    intro: 'Центр Уфы: Гостиный двор, Софьюшкина аллея. Премиум-сегмент.',
    housingProfile: 'Сталинки в центре, дореволюционка в районе старой Уфы, премиум-новостройки.',
    uniqueFactors: ['Самые высокие цены', 'Высокий статус — спрос на дизайнерский ремонт', 'Узкие улицы старого центра'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'oktyabrsky', name: 'Октябрьский район', shortName: 'Октябрьский', priceMultiplier: 1.05,
    intro: 'Большой район: проспект Октября, северо-восток города. Активная новая застройка.',
    housingProfile: 'Хрущёвки, серии 80-х, активная застройка ПИК, Талан, ЛСР.',
    uniqueFactors: ['Активная новая застройка', 'Развитая инфраструктура', 'Средне-высокий чек'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'sovetsky', name: 'Советский район', shortName: 'Советский', priceMultiplier: 1.00,
    intro: 'Сипайлово, Зелёная роща. Большой жилой массив со смешанной застройкой.',
    housingProfile: 'Хрущёвки в Зелёной роще, новостройки в Сипайлово.',
    uniqueFactors: ['Сипайлово — типовая позднесоветская застройка', 'Близость к воде (Уфимка)', 'Средние цены'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'leninsky', name: 'Ленинский район', shortName: 'Ленинский', priceMultiplier: 0.90,
    intro: 'Старая Уфа: Затон, Маяковского. Рабочий район с собственной идентичностью.',
    housingProfile: 'Сталинки и хрущёвки. Точечная новая застройка.',
    uniqueFactors: ['Низкие цены', 'Старый фонд требует замены коммуникаций', 'Близость к ТЭЦ'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'demsky', name: 'Дёмский район', shortName: 'Дёмский', priceMultiplier: 0.85,
    intro: 'Самый удалённый: Дёма. Низкие цены, частный сектор, дачи.',
    housingProfile: 'Хрущёвки, частный сектор, единичные новостройки.',
    uniqueFactors: ['Самые низкие цены', 'Много частного сектора', 'Удалённость от центра'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'kalininsky', name: 'Калининский район', shortName: 'Калининский', priceMultiplier: 0.95,
    intro: 'Север: Черниковка, Шакша. Промышленный район.',
    housingProfile: 'Сталинки соцгорода Черниковка, хрущёвки, брежневки.',
    uniqueFactors: ['Сталинки Черниковки — историческая ценность', 'Промышленная история', 'Низкие цены'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'ordzhonikidzevsky', name: 'Орджоникидзевский район', shortName: 'Орджоникидзевский', priceMultiplier: 0.90,
    intro: 'Север: район нефтехимии. Самые низкие цены, рабочая застройка.',
    housingProfile: 'Хрущёвки, серии 80-х, точечные новостройки.',
    uniqueFactors: ['Близость к нефтехимии — специфика', 'Самые низкие цены', 'Рабочий район'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  }
];

export const repairTypes: RepairType[] = [
  { key: 'cosmetic', name: 'Косметический ремонт', ruShort: 'Косметика', pricePerSqM: 7500, description: 'Поверхностная отделка без замены коммуникаций.', includes: ['Подготовка стен', 'Покраска или обои', 'Замена пола', 'Натяжной потолок', 'Замена дверей', 'Замена розеток'], durationDays: '14-30 дней' },
  { key: 'capital', name: 'Капитальный ремонт', ruShort: 'Капремонт', pricePerSqM: 13875, description: 'Замена всех коммуникаций, выравнивание стен и полов, полная отделка.', includes: ['Демонтаж', 'Замена проводки', 'Замена труб', 'Выравнивание стен', 'Стяжка пола', 'Чистовая отделка', 'Сантехника, двери'], durationDays: '60-120 дней' },
  { key: 'euro', name: 'Евроремонт', ruShort: 'Евро', pricePerSqM: 17250, description: 'Современный качественный ремонт со средне-высокого сегмента материалов.', includes: ['Капитальная замена коммуникаций', 'Импортные/премиум материалы', 'Дизайн-проект (по желанию)', 'Скрытая проводка', 'Сложные потолки', 'Тёплый пол'], durationDays: '90-150 дней' },
  { key: 'designer', name: 'Дизайнерский ремонт', ruShort: 'Дизайн', pricePerSqM: 32250, description: 'Премиум-ремонт по индивидуальному проекту. Эксклюзивные материалы, авторский надзор.', includes: ['Авторский дизайн-проект', 'Эксклюзивные материалы', 'Премиум-сантехника', 'Натуральные материалы', 'Системы "Умный дом"', 'Авторский надзор'], durationDays: '180-365 дней' }
];
