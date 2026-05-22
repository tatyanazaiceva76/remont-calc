// Все настройки сайта в одном месте.
// Подменить значения перед деплоем.

export const SITE_CONFIG = {
  domain: 'www.kalkremont.ru',
  siteName: 'Калькулятор ремонта',
  siteDescription: 'Бесплатные онлайн-калькуляторы для ремонта: расчёт обоев, ламината, краски, плитки и других материалов.',

  // Получить ID после регистрации сайта в Яндекс.Метрике
  // https://metrika.yandex.ru/
  metrikaId: '109345156' as string,

  // Получить блоки в кабинете РСЯ после прохождения модерации
  // https://partner2.yandex.ru/
  rsya: {
    enabled: false,
    blockIdTop: '',
    blockIdMiddle: '',
    blockIdBottom: ''
  }
} as const;

/** Текущий год для freshness signals в titles */
export const CURRENT_YEAR = new Date().getFullYear();
