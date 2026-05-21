export interface LinoleumScenario {
  slug: string;
  category: 'area' | 'room-type' | 'roll-width';
  h1: string;
  title: string;
  description: string;
  prefill: { length?: number; width?: number; rollWidth?: number };
  lock?: Array<'rollWidth'>;
  introBlocks: string[];
}

function dimsForArea(area: number) {
  const ratio = Math.sqrt(area / 1.5);
  const width = Math.round(ratio * 10) / 10;
  const length = Math.round((area / width) * 10) / 10;
  return { length, width };
}

const AREAS = [6, 8, 10, 12, 15, 18, 20, 25, 30, 40];
const areaScenarios: LinoleumScenario[] = AREAS.map((area) => {
  const { length, width } = dimsForArea(area);
  return {
    slug: `na-komnatu-${area}-kv-m`,
    category: 'area',
    h1: `Расчёт линолеума на комнату ${area} м²`,
    title: `Сколько линолеума нужно на ${area} кв.м — калькулятор`,
    description: `Точный расчёт линолеума для комнаты ${area} м² с подбором оптимальной ширины рулона.`,
    prefill: { length, width },
    introBlocks: [
      `Для комнаты ${area} м² с типовыми размерами ${length} × ${width} м калькулятор подбирает рулон, который ляжет одним куском без швов. По умолчанию — рулон 3 м.`,
      `Главное правило: ширина рулона должна перекрывать короткую сторону комнаты. Если короткая сторона 3,8 м — берите рулон 4 м, не 3,5 м.`,
      `К длине куска добавляются 10 см на подрезку и подгонку. Если на полу выступы (печь, трубы) — добавьте ещё 15-20 см.`
    ]
  };
});

const ROOMS = [
  { slug: 'kuhnyu', name: 'кухня', acc: 'кухню', dims: { length: 3.5, width: 3, rollWidth: 3 }, hint: 'На кухне выбирают полукоммерческий линолеум — толстая защита от стульев и капель воды.' },
  { slug: 'koridor', name: 'коридор', acc: 'коридор', dims: { length: 4.5, width: 1.4, rollWidth: 1.5 }, hint: 'Коридор узкий, рулон 1,5 м хватает с запасом. Берите коммерческий — там самая высокая нагрузка от обуви.' },
  { slug: 'spalnyu', name: 'спальня', acc: 'спальню', dims: { length: 4.5, width: 3.5, rollWidth: 4 }, hint: 'В спальне подходит бытовой линолеум 21-22 класса — нагрузка минимальная, бюджет меньше.' },
  { slug: 'detskuyu', name: 'детская', acc: 'детскую', dims: { length: 4, width: 3.5, rollWidth: 4 }, hint: 'В детской — обязательно класс эмиссии E1 (низкое выделение формальдегидов) и противоскользящий слой.' },
  { slug: 'gostinuyu', name: 'гостиная', acc: 'гостиную', dims: { length: 5.5, width: 4.5, rollWidth: 5 }, hint: 'Гостиная — самая нагруженная и просторная. Берите рулон от 4 м, чтобы без швов.' },
  { slug: 'prihozhuyu', name: 'прихожая', acc: 'прихожую', dims: { length: 2.5, width: 1.8, rollWidth: 2 }, hint: 'Прихожая — обязательно коммерческий или полукоммерческий линолеум, иначе быстро вытопчется.' }
];

const roomScenarios: LinoleumScenario[] = ROOMS.map((r) => ({
  slug: `na-${r.slug}`,
  category: 'room-type',
  h1: `Расчёт линолеума на ${r.acc}`,
  title: `Сколько линолеума на ${r.acc} — калькулятор`,
  description: `Расчёт линолеума для типовой ${r.name === 'коридор' ? r.name : r.name + 'ы'} с подбором ширины рулона без швов.`,
  prefill: r.dims,
  introBlocks: [
    `Калькулятор настроен на типовую ${r.name} ${r.dims.length} × ${r.dims.width} м с рулоном ${r.dims.rollWidth} м. Если ваши размеры другие — обновите поля.`,
    r.hint,
    `Если рулон не накрывает короткую сторону — калькулятор покажет сколько полос и общую площадь с учётом швов. Лучше доплатить за более широкий рулон, чем потом маскировать стыки.`
  ]
}));

const ROLL_WIDTHS: Array<{ w: number; explainer: string }> = [
  { w: 1.5, explainer: 'Самый узкий стандарт — для коридоров и санузлов. Часто доступнее по цене.' },
  { w: 2, explainer: 'Подходит для прихожих и небольших комнат. Меньше отходов чем у 1,5 м.' },
  { w: 2.5, explainer: 'Хороший вариант для типовой кухни или маленькой спальни.' },
  { w: 3, explainer: 'Самый универсальный размер — покрывает большинство комнат до 12 м².' },
  { w: 3.5, explainer: 'Для комнат до 12 м² с длиной ~3,5 м — стелится одним куском.' },
  { w: 4, explainer: 'Подходит для крупных комнат 16-25 м². Реже встречается в магазинах.' }
];

const rollWidthScenarios: LinoleumScenario[] = ROLL_WIDTHS.map((rw) => ({
  slug: `shirina-${rw.w.toString().replace('.', '-')}-m`,
  category: 'roll-width',
  h1: `Расчёт линолеума шириной ${rw.w.toString().replace('.', ',')} м`,
  title: `Калькулятор линолеума ${rw.w.toString().replace('.', ',')} м — расход по комнате`,
  description: `Расчёт линолеума с рулоном шириной ${rw.w} м. Подбираем оптимальный раскрой для комнаты.`,
  prefill: { rollWidth: rw.w, length: 5, width: 4 },
  lock: ['rollWidth'],
  introBlocks: [
    `Рулон шириной ${rw.w.toString().replace('.', ',')} м. ${rw.explainer}`,
    `Калькулятор зафиксирован на этой ширине. Введите длину и ширину вашей комнаты — увидите ляжет ли одним куском или будут швы.`,
    `Если ширина рулона не перекрывает короткую сторону — рассмотрите более широкий рулон. Линолеум со швами хуже выглядит и быстрее изнашивается на стыках.`
  ]
}));

export const linoleumScenarios: LinoleumScenario[] = [
  ...areaScenarios,
  ...roomScenarios,
  ...rollWidthScenarios
];

export const linoleumByCategory = {
  area: areaScenarios,
  'room-type': roomScenarios,
  'roll-width': rollWidthScenarios
};
