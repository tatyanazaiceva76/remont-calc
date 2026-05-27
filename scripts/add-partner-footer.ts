#!/usr/bin/env bun
// Добавляет Partner Network footer на 10 новых доменов + обновляет sitemap.

import { readFileSync, writeFileSync } from 'fs';
import { NICHES } from './niche-templates';

const ROOT = '/Users/mac/remont-calc';

const PARTNERS = NICHES.map((n) => ({
  domain: n.domain,
  niche: n.niche,
  emoji: n.emoji,
  description: n.tagline
}));

// Также включаем kalkremont как главный
PARTNERS.unshift({
  domain: 'www.kalkremont.ru',
  niche: 'Калькулятор ремонта',
  emoji: '🏠',
  description: 'Расчёт ремонта квартиры по 40 городам России'
});

function updateBaseLayout(niche: typeof NICHES[0]) {
  const path = `${ROOT}/apps/${niche.projectName}/src/layouts/Base.astro`;
  const content = readFileSync(path, 'utf8');

  // Найти </footer> и добавить Partner Network перед ним
  const partnersForThis = PARTNERS.filter((p) => p.domain !== niche.domain).slice(0, 6);

  const partnerHtml = `
      <div class="partner-network">
        <strong>🤝 Наша сеть проектов:</strong>
        <div class="partners">
          ${partnersForThis.map((p) =>
            `<a href="https://${p.domain}/" rel="noopener" title="${p.niche}">${p.emoji} ${p.niche}</a>`
          ).join('\n          ')}
        </div>
      </div>`;

  if (!content.includes('partner-network')) {
    const newContent = content.replace(
      /<p>© /,
      `${partnerHtml}\n        <p>© `
    ).replace(
      /\.site-footer a \{ color: #999; \}/,
      `.site-footer a { color: #999; }
      .partner-network { background: #2a2a2a; padding: 20px; border-radius: 12px; margin-bottom: 20px; }
      .partner-network strong { display: block; color: #ddd; margin-bottom: 10px; font-size: 13px; }
      .partners { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
      .partners a { font-size: 12px; padding: 6px 12px; background: rgba(255,255,255,0.05); border-radius: 14px; color: #ccc; text-decoration: none; transition: all 0.2s; }
      .partners a:hover { background: rgba(255,255,255,0.1); color: white; }`
    );
    writeFileSync(path, newContent);
    console.log(`  ✓ ${niche.projectName}`);
  } else {
    console.log(`  · ${niche.projectName} (уже добавлено)`);
  }
}

console.log('🤝 Добавление Partner Network footer на 10 доменах...\n');
for (const n of NICHES) updateBaseLayout(n);
console.log('\n✅ Готово');
