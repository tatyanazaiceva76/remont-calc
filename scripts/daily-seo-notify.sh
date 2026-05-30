#!/usr/bin/env bash
# Ежедневный пинг поисковиков по всей сети: IndexNow + Яндекс recrawl (квота 150/хост).
# Квота переобхода сбрасывается в 00:00 МСК. Машина в TZ +07, поэтому крон стоит
# на 04:02 ЛОКАЛЬНОГО (= 00:02 МСК) — сразу после сброса, пока 150 слотов свежие.
# (Раньше стоял на 00:35 локального = 20:35 МСК — квота к этому часу уже съедена,
#  поэтому www-переобход всегда был 0.)
# Лог пишется в reports/ + в reports/cron-notify.log.
set -uo pipefail   # без -e: одна упавшая команда не должна обрывать весь проход
cd "$(dirname "$0")/.."
if [ -f .env.local ]; then set -a; . ./.env.local; set +a; fi
TS="$(date '+%Y-%m-%d %H:%M:%S')"
echo "===== $TS daily-seo-notify START =====" >> reports/cron-notify.log
# bun в PATH (через ~/.bun) на случай запуска из cron с урезанным окружением
export PATH="$HOME/.bun/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
# 1) ПЕРВЫМИ money-страницы (top по money_score, окно ротации курсором) забирают
#    свежую квоту переобхода www — иначе её съедает общий проход на главную+хабы,
#    которые и так давно в индексе. За ~9 ночей курсор обойдёт все 1280 money-URL.
bun scripts/recrawl-money-pages.ts --csv reports/proposed-new-money-pages.csv --rotate --limit 150 >> reports/cron-notify.log 2>&1 || echo "money-recrawl failed rc=$?" >> reports/cron-notify.log
# 2) Затем общий сетевой проход: IndexNow по всем хостам + переобход ПРОЧИХ хостов
#    (у каждого своя квота 150; www-переобход тут уже 429 — это ок, money важнее).
bun scripts/notify-indexnow-recrawl.ts --all >> reports/cron-notify.log 2>&1 || echo "notify failed rc=$?" >> reports/cron-notify.log
echo "===== $(date '+%Y-%m-%d %H:%M:%S') daily-seo-notify END =====" >> reports/cron-notify.log
