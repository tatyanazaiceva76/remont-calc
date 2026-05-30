# Search Engine Coverage Summary

_Сгенерировано 2026-05-30T14:17:49 из network-inventory + логов отправки._

## Сеть
- Хостов: **222** (GOOD **106**, BAD-призраки **116**)
- Indexable URL на GOOD-хостах (∑): **21498**
- В поиске Яндекса (∑): **641** → покрытие **3.0%**
- Исключено Яндексом (∑): **2**
- Живых хостов (>0 в поиске): **20/106**

## Готовность к деньгам
- GOOD-хостов **без lead-форм**: **59/106** — основная утечка конверсии
- GOOD-хостов **без монетизации**: **106/106**

## Отправка в поисковики (накоплено)
- **yandex**: accepted 97, rejected 0
- **bing**: accepted 86, rejected 11
- Последний recrawl: —

## ТОП-15 хостов по priority_score
| priority | host | indexable | in_search | forms | monet | next |
|---:|---|---:|---:|:--:|:--:|---|
| 943 | www.kalkremont.ru | 9040 | 109 | yes | no | push index / expand |
| 248 | dizayn.kalkremont.ru | 615 | 0 | no | no | add CTA/form |
| 222 | balkony.kalkremont.ru | 492 | 0 | no | no | add CTA/form |
| 222 | fasad.kalkremont.ru | 492 | 0 | no | no | add CTA/form |
| 222 | kondicioner.kalkremont.ru | 492 | 0 | no | no | add CTA/form |
| 222 | okna.kalkremont.ru | 492 | 0 | no | no | add CTA/form |
| 222 | potolki.kalkremont.ru | 492 | 0 | no | no | add CTA/form |
| 222 | santehnika.kalkremont.ru | 492 | 0 | no | no | add CTA/form |
| 213 | demontazh.kalkremont.ru | 451 | 0 | no | no | add CTA/form |
| 213 | dveri.kalkremont.ru | 451 | 0 | no | no | add CTA/form |
| 213 | elektro.kalkremont.ru | 451 | 0 | no | no | add CTA/form |
| 213 | kuhni.kalkremont.ru | 451 | 0 | no | no | add CTA/form |
| 213 | styazhka.kalkremont.ru | 451 | 0 | no | no | add CTA/form |
| 213 | uborka.kalkremont.ru | 451 | 0 | no | no | add CTA/form |
| 213 | vannye.kalkremont.ru | 451 | 0 | no | no | add CTA/form |

## Главные рычаги
1. **Индексация флагмана**: www.kalkremont.ru — основной объём indexable, покрытие низкое → IndexNow+recrawl+внутренние ссылки.
2. **Конверсия сабдоменов**: 59 GOOD-хостов без форм — добавить единый lead-CTA (ШАГ 7).
3. **Монетизация**: 106 хостов без слотов — включить через config/feature-flags (ШАГ 8).
