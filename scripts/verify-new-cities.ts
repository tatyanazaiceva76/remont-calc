#!/usr/bin/env bun
// Verify 17 новых хостов через Yandex Webmaster.
// Стратегия: META tag через универсальный astro Layout (один на проект),
// но проще создать HTML-файл verification для каждого:
// /public/yandex_${uin}.html на каждом проекте.

import { writeFileSync, existsSync, mkdirSync } from 'fs';

const YA_TOKEN = process.env.YANDEX_OAUTH_TOKEN!;
const YA_USER = process.env.YANDEX_WEBMASTER_USER_ID!;

const NEW_CITIES = ['astr','cbx','irk','izh','kem','khv','kir','kld','lpk','oren','pnz','rzn','sar','tlt','tul','vvo','yar'];

async function ya(method: string, path: string, body?: unknown) {
  const r = await fetch(`https://api.webmaster.yandex.net/v4${path}`, {
    method,
    headers: { Authorization: `OAuth ${YA_TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await r.text();
  try { return { status: r.status, ...JSON.parse(text) }; } catch { return { status: r.status, raw: text }; }
}

for (const sub of NEW_CITIES) {
  const host = `${sub}.kalkremont.ru`;
  const id = `https:${host}:443`;
  console.log(`\n══ ${host} ══`);

  // Get verification UIN
  const v = await ya('GET', `/user/${YA_USER}/hosts/${id}/verification`) as { verification_uin?: string; verification_state?: string };
  console.log(`  UIN: ${v.verification_uin} · state: ${v.verification_state}`);
  if (!v.verification_uin) { console.log(`  ✗ нет UIN`); continue; }

  // Создаём HTML файл в public/
  const publicDir = `/Users/mac/remont-calc/apps/${sub}/public`;
  if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });
  const fileName = `yandex_${v.verification_uin}.html`;
  const content = `<html><head><meta name="yandex-verification" content="${v.verification_uin}" /></head><body>Verification: ${v.verification_uin}</body></html>`;
  writeFileSync(`${publicDir}/${fileName}`, content);
  console.log(`  ✓ ${fileName} создан`);
}

console.log('\n📌 Теперь нужно: build + deploy всех 17 apps, потом запросить verify через API');
