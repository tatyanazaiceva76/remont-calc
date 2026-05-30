# Search Engine Coverage Summary

_Сгенерировано 2026-05-30T14:42:46 из network-inventory + логов отправки._

## Сеть
- Хостов: **222** (GOOD **106**, BAD-призраки **116**)
- Indexable URL на GOOD-хостах (∑): **21498**
- В поиске Яндекса (∑): **641** → покрытие **3.0%**
- Исключено Яндексом (∑): **2**
- Живых хостов (>0 в поиске): **20/106**

## Готовность к деньгам
- GOOD-хостов **без lead-форм**: **45/106** — основная утечка конверсии
- GOOD-хостов **без монетизации**: **106/106**

## Отправка в поисковики (накоплено)
- **yandex**: accepted 97, rejected 0
- **bing**: accepted 86, rejected 11
- Последний recrawl: **1128** URL поставлено, квота исчерпана у **57** хостов

## ТОП-15 хостов по priority_score
| priority | host | indexable | in_search | forms | monet | next |
|---:|---|---:|---:|:--:|:--:|---|
| 943 | www.kalkremont.ru | 9040 | 109 | yes | no | push index / expand |
| 248 | dizayn.kalkremont.ru | 615 | 0 | yes | no | push index / expand |
| 222 | balkony.kalkremont.ru | 492 | 0 | yes | no | push index / expand |
| 222 | fasad.kalkremont.ru | 492 | 0 | yes | no | push index / expand |
| 222 | kondicioner.kalkremont.ru | 492 | 0 | yes | no | push index / expand |
| 222 | okna.kalkremont.ru | 492 | 0 | yes | no | push index / expand |
| 222 | potolki.kalkremont.ru | 492 | 0 | yes | no | push index / expand |
| 222 | santehnika.kalkremont.ru | 492 | 0 | yes | no | push index / expand |
| 213 | demontazh.kalkremont.ru | 451 | 0 | yes | no | push index / expand |
| 213 | dveri.kalkremont.ru | 451 | 0 | yes | no | push index / expand |
| 213 | elektro.kalkremont.ru | 451 | 0 | yes | no | push index / expand |
| 213 | kuhni.kalkremont.ru | 451 | 0 | yes | no | push index / expand |
| 213 | styazhka.kalkremont.ru | 451 | 0 | yes | no | push index / expand |
| 213 | uborka.kalkremont.ru | 451 | 0 | yes | no | push index / expand |
| 213 | vannye.kalkremont.ru | 451 | 0 | yes | no | push index / expand |

## Главные рычаги
1. **Индексация флагмана**: www.kalkremont.ru — основной объём indexable, покрытие низкое → IndexNow+recrawl+внутренние ссылки.
2. **Конверсия сабдоменов**: 45 GOOD-хостов без форм — добавить единый lead-CTA (ШАГ 7).
3. **Монетизация**: 106 хостов без слотов — включить через config/feature-flags (ШАГ 8).
