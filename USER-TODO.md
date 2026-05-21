# 📋 Что осталось сделать (приоритет сверху вниз)

## ✅ Готово (на сайте уже работает)

- ✓ Домен `kalkremont.ru` куплен и подключён через `www.`
- ✓ Сайт live: **[https://www.kalkremont.ru](https://www.kalkremont.ru)** — SSL, CDN, 187 страниц
- ✓ 6 калькуляторов: обои, ламинат, краска, плитка, штукатурка, линолеум
- ✓ Yandex Метрика подключена (counter `109345156`)
- ✓ Yandex Webmaster VERIFIED, sitemap загружен, переобход запрошен
- ✓ IndexNow пинг отправлен в Yandex + Bing (186 URL)
- ✓ Affiliate-блоки на каждой странице (ВсеИнструменты / Леруа / Петрович) — пока без аффилиат-ID

---

## 🟡 Нужно от тебя (5-10 минут)

### 1. Apex → www редирект
Сейчас `kalkremont.ru` (без www) не работает. Только `www.kalkremont.ru`. Чтобы починить — **перенеси DNS-зону в Cloudflare** (через UI CF):
1. Открой [dash.cloudflare.com](https://dash.cloudflare.com/) → **+ Add a Site** → введи `kalkremont.ru` → выбери **Free plan**
2. CF подтянет существующие DNS-записи, дайт 2 NS-сервера типа `xxx.ns.cloudflare.com`
3. **Скинь эти NS-серверы мне** — я подменю их у reg.ru через API
4. После пропагации (24-48 ч) я через CF API сделаю redirect rule apex → www

### 2. GitHub Actions secrets (для авто-деплоя)
Workflow `.github/workflows/deploy.yml` уже в репо. Чтобы заработал — добавь 3 секрета:
1. Открой [github.com/tatyanazaiceva76/remont-calc/settings/secrets/actions](https://github.com/tatyanazaiceva76/remont-calc/settings/secrets/actions)
2. Жми **New repository secret** и добавь по очереди (значения возьми из `.env.local`):
   - `CLOUDFLARE_API_TOKEN` → значение `CF_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID` → значение `CF_ACCOUNT_ID`
   - `INDEXNOW_KEY` → значение `INDEXNOW_KEY`

После этого любой `git push` на main → авто-сборка → авто-деплой на CF Pages → авто-пинг Yandex/Bing.

---

## 🟠 Через 1-2 недели (когда страницы попадут в индекс Яндекса)

### 3. Подача на РСЯ — это деньги
[partner2.yandex.ru](https://partner2.yandex.ru/) → подать заявку на `www.kalkremont.ru`. Требования:
- Сайт проиндексирован в Яндексе (можно проверить запросом `site:kalkremont.ru` в выдаче)
- Есть какой-то трафик (даже минимальный)
- ИП или самозанятый (у тебя есть, раз работаешь на Директе)

После одобрения (1-7 дней):
1. В кабинете партнёра создай **3 RTB-блока**: top, middle, bottom (адаптивные)
2. **Скинь мне 3 ID** (формат `R-A-1234567-1`, `R-A-1234567-2`, `R-A-1234567-3`)
3. Я впишу в `src/config.ts` → они появятся на сайте автоматом

### 4. Регистрация в партнёрках (Admitad / CityAds) — тоже деньги
Партнёрские программы стройретейлеров:
- **ВсеИнструменты.ру** через Admitad — 3-8% от заказа
- **Петрович** — у них своя партнёрка
- **Леруа Мерлен** — через Admitad, статус нестабильный после санкций

После регистрации — скинь мне свой Admitad ID и/или партнёрские ссылки, я подменю в `src/components/AffiliateLinks.astro`.

---

## 🟢 Опциональное

### 5. Wordstat — новые сценарии под популярные запросы
Через 2-3 недели после индексации зайди в Метрику и Вебмастер — увидишь по каким запросам приходит трафик. Скинь топ-20, я добавлю под них сценарные страницы.

### 6. РСЯ для kalkremont.ru (apex) — только после задачи #1
Когда apex заработает с редиректом, в РСЯ нужно добавить домен `kalkremont.ru` тоже (как зеркало). Не критично.

---

## 📊 Где смотреть метрики

| Что | Где |
|---|---|
| Сайт | https://www.kalkremont.ru |
| Метрика | https://metrika.yandex.ru/dashboard?id=109345156 |
| Вебмастер | https://webmaster.yandex.ru/site/https:www.kalkremont.ru:443/ |
| CF Pages | https://dash.cloudflare.com/?to=/:account/pages/view/remont-calc |
| GitHub | https://github.com/tatyanazaiceva76/remont-calc |
| reg.ru | https://www.reg.ru/user/account/ |

---

## ⚠️ Секреты в .env.local

Файл `.env.local` содержит все токены — он в `.gitignore`, никогда не уйдёт в репозиторий. Бэкап советую сделать. Все токены при компрометации можно отозвать в соответствующих кабинетах и перевыпустить за минуту.

**Сменить пароль reg.ru** — рекомендую (он засветился в скриншотах). Тогда обнови `REGRU_PASSWORD` в `.env.local`.
