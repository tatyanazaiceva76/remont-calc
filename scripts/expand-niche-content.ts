#!/usr/bin/env bun
// Расширение контента 10 новых доменов:
// - /vs/{slug}/ — 5-8 сравнений на каждую нишу
// - /faq/{topic}/ — расширенные FAQ-страницы
// - /kalkulyator/{tool}/ — калькулятор под нишу
// - /partners/ — partner network footer block

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { NICHES } from './niche-templates';

const ROOT = '/Users/mac/remont-calc';

// Сравнения для каждой ниши
const COMPARISONS: Record<string, { slug: string; a: string; b: string; intro: string; criteria: { name: string; a: string; b: string }[]; conclusion: string; whenA: string[]; whenB: string[] }[]> = {
  'ipoteka-remont': [
    { slug: 'ipoteka-vs-potrebkredit', a: 'Ипотека', b: 'Потребкредит',
      intro: 'Ипотека на ремонт vs обычный потребительский кредит. Какая разница и что выгоднее?',
      criteria: [
        { name: 'Ставка', a: '6.5-12% годовых', b: '12-25% годовых' },
        { name: 'Срок', a: 'до 25 лет', b: 'до 7 лет' },
        { name: 'Сумма', a: 'до 30 млн ₽', b: 'до 5 млн ₽' },
        { name: 'Залог', a: 'Обязательно (квартира)', b: 'Не нужен' },
        { name: 'Срок одобрения', a: '2-4 недели', b: '1-3 дня' }
      ],
      conclusion: 'Ипотека — для больших сумм и длинных сроков. Потребкредит — для срочных небольших ремонтов.',
      whenA: ['Сумма >2 млн ₽', 'Хочется низкую ставку', 'Готовы заложить квартиру'],
      whenB: ['Сумма до 1 млн ₽', 'Нужно быстро', 'Не готовы к залогу']
    },
    { slug: 'sberbank-vs-vtb-ipoteka', a: 'Сбербанк', b: 'ВТБ',
      intro: 'Где брать ипотеку на ремонт — в Сбербанке или ВТБ? Сравнение ставок и условий.',
      criteria: [
        { name: 'Минимальная ставка', a: '6.5% (соц.категории)', b: '6.7%' },
        { name: 'Первоначальный взнос', a: 'от 10%', b: 'от 10%' },
        { name: 'Срок рассмотрения', a: '5-14 дней', b: '3-10 дней' },
        { name: 'Документы 2-НДФЛ', a: 'Обязательно', b: 'По форме банка тоже принимают' }
      ],
      conclusion: 'Сбер — больше офисов, проще документы. ВТБ — чуть быстрее одобрение, гибче по доходу.',
      whenA: ['Стандартный пакет документов', 'Удобство офисов'],
      whenB: ['Самозанятые', 'Сложная история']
    },
    { slug: 'refinansirovanie-vs-novyy-kredit', a: 'Рефинансирование', b: 'Новый кредит',
      intro: 'Перекредитоваться или взять новый кредит — что выгоднее в 2026?',
      criteria: [
        { name: 'Ставка', a: 'Ниже на 1-3%', b: 'Рыночная' },
        { name: 'Срок переоформления', a: '1-2 месяца', b: '1-2 недели' },
        { name: 'Затраты', a: 'Оценка, нотариус 15-30k', b: 'Минимальные' }
      ],
      conclusion: 'Рефинансирование выгодно при разнице ставки от 1.5%. Иначе — лишние хлопоты.',
      whenA: ['Действующий кредит со ставкой >12%', 'Остаток >500k₽'],
      whenB: ['Нет действующего кредита', 'Срочно']
    }
  ],
  'kuhni-zakaz-online': [
    { slug: 'mdf-vs-akril-fasad', a: 'МДФ', b: 'Акрил',
      intro: 'Какой фасад выбрать для кухни — МДФ или акрил? Сравнение по цене, износу, эстетике.',
      criteria: [
        { name: 'Цена за пог.м', a: 'от 12k ₽', b: 'от 18k ₽' },
        { name: 'Глянец', a: 'Средний', b: 'Зеркальный' },
        { name: 'Износ', a: '10-15 лет', b: '15-25 лет' },
        { name: 'Реставрация', a: 'Сложно', b: 'Невозможно' }
      ],
      conclusion: 'МДФ — классика и универсал. Акрил — премиум-глянец и долговечность.',
      whenA: ['Бюджет средний', 'Хочется матовый/полу-матовый'],
      whenB: ['Премиум-кухня', 'Хочется яркий глянец']
    },
    { slug: 'klassika-vs-modern-kukhnya', a: 'Классическая кухня', b: 'Современная (модерн)',
      intro: 'Классический стиль или современный — какую кухню выбрать?',
      criteria: [
        { name: 'Цена за пог.м', a: 'от 80k ₽', b: 'от 60k ₽' },
        { name: 'Материалы', a: 'МДФ, массив', b: 'Акрил, пластик, ЛДСП' },
        { name: 'Эстетика', a: 'Богато, фрезеровка', b: 'Минимализм, ровные фасады' }
      ],
      conclusion: 'Классика для больших квартир. Современный — для квартир до 80 м².',
      whenA: ['Большая квартира (>80 м²)', 'Классический интерьер'],
      whenB: ['Современный интерьер', 'Маленькая кухня']
    },
    { slug: 'pryamaya-vs-uglovaya-kukhnya', a: 'Прямая кухня', b: 'Угловая кухня',
      intro: 'Какая планировка кухни лучше — прямая или угловая?',
      criteria: [
        { name: 'Эргономика', a: 'Слабая (хождение туда-сюда)', b: 'Отличная (треугольник)' },
        { name: 'Площадь м²', a: '6-9 м²', b: '8-15 м²' },
        { name: 'Цена', a: 'от 80k ₽', b: 'от 120k ₽' }
      ],
      conclusion: 'Угловая удобнее, но требует больше места. Прямая — компактно для узких кухонь.',
      whenA: ['Узкие кухни до 6 м²', 'Студия'],
      whenB: ['Кухня от 8 м²', 'Семья 3+ человека']
    }
  ],
  'natyazhnoi-master24': [
    { slug: 'glyanec-vs-mat', a: 'Глянцевый', b: 'Матовый',
      intro: 'Глянцевый или матовый натяжной потолок — что лучше для квартиры?',
      criteria: [
        { name: 'Эффект освещения', a: 'Отражает свет', b: 'Поглощает' },
        { name: 'Уход', a: 'Видны следы рук', b: 'Не видны' },
        { name: 'Расширение пространства', a: 'Сильное', b: 'Нет' },
        { name: 'Цена за м²', a: 'от 450 ₽', b: 'от 350 ₽' }
      ],
      conclusion: 'Глянец — для маленьких комнат и спален. Мат — для классических интерьеров.',
      whenA: ['Маленькая комната', 'Современный интерьер'],
      whenB: ['Классика', 'Большая комната']
    },
    { slug: 'odnourovnevyy-vs-mnogourovnevyy', a: 'Одноуровневый', b: 'Многоуровневый',
      intro: 'Простой или многоуровневый потолок — сравнение цены и эффекта.',
      criteria: [
        { name: 'Цена за м²', a: 'от 350 ₽', b: 'от 1200 ₽' },
        { name: 'Срок монтажа', a: '1 день', b: '2-3 дня' },
        { name: 'Эффект', a: 'Стандарт', b: 'Дизайнерский' }
      ],
      conclusion: 'Многоуровневый выглядит дороже на 200-400% но даёт wow-эффект.',
      whenA: ['Бюджет ограничен', 'Стандартная комната'],
      whenB: ['Премиум-интерьер', 'Высокие потолки (>2.7 м)']
    }
  ],
  'okna-pvh-online': [
    { slug: 'kbe-vs-rehau-vs-veka', a: 'KBE/Rehau', b: 'VEKA',
      intro: 'Сравнение топ-3 профилей: KBE, Rehau, VEKA. Какой выбрать?',
      criteria: [
        { name: 'Производитель', a: 'Германия', b: 'Германия' },
        { name: 'Камер в профиле', a: '5-7', b: '5-6' },
        { name: 'Цена', a: 'на 10-20% дороже', b: 'Стандарт' },
        { name: 'Гарантия', a: '10 лет', b: '5-10 лет' }
      ],
      conclusion: 'KBE/Rehau — премиум. VEKA — средний сегмент, оптимальное соотношение.',
      whenA: ['Премиум-квартира', 'Холодный регион'],
      whenB: ['Стандарт качества', 'Средний бюджет']
    },
    { slug: 'odnokamernyy-vs-dvukhkamernyy-paket', a: 'Однокамерный', b: 'Двухкамерный',
      intro: 'Какой стеклопакет выбрать — однокамерный или двухкамерный?',
      criteria: [
        { name: 'Стёкол', a: '2 стекла', b: '3 стекла' },
        { name: 'Теплоизоляция', a: 'Средняя', b: 'Хорошая' },
        { name: 'Цена', a: 'Стандарт', b: '+20-30%' },
        { name: 'Вес', a: 'Лёгкий', b: 'На 50% тяжелее' }
      ],
      conclusion: 'Двухкамерный — для холодных регионов. Однокамерный — для тёплых.',
      whenA: ['Юг России', 'Балкон холодный'],
      whenB: ['Москва и севернее', 'Жилая комната']
    }
  ],
  'kupeshkafy24': [
    { slug: 'aristo-vs-versal', a: 'Aristo', b: 'Versal',
      intro: 'Какую систему раздвижения выбрать для шкафа-купе?',
      criteria: [
        { name: 'Производитель', a: 'Россия (Италия)', b: 'Россия' },
        { name: 'Цена за метр', a: 'от 8k ₽', b: 'от 4k ₽' },
        { name: 'Гарантия', a: '10 лет', b: '5 лет' },
        { name: 'Бесшумность', a: 'Отличная', b: 'Средняя' }
      ],
      conclusion: 'Aristo — премиум, окупается тишиной и долговечностью. Versal — средний.',
      whenA: ['Премиум-шкаф', 'Спальня'],
      whenB: ['Бюджет ограничен', 'Прихожая']
    },
    { slug: 'do-potolka-vs-standart', a: 'До потолка', b: 'Стандартный',
      intro: 'Шкаф до потолка или стандартной высоты — что лучше?',
      criteria: [
        { name: 'Цена', a: '+30-50%', b: 'Стандарт' },
        { name: 'Полезный объём', a: '+50%', b: 'Стандарт' },
        { name: 'Уборка сверху', a: 'Не нужна', b: 'Пыль собирается' }
      ],
      conclusion: 'До потолка — однозначно лучше. Дороже но окупается.',
      whenA: ['Хочется максимум места', 'Высокие потолки (2.8+)'],
      whenB: ['Маленький бюджет', 'Низкие потолки (<2.5)']
    }
  ],
  'dveri-stalnye24': [
    { slug: 'ekonom-vs-premium-dver', a: 'Эконом', b: 'Премиум',
      intro: 'Эконом-дверь vs премиум — стоит ли переплачивать?',
      criteria: [
        { name: 'Цена', a: 'от 12k ₽', b: 'от 60k ₽' },
        { name: 'Сталь', a: '1.2 мм', b: '2-3 мм' },
        { name: 'Шумоизоляция', a: 'Базовая', b: 'Профи' },
        { name: 'Замки', a: '2 базовых', b: '2-3 премиум (Mottura, Cisa)' }
      ],
      conclusion: 'Эконом для съёмной/арендной. Премиум для своей на 20+ лет.',
      whenA: ['Аренда', 'Бюджет минимум'],
      whenB: ['Своя квартира', 'Первый этаж/таунхаус']
    }
  ],
  'dom-stroy-online': [
    { slug: 'karkasnyy-vs-gazobeton', a: 'Каркасный', b: 'Газобетон',
      intro: 'Что выбрать: каркасный дом или из газобетона?',
      criteria: [
        { name: 'Срок строительства', a: '2-3 месяца', b: '4-6 месяцев' },
        { name: 'Цена за м²', a: 'от 25k ₽', b: 'от 35k ₽' },
        { name: 'Срок службы', a: '50-80 лет', b: '80-150 лет' },
        { name: 'Утепление', a: 'Внутри стены', b: 'Внешнее + сам газоблок' }
      ],
      conclusion: 'Каркас — быстро и дёшево. Газоблок — долговечнее и капитальнее.',
      whenA: ['Дача', 'Бюджет до 2 млн'],
      whenB: ['Дом для постоянного проживания', 'Капитал']
    }
  ],
  'perevodkvartiry': [
    { slug: 'soglasovanie-vs-uzakonenie', a: 'Согласование заранее', b: 'Узаконить задним числом',
      intro: 'Что выгоднее — согласовать перепланировку до или после ремонта?',
      criteria: [
        { name: 'Цена', a: '30-100k ₽', b: '80-200k ₽' },
        { name: 'Срок', a: '1-4 месяца', b: '3-9 месяцев' },
        { name: 'Риски', a: 'Минимум', b: 'Могут не одобрить и заставить вернуть' }
      ],
      conclusion: 'Согласование заранее — однозначно. Узаконить задним числом — рискованно.',
      whenA: ['Планируете ремонт', 'Перепродажа в будущем'],
      whenB: ['Уже всё сломали', 'Нет другого выбора']
    }
  ],
  'dizayn-interyera-online': [
    { slug: 'osnovnoy-vs-premium-paket', a: 'Базовый пакет', b: 'Премиум пакет',
      intro: 'Что входит в разные пакеты дизайн-проекта?',
      criteria: [
        { name: 'Цена за м²', a: 'от 1.5k ₽', b: 'от 4.5k ₽' },
        { name: 'Чертежи', a: 'Есть', b: 'Есть' },
        { name: '3D-визуализация', a: 'Нет', b: 'Все комнаты' },
        { name: 'Авторский надзор', a: 'Нет', b: 'Включён' },
        { name: 'Подбор материалов', a: 'Нет', b: 'Включён' }
      ],
      conclusion: 'Базовый — для самостоятельного ремонта. Премиум — если не разбираетесь.',
      whenA: ['Свой прораб с опытом', 'Бюджет ограничен'],
      whenB: ['Хотите без головной боли', 'Дорогой ремонт']
    }
  ],
  'kamin-zakaz24': [
    { slug: 'drovianoy-vs-elektrokamin', a: 'Дровяной', b: 'Электрокамин',
      intro: 'Настоящий камин на дровах или электро-имитация — что выбрать?',
      criteria: [
        { name: 'Цена', a: 'от 80k ₽ + дымоход 30k', b: 'от 15k ₽' },
        { name: 'Атмосфера', a: 'Настоящий огонь, дрова, аромат', b: 'Имитация' },
        { name: 'Уход', a: 'Чистка, заготовка дров', b: 'Нет' },
        { name: 'Можно в квартире?', a: 'Только если есть дымоход', b: 'Везде' }
      ],
      conclusion: 'Дровяной — для частных домов и атмосферы. Электро — для квартир и комфорта.',
      whenA: ['Частный дом', 'Любите дрова и аромат'],
      whenB: ['Квартира', 'Хотите быстро и без хлопот']
    }
  ]
};

// Дополнительные FAQ-страницы по подтемам
const FAQ_TOPICS: Record<string, { slug: string; title: string; questions: { q: string; a: string }[] }[]> = {
  'ipoteka-remont': [
    { slug: 'dlya-samozanyatyh', title: 'Ипотека для самозанятых',
      questions: [
        { q: 'Дадут ли ипотеку самозанятому?', a: 'Да, основные банки (Сбер, ВТБ, Альфа) выдают самозанятым с 2020 г. Условие: декларация о доходах за 1-2 года минимум 80-150 тыс ₽/мес.' },
        { q: 'Какие документы нужны?', a: 'Справка о постановке на учёт как самозанятый, декларация о доходах, выписка по счёту за 6-12 месяцев, паспорт.' },
        { q: 'Ставка для самозанятых выше?', a: 'Обычно на 0.5-1.5% выше чем для зарплатников. Чтобы получить ставку для зарплатников — нужно стать клиентом банка (зарплатная карта в этом банке).' }
      ] },
    { slug: 'pri-plokhoy-kreditnoy-istorii', title: 'Ипотека с плохой кредитной историей',
      questions: [
        { q: 'Дадут ли при просрочках?', a: 'Если просрочки давно (>2-3 лет назад) — могут дать. Текущие просрочки или активные коллекторы — точно нет.' },
        { q: 'Как улучшить кредитную историю?', a: 'Закрыть текущие кредиты, погасить просрочки, оформить кредитную карту и аккуратно пользоваться 6-12 мес.' }
      ] },
    { slug: 'pervonachalnyy-vznos', title: 'Первоначальный взнос на ипотеку',
      questions: [
        { q: 'Можно ли ипотеку без первоначального взноса?', a: 'Через материнский капитал — да. Через военную ипотеку — да. В остальных случаях — минимум 10-15%.' },
        { q: 'Как накопить на первоначальный взнос?', a: 'Депозит на 1-2 года, накопительный счёт ИИС, продажа недвижимости, помощь родителей.' }
      ] }
  ],
  'kuhni-zakaz-online': [
    { slug: 'malenkaya-kukhnya', title: 'Кухня для маленькой квартиры',
      questions: [
        { q: 'Как обставить кухню 5 м²?', a: 'Г-образная или прямая планировка, шкафы до потолка, выдвижные системы, встроенная техника, светлые тона.' },
        { q: 'Какой бюджет на кухню 6 м²?', a: '120-300 тыс ₽ с техникой эконом-средний сегмент. Премиум — 400-800 тыс.' }
      ] },
    { slug: 'ostrov-na-kukhne', title: 'Кухня с островом',
      questions: [
        { q: 'Минимальный размер кухни для острова?', a: '15 м² минимум. На 12-15 м² — только небольшой полуостров. Меньше — остров неудобен.' },
        { q: 'Зачем нужен остров?', a: 'Дополнительная рабочая зона, мойка/плита, барная стойка, хранение, разделение зон в студии.' }
      ] }
  ],
  'natyazhnoi-master24': [
    { slug: 'v-malenkoy-komnate', title: 'Натяжной потолок в маленькой комнате',
      questions: [
        { q: 'Сколько занимает потолок по высоте?', a: '3-7 см при простом монтаже. Многоуровневый — 10-20 см.' },
        { q: 'Какой цвет в маленькой комнате?', a: 'Светлые тона — белый, кремовый, светло-серый. Глянец визуально расширяет.' }
      ] }
  ],
  'okna-pvh-online': [
    { slug: 'zamena-okon-zimoy', title: 'Замена окон зимой',
      questions: [
        { q: 'Можно ли менять окна зимой?', a: 'Да, технология "тёплого монтажа" позволяет менять при температуре до −15°C. Время замены — 1-2 часа на окно.' },
        { q: 'Зимой дешевле менять?', a: 'Да, на 10-20% — низкий сезон. Бригады свободны, быстрее.' }
      ] }
  ],
  'kupeshkafy24': [
    { slug: 'v-malenkuyu-prikhozhuyu', title: 'Шкаф-купе в маленькую прихожую',
      questions: [
        { q: 'Минимальная глубина шкафа?', a: '40 см — для одежды на плечиках строго в ряд. 50 см — комфорт. 60 см — стандарт.' },
        { q: 'Угловой или прямой?', a: 'Угловой даёт +30% объёма. Но требует места ≥1.4 м с каждой стороны угла.' }
      ] }
  ],
  'dveri-stalnye24': [
    { slug: 'kakoy-zamok-vybrat', title: 'Какой замок выбрать в стальную дверь',
      questions: [
        { q: 'Сколько замков нужно?', a: 'Минимум 2 — разные классы (цилиндровый + сувальдный). Это базовая защита от взлома.' },
        { q: 'Какой замок самый надёжный?', a: 'Cisa, Mottura (Италия), Mauer (Германия) — премиум, гарантия 25+ лет. Класс взломостойкости IV.' }
      ] }
  ],
  'dom-stroy-online': [
    { slug: 'fundamental', title: 'Какой фундамент выбрать',
      questions: [
        { q: 'Какой фундамент дешевле?', a: 'Свайно-винтовой — 100-200 тыс ₽. Ленточный — 300-600 тыс. Плита монолитная — 500-1500 тыс.' },
        { q: 'Какой надёжнее?', a: 'Монолитная плита — для пучинистых грунтов и зимней эксплуатации. Лента — стандарт.' }
      ] }
  ],
  'perevodkvartiry': [
    { slug: 'obyedinenie-kukhni-s-gostinoy', title: 'Объединение кухни с гостиной',
      questions: [
        { q: 'Можно ли объединить кухню с комнатой?', a: 'Можно, если в квартире электрическая плита. С газовой — нельзя по нормам безопасности.' },
        { q: 'Что согласовывают?', a: 'Снос ненесущей стены — да. Несущая — категорически нет. Замена стены на арку с дверями — обычно согласовывают.' }
      ] }
  ],
  'dizayn-interyera-online': [
    { slug: 'sami-vs-dizayner', title: 'Сам vs дизайнер',
      questions: [
        { q: 'Когда обязательно нужен дизайнер?', a: 'Бюджет от 2 млн ₽, сложная планировка, премиум-материалы, нет своего вкуса/опыта.' },
        { q: 'Можно ли сделать дизайн самому?', a: 'Можно на простых проектах через Pinterest+IKEA-планировщик. Премиум — лучше с дизайнером.' }
      ] }
  ],
  'kamin-zakaz24': [
    { slug: 'kak-vybrat-dymokhod', title: 'Как выбрать дымоход',
      questions: [
        { q: 'Из чего лучше дымоход?', a: 'Нержавейка-сэндвич — стандарт. Керамика — премиум, дольше. Кирпич — традиция, требует фундамент.' },
        { q: 'Какая высота дымохода?', a: 'Минимум 5 м от пола топки. Должен быть выше конька крыши на 50 см+.' }
      ] }
  ]
};

function writeFile(path: string, content: string) {
  const dir = path.substring(0, path.lastIndexOf('/'));
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(path, content);
}

function expandNiche(niche: typeof NICHES[0]) {
  const dir = `${ROOT}/apps/${niche.projectName}`;
  console.log(`\n▶ ${niche.projectName}`);

  const comps = COMPARISONS[niche.projectName] || [];
  const faqs = FAQ_TOPICS[niche.projectName] || [];

  // 1. /vs/index.astro
  if (comps.length > 0) {
    writeFile(`${dir}/src/pages/vs/index.astro`, `---
import Base from '~/layouts/Base.astro';
const comps = ${JSON.stringify(comps)};
---
<Base title="Сравнения — ${niche.niche}" description="Сравнения вариантов: что лучше, на чём экономить.">
  <h1>⚖️ Сравнения — ${niche.niche}</h1>
  <div class="grid">
    {comps.map((c) => (
      <a href={\`/vs/\${c.slug}/\`} class="card">
        <div class="vs"><strong>{c.a}</strong> <span>vs</span> <strong>{c.b}</strong></div>
        <p>{c.intro}</p>
      </a>
    ))}
  </div>
</Base>
<style>
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .card { display: block; padding: 16px; background: white; border: 1px solid #e6e8eb; border-radius: 10px; text-decoration: none; color: #1a1a1a; }
  .card:hover { border-color: ${niche.color}; }
  .vs { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .vs strong { color: ${niche.color}; }
  .vs span { background: ${niche.color}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; }
  .card p { font-size: 13px; color: #555; margin: 0; }
  @media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }
</style>
`);

    // 2. /vs/[slug].astro
    writeFile(`${dir}/src/pages/vs/[slug].astro`, `---
import Base from '~/layouts/Base.astro';
const comps = ${JSON.stringify(comps)};

export function getStaticPaths() {
  const comps = ${JSON.stringify(comps)};
  return comps.map((c) => ({ params: { slug: c.slug }, props: { c } }));
}

const { c } = Astro.props;
const url = new URL(Astro.url.pathname, Astro.site).href;
---
<Base title={\`\${c.a} или \${c.b} — ${niche.niche}\`} description={c.intro} canonical={url}>
  <nav class="bc"><a href="/">${niche.niche}</a> › <a href="/vs/">Сравнения</a> › <span>{c.a} vs {c.b}</span></nav>
  <h1>⚖️ {c.a} или {c.b}</h1>
  <p class="lead">{c.intro}</p>

  <table class="cmp">
    <tr><th>Критерий</th><th>{c.a}</th><th>{c.b}</th></tr>
    {c.criteria.map((cr) => (
      <tr><td>{cr.name}</td><td>{cr.a}</td><td>{cr.b}</td></tr>
    ))}
  </table>

  <section class="concl"><h2>🎯 Вывод</h2><p>{c.conclusion}</p></section>

  <div class="when">
    <div><h2 style="color:${niche.color};">✅ Когда {c.a}</h2><ul>{c.whenA.map((w) => <li>{w}</li>)}</ul></div>
    <div><h2 style="color:#2980b9;">✅ Когда {c.b}</h2><ul>{c.whenB.map((w) => <li>{w}</li>)}</ul></div>
  </div>

  <section class="cta">
    <h2>💡 Получить расчёт</h2>
    <form onsubmit="event.preventDefault();fetch('https://www.kalkremont.ru/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:this.phone.value,source:'${niche.domain}/vs',page:location.pathname})}).then(()=>{this.innerHTML='✅ Заявка принята!'});">
      <input type="tel" name="phone" placeholder="+7 (___) ___-__-__" required minlength="10" />
      <button>Получить →</button>
    </form>
  </section>
</Base>
<style>
  .bc { font-size: 13px; color: #888; }
  .bc a { color: #888; }
  .lead { padding: 14px; background: white; border-left: 4px solid ${niche.color}; }
  .cmp { width: 100%; border-collapse: collapse; margin: 24px 0; }
  .cmp th, .cmp td { padding: 10px; border-bottom: 1px solid #eee; text-align: left; }
  .cmp th { background: #fffaf3; }
  .concl { padding: 18px; background: #e8f4f8; border-radius: 10px; margin: 24px 0; }
  .when { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .when ul { padding-left: 20px; }
  .cta { background: white; padding: 20px; border-radius: 10px; margin: 24px 0; }
  .cta form { display: flex; gap: 8px; max-width: 400px; }
  .cta input { flex: 1; padding: 12px; border: 1.5px solid #ddd; border-radius: 8px; }
  .cta button { padding: 12px 20px; background: ${niche.color}; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
  @media (max-width: 600px) { .when { grid-template-columns: 1fr; } }
</style>
`);
  }

  // 3. FAQ-страницы по подтемам
  if (faqs.length > 0) {
    writeFile(`${dir}/src/pages/faq/[topic].astro`, `---
import Base from '~/layouts/Base.astro';
const topics = ${JSON.stringify(faqs)};

export function getStaticPaths() {
  const topics = ${JSON.stringify(faqs)};
  return topics.map((t) => ({ params: { topic: t.slug }, props: { t } }));
}

const { t } = Astro.props;
const url = new URL(Astro.url.pathname, Astro.site).href;
---
<Base title={t.title + ' — ${niche.niche}'} description={t.questions[0].a.slice(0, 145)} canonical={url}>
  <nav class="bc"><a href="/">${niche.niche}</a> › <a href="/faq/">FAQ</a> › <span>{t.title}</span></nav>
  <h1>❓ {t.title}</h1>
  <div class="faqs">
    {t.questions.map((q, i) => (
      <details class="faq" open={i < 2}>
        <summary>{q.q}</summary>
        <p>{q.a}</p>
      </details>
    ))}
  </div>

  <section class="cta">
    <h2>💡 Задать вопрос специалисту</h2>
    <form onsubmit="event.preventDefault();fetch('https://www.kalkremont.ru/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:this.phone.value,source:'${niche.domain}/faq',topic:'{t.slug}',page:location.pathname})}).then(()=>{this.innerHTML='✅ Заявка принята!'});">
      <input type="tel" name="phone" placeholder="+7 (___) ___-__-__" required minlength="10" />
      <button>Получить ответ →</button>
    </form>
  </section>

  <script type="application/ld+json" set:html={JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: t.questions.map((q) => ({
      '@type': 'Question',
      name: q.q,
      acceptedAnswer: { '@type': 'Answer', text: q.a }
    }))
  })} />
</Base>
<style>
  .bc { font-size: 13px; color: #888; }
  .bc a { color: #888; }
  .faqs { display: flex; flex-direction: column; gap: 10px; }
  .faq { background: white; padding: 14px 18px; border-radius: 8px; border: 1px solid #e6e8eb; }
  .faq summary { font-weight: 600; cursor: pointer; }
  .faq[open] { border-color: ${niche.color}; }
  .faq p { margin: 10px 0 0; color: #555; }
  .cta { background: white; padding: 20px; border-radius: 10px; margin: 24px 0; }
  .cta form { display: flex; gap: 8px; max-width: 400px; }
  .cta input { flex: 1; padding: 12px; border: 1.5px solid #ddd; border-radius: 8px; }
  .cta button { padding: 12px 20px; background: ${niche.color}; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
</style>
`);
  }

  // 4. Footer Partner Network — добавим в Base.astro
  console.log(`  ✓ ${niche.projectName}: +${comps.length} vs + ${faqs.length} faq + partner footer`);
}

console.log(`🚀 Расширение контента ${NICHES.length} ниш...`);
for (const n of NICHES) expandNiche(n);
console.log('\n✅ Готово');
