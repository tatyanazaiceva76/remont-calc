# ЭТАП 6 — генератор money-страниц (DRY-RUN)

> Сгенерировано: 2026-05-30T19:37:08 · режим: **dry-run** (ничего не опубликовано, apply заблокирован).

## Что проанализировано
- Источники данных: `src/data/niche-services.ts` (19 ниш с pricePerSqM/subTypes/faqs) + `src/data/niche-cities.ts` (40 городов с priceMult).
- Существующая сеть: `/{service}/v-{city}/` (service×city) — **насыщён**, не дублируем.
- Скоринг: `service_value × city_demand × pattern_prior × link_prior × proj_quality × 100` (приоры из `seo-score.ts`; live-сигналов нет — страниц ещё не существует).

## Пробелы (gap-анализ)
| page_type | scope | total | existing | missing | coverage |
|---|---|--:|--:|--:|--:|
| service-city (есть) | `/{service}/v-{city}/` | 720 | 720 | 0 | 100% |
| price | `/remont-vannoy/cena/v-{city}/` | 40 | 0 | 40 | 0% |
| turnkey | `/remont-vannoy/pod-klyuch/v-{city}/` | 40 | 0 | 40 | 0% |
| price | `/remont-kuhni/cena/v-{city}/` | 40 | 0 | 40 | 0% |
| turnkey | `/remont-kuhni/pod-klyuch/v-{city}/` | 40 | 0 | 40 | 0% |
| price | `/natyazhnye-potolki/cena/v-{city}/` | 40 | 0 | 40 | 0% |
| price | `/ustanovka-dverey/cena/v-{city}/` | 40 | 0 | 40 | 0% |
| price | `/elektromontazh/cena/v-{city}/` | 40 | 0 | 40 | 0% |
| turnkey | `/elektromontazh/pod-klyuch/v-{city}/` | 40 | 0 | 40 | 0% |
| price | `/santehnicheskie-raboty/cena/v-{city}/` | 40 | 0 | 40 | 0% |
| turnkey | `/santehnicheskie-raboty/pod-klyuch/v-{city}/` | 40 | 0 | 40 | 0% |
| price | `/dizayn-interyera/cena/v-{city}/` | 40 | 0 | 40 | 0% |
| price | `/balkony-i-lodzhii/cena/v-{city}/` | 40 | 0 | 40 | 0% |
| turnkey | `/balkony-i-lodzhii/pod-klyuch/v-{city}/` | 40 | 0 | 40 | 0% |
| price | `/styazhka-pola/cena/v-{city}/` | 40 | 0 | 40 | 0% |
| price | `/poklejka-oboev/cena/v-{city}/` | 40 | 0 | 40 | 0% |
| turnkey | `/poklejka-oboev/pod-klyuch/v-{city}/` | 40 | 0 | 40 | 0% |
| price | `/uborka-posle-remonta/cena/v-{city}/` | 40 | 0 | 40 | 0% |
| turnkey | `/uborka-posle-remonta/pod-klyuch/v-{city}/` | 40 | 0 | 40 | 0% |
| price | `/snos-i-demontazh/cena/v-{city}/` | 40 | 0 | 40 | 0% |
| turnkey | `/snos-i-demontazh/pod-klyuch/v-{city}/` | 40 | 0 | 40 | 0% |
| price | `/zvukoizolyatsiya/cena/v-{city}/` | 40 | 0 | 40 | 0% |
| turnkey | `/zvukoizolyatsiya/pod-klyuch/v-{city}/` | 40 | 0 | 40 | 0% |
| price | `/uteplenie-balkona/cena/v-{city}/` | 40 | 0 | 40 | 0% |
| turnkey | `/uteplenie-balkona/pod-klyuch/v-{city}/` | 40 | 0 | 40 | 0% |
| price | `/zamena-okon/cena/v-{city}/` | 40 | 0 | 40 | 0% |
| turnkey | `/zamena-okon/pod-klyuch/v-{city}/` | 40 | 0 | 40 | 0% |
| price | `/demontazh-rabot/cena/v-{city}/` | 40 | 0 | 40 | 0% |
| turnkey | `/demontazh-rabot/pod-klyuch/v-{city}/` | 40 | 0 | 40 | 0% |
| price | `/montazh-konditsionerov/cena/v-{city}/` | 40 | 0 | 40 | 0% |
| turnkey | `/montazh-konditsionerov/pod-klyuch/v-{city}/` | 40 | 0 | 40 | 0% |
| price | `/uteplenie-fasada/cena/v-{city}/` | 40 | 0 | 40 | 0% |
| turnkey | `/uteplenie-fasada/pod-klyuch/v-{city}/` | 40 | 0 | 40 | 0% |

**Итого новых кандидатов: 1280** (пробелов по строкам gap-таблицы: 1280).
Полная разбивка по нишам — в `reports/money-page-gaps.csv`.

## Типы предложенных страниц
- **price** — 720 стр. `/{service}/cena/v-{city}/` · prior=0.95 · proj_quality=0.85
- **turnkey** — 560 стр. `/{service}/pod-klyuch/v-{city}/` · prior=0.9 · proj_quality=0.85

## Preflight-гейт (защита от тонких/дублей перед apply)
Проходит **1280/1280** кандидатов.
`--apply` НЕВОЗМОЖЕН, если у страницы нарушено хоть одно из 10 условий:
1. canonical = сам URL (self-canonical);
2. есть CTA-блок;
3. есть FAQ-блок;
4. есть блок цены/сметы (и валидная матрица цен);
5. ≥1 внутренняя ссылка-источник (не сирота);
6. страница попадёт в sitemap;
7. проходит IndexNow host-ownership (URL на нашем хосте);
8. хост не в `reports/bad-hosts.csv`;
9. title и h1 не дублируются (ни в наборе, ни с существующими v-city/subtype);
10. HTML не тонкий (≥6 уникальных блоков).

На текущем наборе кандидатов провалов нет — все спроектированы под прохождение гейта.

## ⚠️ Data-quality находки (НЕ исправлено — нужно отдельное решение)
Найдены ниши-дубли с одинаковым `name` в `src/data/niche-services.ts` — это дубль-контент уже на ЖИВОМ сайте (две разные URL-ветки с идентичными title/h1/intro → каннибализация). Для них money-страницы **не генерируются**.

| alias-slug | клон чего | name |
|---|---|---|
| `uborka-posle-stroyki` | `uborka-posle-remonta` | Уборка после ремонта |

**Рекомендация (требует «го», т.к. меняет существующий контент):** либо уникализировать дубль (свой name/intro/works под отдельный кластер запросов, напр. «уборка после стройки»), либо поставить canonical/301 alias → canonical.

## Топ-50 новых money-страниц
| # | score | type | url | цена ₽/м² |
|--:|--:|---|---|---|
| 1 | 43.6 | price | https://www.kalkremont.ru/dizayn-interyera/cena/v-moskve/ | 2 100–8 400 |
| 2 | 41.18 | price | https://www.kalkremont.ru/remont-vannoy/cena/v-moskve/ | 35 000–84 000 |
| 3 | 39.73 | price | https://www.kalkremont.ru/remont-kuhni/cena/v-moskve/ | 25 200–63 000 |
| 4 | 39.01 | turnkey | https://www.kalkremont.ru/remont-vannoy/pod-klyuch/v-moskve/ | 35 000–84 000 |
| 5 | 37.64 | turnkey | https://www.kalkremont.ru/remont-kuhni/pod-klyuch/v-moskve/ | 25 200–63 000 |
| 6 | 37.06 | price | https://www.kalkremont.ru/dizayn-interyera/cena/v-sankt-peterburge/ | 2 000–7 800 |
| 7 | 35.01 | price | https://www.kalkremont.ru/remont-vannoy/cena/v-sankt-peterburge/ | 32 500–78 000 |
| 8 | 33.91 | price | https://www.kalkremont.ru/natyazhnye-potolki/cena/v-moskve/ | 800–4 900 |
| 9 | 33.77 | price | https://www.kalkremont.ru/remont-kuhni/cena/v-sankt-peterburge/ | 23 400–58 500 |
| 10 | 33.16 | turnkey | https://www.kalkremont.ru/remont-vannoy/pod-klyuch/v-sankt-peterburge/ | 32 500–78 000 |
| 11 | 31.99 | turnkey | https://www.kalkremont.ru/remont-kuhni/pod-klyuch/v-sankt-peterburge/ | 23 400–58 500 |
| 12 | 31.49 | price | https://www.kalkremont.ru/zamena-okon/cena/v-moskve/ | 8 400–35 000 |
| 13 | 29.84 | turnkey | https://www.kalkremont.ru/zamena-okon/pod-klyuch/v-moskve/ | 8 400–35 000 |
| 14 | 29.07 | price | https://www.kalkremont.ru/ustanovka-dverey/cena/v-moskve/ | 6 300–25 200 |
| 15 | 29.07 | price | https://www.kalkremont.ru/elektromontazh/cena/v-moskve/ | 2 100–8 400 |
| 16 | 29.07 | price | https://www.kalkremont.ru/santehnicheskie-raboty/cena/v-moskve/ | 11 200–35 000 |
| 17 | 28.83 | price | https://www.kalkremont.ru/natyazhnye-potolki/cena/v-sankt-peterburge/ | 800–4 600 |
| 18 | 28.1 | price | https://www.kalkremont.ru/balkony-i-lodzhii/cena/v-moskve/ | 16 800–49 000 |
| 19 | 27.54 | turnkey | https://www.kalkremont.ru/elektromontazh/pod-klyuch/v-moskve/ | 2 100–8 400 |
| 20 | 27.54 | turnkey | https://www.kalkremont.ru/santehnicheskie-raboty/pod-klyuch/v-moskve/ | 11 200–35 000 |
| 21 | 27.04 | price | https://www.kalkremont.ru/dizayn-interyera/cena/v-ekaterinburge/ | 1 500–6 000 |
| 22 | 26.77 | price | https://www.kalkremont.ru/zamena-okon/cena/v-sankt-peterburge/ | 7 800–32 500 |
| 23 | 26.65 | price | https://www.kalkremont.ru/styazhka-pola/cena/v-moskve/ | 1 100–4 900 |
| 24 | 26.65 | price | https://www.kalkremont.ru/montazh-konditsionerov/cena/v-moskve/ | 7 700–25 200 |
| 25 | 26.65 | price | https://www.kalkremont.ru/uteplenie-fasada/cena/v-moskve/ | 2 100–6 300 |
| 26 | 26.62 | turnkey | https://www.kalkremont.ru/balkony-i-lodzhii/pod-klyuch/v-moskve/ | 16 800–49 000 |
| 27 | 26.16 | price | https://www.kalkremont.ru/dizayn-interyera/cena/v-novosibirske/ | 1 400–5 700 |
| 28 | 25.53 | price | https://www.kalkremont.ru/remont-vannoy/cena/v-ekaterinburge/ | 25 000–60 000 |
| 29 | 25.36 | turnkey | https://www.kalkremont.ru/zamena-okon/pod-klyuch/v-sankt-peterburge/ | 7 800–32 500 |
| 30 | 25.29 | price | https://www.kalkremont.ru/dizayn-interyera/cena/v-kazani/ | 1 500–6 000 |
| 31 | 25.25 | turnkey | https://www.kalkremont.ru/montazh-konditsionerov/pod-klyuch/v-moskve/ | 7 700–25 200 |
| 32 | 25.25 | turnkey | https://www.kalkremont.ru/uteplenie-fasada/pod-klyuch/v-moskve/ | 2 100–6 300 |
| 33 | 24.85 | price | https://www.kalkremont.ru/dizayn-interyera/cena/v-krasnodare/ | 1 600–6 300 |
| 34 | 24.71 | price | https://www.kalkremont.ru/remont-vannoy/cena/v-novosibirske/ | 23 800–57 000 |
| 35 | 24.71 | price | https://www.kalkremont.ru/ustanovka-dverey/cena/v-sankt-peterburge/ | 5 900–23 400 |
| 36 | 24.71 | price | https://www.kalkremont.ru/elektromontazh/cena/v-sankt-peterburge/ | 2 000–7 800 |
| 37 | 24.71 | price | https://www.kalkremont.ru/santehnicheskie-raboty/cena/v-sankt-peterburge/ | 10 400–32 500 |
| 38 | 24.63 | price | https://www.kalkremont.ru/remont-kuhni/cena/v-ekaterinburge/ | 18 000–45 000 |
| 39 | 24.22 | price | https://www.kalkremont.ru/zvukoizolyatsiya/cena/v-moskve/ | 3 500–11 200 |
| 40 | 24.22 | price | https://www.kalkremont.ru/uteplenie-balkona/cena/v-moskve/ | 7 000–21 000 |
| 41 | 24.19 | turnkey | https://www.kalkremont.ru/remont-vannoy/pod-klyuch/v-ekaterinburge/ | 25 000–60 000 |
| 42 | 23.89 | price | https://www.kalkremont.ru/remont-vannoy/cena/v-kazani/ | 25 000–60 000 |
| 43 | 23.89 | price | https://www.kalkremont.ru/balkony-i-lodzhii/cena/v-sankt-peterburge/ | 15 600–45 500 |
| 44 | 23.84 | price | https://www.kalkremont.ru/remont-kuhni/cena/v-novosibirske/ | 17 100–42 800 |
| 45 | 23.47 | price | https://www.kalkremont.ru/remont-vannoy/cena/v-krasnodare/ | 26 300–63 000 |
| 46 | 23.41 | turnkey | https://www.kalkremont.ru/remont-vannoy/pod-klyuch/v-novosibirske/ | 23 800–57 000 |
| 47 | 23.41 | turnkey | https://www.kalkremont.ru/elektromontazh/pod-klyuch/v-sankt-peterburge/ | 2 000–7 800 |
| 48 | 23.41 | turnkey | https://www.kalkremont.ru/santehnicheskie-raboty/pod-klyuch/v-sankt-peterburge/ | 10 400–32 500 |
| 49 | 23.34 | turnkey | https://www.kalkremont.ru/remont-kuhni/pod-klyuch/v-ekaterinburge/ | 18 000–45 000 |
| 50 | 23.04 | price | https://www.kalkremont.ru/remont-kuhni/cena/v-kazani/ | 18 000–45 000 |

Полный список — `reports/top-50-new-money-pages.csv` и `reports/proposed-new-money-pages.csv`.

## Команды
```bash
npm run seo:generate-money-pages -- --limit 100 --dry-run   # этот отчёт
npm run seo:generate-money-pages -- --limit 100 --apply     # ⛔ заблокировано (нужно «го» + preflight)
```

## Готовность
- ✅ Готово к ревью: gap-анализ, 4 артефакта, preflight-гейт.
- ⛔ НЕ сделано (и не будет без отдельного «го»): рендер `.astro`-роутов, билд, деплой, IndexNow/переобход новых URL.
- Для apply потребуется: route-файлы `/{service}/cena/v-[city].astro` и `/{service}/pod-klyuch/v-[city].astro`, включение в sitemap, повторный preflight (0 провалов), затем точечный IndexNow/переобход.