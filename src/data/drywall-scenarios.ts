export type DrywallLock = 'surface' | 'sheetLength' | 'sheetWidth' | 'layers';

export interface DrywallScenario {
  slug: string;
  category: 'area' | 'surface' | 'sheet-size' | 'feature';
  h1: string;
  title: string;
  description: string;
  prefill: {
    length?: number;
    width?: number;
    height?: number;
    surface?: 'walls' | 'ceiling' | 'walls-ceiling';
    sheetLength?: number;
    sheetWidth?: number;
    layers?: number;
    doors?: number;
    windows?: number;
  };
  lock?: DrywallLock[];
  introBlocks: string[];
}

function dimsForArea(area: number) {
  const ratio = Math.sqrt(area / 1.5);
  const width = Math.round(ratio * 10) / 10;
  const length = Math.round((area / width) * 10) / 10;
  return { length, width };
}

const AREAS = [10, 12, 15, 18, 20, 25, 30, 40, 50];
const areaScenarios: DrywallScenario[] = AREAS.map((area) => {
  const { length, width } = dimsForArea(area);
  return {
    slug: `na-komnatu-${area}-kv-m`,
    category: 'area',
    h1: `Расчёт гипсокартона на комнату ${area} м²`,
    title: `Сколько гипсокартона нужно на ${area} кв.м — калькулятор`,
    description: `Расчёт листов ГКЛ для комнаты ${area} м². С учётом профиля, подвесов, саморезов.`,
    prefill: { length, width, height: 2.7, doors: 1, windows: 1 },
    introBlocks: [
      `Для комнаты ${area} м² с типовыми размерами ${length} × ${width} м калькулятор берёт стандартный лист ГКЛ 2500 × 1200 мм (3 м²) в один слой. По умолчанию обшиваются стены.`,
      `К общему количеству листов автоматически добавляется запас 10% — на подрезку, обрамление дверных и оконных проёмов.`,
      `Помимо листов калькулятор показывает метраж профилей UD (направляющий) и CD (стоечный), количество прямых подвесов и саморезов.`
    ]
  };
});

const surfaceScenarios: DrywallScenario[] = [
  {
    slug: 'na-potolok',
    category: 'surface',
    h1: 'Расчёт гипсокартона на потолок',
    title: 'Калькулятор гипсокартона на потолок — листы и профиль',
    description: 'Расчёт ГКЛ для подвесного потолка из гипсокартона. Все материалы.',
    prefill: { surface: 'ceiling', length: 5, width: 4, doors: 0, windows: 0 },
    lock: ['surface'],
    introBlocks: [
      'Подвесной потолок из ГКЛ — простой способ скрыть проводку, неровности и трубы. Расход: 1 лист 2,5×1,2 м (3 м²) покрывает ~2,7 м² с учётом 10% подрезки.',
      'Для потолков обычно используют влагостойкий или огнестойкий ГКЛ (ГКЛВ или ГКЛО) толщиной 9,5 мм — он легче и тоньше стандартного 12,5 мм.',
      'Калькулятор настроен на потолок без проёмов. Если в потолке есть люки/светильники — расход не меняется (вырезы под них).'
    ]
  },
  {
    slug: 'na-steny',
    category: 'surface',
    h1: 'Расчёт гипсокартона на стены',
    title: 'Калькулятор гипсокартона на стены — листы и комплектующие',
    description: 'Расчёт ГКЛ для обшивки стен по каркасу. С учётом проёмов.',
    prefill: { surface: 'walls', length: 5, width: 4, height: 2.7, doors: 1, windows: 1 },
    lock: ['surface'],
    introBlocks: [
      'Обшивка стен гипсокартоном по каркасу — стандартный способ выровнять кривые стены или сделать перегородки. Лист 2,5×1,2 м идёт вертикально, без подрезки по высоте при потолке 2,5 м.',
      'Если высота больше 2,5 м — берите лист длиной 3 м, либо стыкуйте две части (внизу обрезок).',
      'Для стандартных стен подходит ГКЛ 12,5 мм. Для влажных зон — ГКЛВ. Для огнестойких перегородок — ГКЛО или специальные противопожарные.'
    ]
  },
  {
    slug: 'steny-i-potolok',
    category: 'surface',
    h1: 'Расчёт гипсокартона на стены и потолок',
    title: 'Калькулятор ГКЛ на стены и потолок одной заявкой',
    description: 'Расчёт гипсокартона для полной обшивки комнаты: стены + потолок.',
    prefill: { surface: 'walls-ceiling', length: 5, width: 4, height: 2.7, doors: 1, windows: 1 },
    lock: ['surface'],
    introBlocks: [
      'Полная обшивка комнаты ГКЛ — стены + потолок. Калькулятор считает обе поверхности, суммирует листы, профиль, подвесы и саморезы.',
      'На большую площадь выгоднее заказать всё одной партией — экономия на доставке и часто скидка от объёма.',
      'Для стен и потолка можно использовать один тип ГКЛ — стандартный 12,5 мм подходит везде кроме влажных и пожароопасных зон.'
    ]
  }
];

const sheetSizeScenarios: DrywallScenario[] = [
  {
    slug: 'list-2500x1200',
    category: 'sheet-size',
    h1: 'Расчёт гипсокартона листами 2500 × 1200 мм',
    title: 'Калькулятор ГКЛ листами 2500×1200 мм — стандартный размер',
    description: 'Расчёт стандартного гипсокартона 2,5 × 1,2 м (3 м²/лист).',
    prefill: { sheetLength: 2500, sheetWidth: 1200, length: 5, width: 4 },
    lock: ['sheetLength', 'sheetWidth'],
    introBlocks: [
      'Размер 2,5 × 1,2 м — стандарт для России. Площадь листа 3 м². Подходит для потолков высотой 2,5 м (один лист без подрезки).',
      'Калькулятор зафиксирован на этот размер. На каждые 100 м² обшивки в один слой нужно ~37 листов с учётом 10% запаса.',
      'В магазинах этот размер всегда в наличии у KNAUF, Volma, Gyproc и других производителей. Цена сильно зависит от поставщика — рекомендуем сравнить минимум 2-3 магазина.'
    ]
  },
  {
    slug: 'list-3000x1200',
    category: 'sheet-size',
    h1: 'Расчёт гипсокартона листами 3000 × 1200 мм',
    title: 'Калькулятор ГКЛ листами 3000×1200 мм — для высоких потолков',
    description: 'Расчёт ГКЛ листами 3 × 1,2 м (3,6 м²/лист). Подходит для потолков от 2,5 м.',
    prefill: { sheetLength: 3000, sheetWidth: 1200, length: 5, width: 4 },
    lock: ['sheetLength', 'sheetWidth'],
    introBlocks: [
      'Размер 3 × 1,2 м — увеличенный, для потолков 2,5-3 м. Площадь 3,6 м². При высоте потолка 2,7 м даёт минимум отходов на стенах.',
      'Калькулятор использует площадь листа 3,6 м². Это уменьшает количество стыков и ускоряет монтаж.',
      'Минус: лист тяжелее и неудобнее в одиночной работе. Лучше двумя людьми.'
    ]
  }
];

const featureScenarios: DrywallScenario[] = [
  {
    slug: 'v-2-sloya',
    category: 'feature',
    h1: 'Расчёт гипсокартона в 2 слоя',
    title: 'Калькулятор ГКЛ в 2 слоя — для огнестойкости и шумоизоляции',
    description: 'Расчёт ГКЛ при обшивке в 2 слоя. Используется в офисах, школах, противопожарных перегородках.',
    prefill: { layers: 2, length: 5, width: 4, height: 2.7, doors: 1, windows: 1 },
    lock: ['layers'],
    introBlocks: [
      'Двухслойная обшивка ГКЛ увеличивает огнестойкость до EI 30-60 минут и улучшает шумоизоляцию. Применяется в офисных перегородках, школах, на путях эвакуации.',
      'Расход листов удваивается, но листы второго слоя крепятся в шахматном порядке — стыки не совпадают, что увеличивает прочность.',
      'Калькулятор зафиксирован на 2 слоя. Профиль и подвесы остаются как при одном слое — общая площадь стены та же.'
    ]
  }
];

export const drywallScenarios: DrywallScenario[] = [
  ...areaScenarios,
  ...surfaceScenarios,
  ...sheetSizeScenarios,
  ...featureScenarios
];

export const drywallByCategory = {
  area: areaScenarios,
  surface: surfaceScenarios,
  'sheet-size': sheetSizeScenarios,
  feature: featureScenarios
};
