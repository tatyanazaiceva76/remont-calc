// Yandex Turbo Pages RSS-feed
// Доку: https://yandex.ru/dev/turbo/doc/rss/index.html
// Подписывается в Вебмастере: Турбо-страницы → Источники → RSS

import type { APIRoute } from 'astro';
import { articles } from '~/data/sovety-articles';
import { comparisons } from '~/data/comparison-pages';
import { brandProducts } from '~/data/brand-products';
import { regionScenarios } from '~/data/repair-regions';
import { roomTypePages } from '~/data/repair-by-room';
import { SITE_CONFIG } from '~/config';

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function cdata(s: string) {
  return `<![CDATA[${s.replace(/\]\]>/g, ']]&gt;')}]]>`;
}

export const GET: APIRoute = ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? `https://www.${SITE_CONFIG.domain}`;
  const now = new Date().toUTCString();

  // Собираем элементы — для Turbo лучше всего подходят длинные статьи
  const items: string[] = [];

  // Статьи /sovety/
  for (const a of articles) {
    const link = `${base}/sovety/${a.slug}/`;
    const contentHtml =
      `<p>${esc(a.intro)}</p>` +
      a.sections
        .map((s) => `<h2>${esc(s.h2)}</h2>` + s.paragraphs.map((p) => `<p>${esc(p)}</p>`).join(''))
        .join('');
    items.push(`
      <item turbo="true">
        <link>${link}</link>
        <pubDate>${now}</pubDate>
        <title>${esc(a.h1)}</title>
        <author>KalkRemont</author>
        <turbo:content>${cdata(contentHtml)}</turbo:content>
      </item>`);
  }

  // Сравнения /chto-luchshe/
  for (const c of comparisons) {
    const link = `${base}/chto-luchshe/${c.slug}/`;
    const contentHtml =
      `<p>${esc(c.intro)}</p>` +
      `<h2>Сравнение</h2>` +
      `<table><tr><th>Параметр</th><th>${esc(c.optionA)}</th><th>${esc(c.optionB)}</th></tr>` +
      c.rows.map((r) => `<tr><td>${esc(r.param)}</td><td>${esc(r.a)}</td><td>${esc(r.b)}</td></tr>`).join('') +
      `</table>` +
      `<h2>Когда лучше ${esc(c.optionA)}</h2><ul>${c.whenA.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>` +
      `<h2>Когда лучше ${esc(c.optionB)}</h2><ul>${c.whenB.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>` +
      `<h2>Вывод</h2><p>${esc(c.verdict)}</p>`;
    items.push(`
      <item turbo="true">
        <link>${link}</link>
        <pubDate>${now}</pubDate>
        <title>${esc(c.h1)}</title>
        <author>KalkRemont</author>
        <turbo:content>${cdata(contentHtml)}</turbo:content>
      </item>`);
  }

  // Бренды /brand/
  for (const p of brandProducts) {
    const link = `${base}/brand/${p.slug}/`;
    const contentHtml =
      `<p>${esc(p.intro)}</p>` +
      `<h2>Характеристики</h2><ul>${p.specs.map((s) => `<li><b>${esc(s.label)}:</b> ${esc(s.value)}</li>`).join('')}</ul>` +
      `<h2>Применение</h2><p>${esc(p.application)}</p>` +
      `<h2>Расход</h2><p>${esc(p.consumption)}</p>` +
      `<h2>Плюсы</h2><ul>${p.pros.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` +
      `<h2>Минусы</h2><ul>${p.cons.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
    items.push(`
      <item turbo="true">
        <link>${link}</link>
        <pubDate>${now}</pubDate>
        <title>${esc(p.h1)}</title>
        <author>KalkRemont</author>
        <turbo:content>${cdata(contentHtml)}</turbo:content>
      </item>`);
  }

  // Городские страницы (короткий контент)
  for (const r of regionScenarios) {
    const link = `${base}/stoimost-remonta/${r.slug}/`;
    const contentHtml =
      `<p>${esc(r.intro)}</p>` +
      `<p>На странице — калькулятор стоимости ремонта с учётом цен ${esc(r.cityGen)}, таблица цен на косметический, капитальный, евроремонт по типам квартир. Контакты проверенных мастеров.</p>`;
    items.push(`
      <item turbo="true">
        <link>${link}</link>
        <pubDate>${now}</pubDate>
        <title>${esc('Стоимость ремонта ' + r.cityGen)}</title>
        <author>KalkRemont</author>
        <turbo:content>${cdata(contentHtml)}</turbo:content>
      </item>`);
  }

  // Страницы по типу квартиры
  for (const p of roomTypePages) {
    const link = `${base}/remont-kvartiry/${p.slug}/`;
    const contentHtml =
      `<p>${esc(p.intro)}</p>` +
      `<h2>Особенности</h2><ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>`;
    items.push(`
      <item turbo="true">
        <link>${link}</link>
        <pubDate>${now}</pubDate>
        <title>${esc(p.h1)}</title>
        <author>KalkRemont</author>
        <turbo:content>${cdata(contentHtml)}</turbo:content>
      </item>`);
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:yandex="http://news.yandex.ru" xmlns:media="http://search.yahoo.com/mrss/" xmlns:turbo="http://turbo.yandex.ru" version="2.0">
  <channel>
    <title>${esc(SITE_CONFIG.siteName)}</title>
    <link>${base}/</link>
    <description>${esc(SITE_CONFIG.siteDescription)}</description>
    <language>ru</language>
    ${items.join('\n')}
  </channel>
</rss>
`;

  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' }
  });
};
