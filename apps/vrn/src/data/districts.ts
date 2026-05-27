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
  { slug: 'centralny', name: 'Центральный район', shortName: 'Центральный', priceMultiplier: 1.25,
    intro: 'Сердце Воронежа: проспект Революции, площадь Ленина. Премиум-сегмент.',
    housingProfile: 'Сталинки на проспекте Революции, дореволюционка в районе Каменного моста, премиум.',
    uniqueFactors: ['Самые высокие цены', 'Высокий статус', 'Узкие улицы старого центра'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'kominternovsky', name: 'Коминтерновский район', shortName: 'Коминтерновский', priceMultiplier: 1.05,
    intro: 'Северо-запад: Северный микрорайон, Машмет. Активная новая застройка.',
    housingProfile: 'Хрущёвки в Машмете, активная новая застройка ВДК, ДСК в Северном.',
    uniqueFactors: ['Северный — массовая новая застройка', 'Близость к ТЦ "Град"', 'Средне-высокий чек'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'levoberezhny', name: 'Левобережный район', shortName: 'Левобережный', priceMultiplier: 0.85,
    intro: 'Заречная часть: Машмет, Шилово. Самые низкие цены, рабочий район.',
    housingProfile: 'Хрущёвки, серии 80-х, частный сектор.',
    uniqueFactors: ['Самые низкие цены', 'Близость к промзонам', 'Через реку от центра'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'leninsky', name: 'Ленинский район', shortName: 'Ленинский', priceMultiplier: 1.00,
    intro: 'Центр-юг: Дзержинский, Чижовка. Средние цены, развитая инфраструктура.',
    housingProfile: 'Сталинки, хрущёвки, точечная новая застройка.',
    uniqueFactors: ['Средний чек', 'Развитая транспортная сеть', 'Близость к центру'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'sovetsky', name: 'Советский район', shortName: 'Советский', priceMultiplier: 0.95,
    intro: 'Запад: Юго-Западный микрорайон. Большая массовая застройка.',
    housingProfile: 'Брежневки, серии 80-90-х. Новостройки в Тенистом.',
    uniqueFactors: ['ЮЗМ — типовая позднесоветская застройка', 'Средние цены', 'Хорошая инфраструктура'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  },
  { slug: 'zheleznodorozhny', name: 'Железнодорожный район', shortName: 'Железнодорожный', priceMultiplier: 0.90,
    intro: 'Северо-восток: ЛТЗ, Сомово. Промышленный район.',
    housingProfile: 'Хрущёвки, сталинки, частный сектор.',
    uniqueFactors: ['Близость к ЛТЗ — рабочий район', 'Низкие цены', 'Зелёный, рядом с лесом'],
    examples: [],
    topMetroStations: ['— (нет метро)']
  }
];

export const repairTypes: RepairType[] = [
  { key: 'cosmetic', name: 'Косметический ремонт', ruShort: 'Косметика', pricePerSqM: 7000, description: 'Поверхностная отделка без замены коммуникаций.', includes: ['Подготовка стен', 'Покраска или обои', 'Замена пола', 'Натяжной потолок', 'Замена дверей', 'Замена розеток'], durationDays: '14-30 дней' },
  { key: 'capital', name: 'Капитальный ремонт', ruShort: 'Капремонт', pricePerSqM: 12950, description: 'Замена всех коммуникаций, выравнивание стен и полов, полная отделка.', includes: ['Демонтаж', 'Замена проводки', 'Замена труб', 'Выравнивание стен', 'Стяжка пола', 'Чистовая отделка', 'Сантехника, двери'], durationDays: '60-120 дней' },
  { key: 'euro', name: 'Евроремонт', ruShort: 'Евро', pricePerSqM: 16100, description: 'Современный качественный ремонт со средне-высокого сегмента материалов.', includes: ['Капитальная замена коммуникаций', 'Импортные/премиум материалы', 'Дизайн-проект (по желанию)', 'Скрытая проводка', 'Сложные потолки', 'Тёплый пол'], durationDays: '90-150 дней' },
  { key: 'designer', name: 'Дизайнерский ремонт', ruShort: 'Дизайн', pricePerSqM: 30100, description: 'Премиум-ремонт по индивидуальному проекту. Эксклюзивные материалы, авторский надзор.', includes: ['Авторский дизайн-проект', 'Эксклюзивные материалы', 'Премиум-сантехника', 'Натуральные материалы', 'Системы "Умный дом"', 'Авторский надзор'], durationDays: '180-365 дней' }
];
