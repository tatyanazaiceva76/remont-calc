import type { APIRoute } from 'astro';
import { districts, repairTypes } from '~/data/districts';
import { roomConfigs } from '~/data/rooms';
import { scenarios } from '~/data/scenarios';
import { SITE_CONFIG } from '~/config';

export const GET: APIRoute = ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? `https://${SITE_CONFIG.domain}`;
  const today = new Date().toISOString().slice(0, 10);
  const urls: { loc: string; priority: number }[] = [
    { loc: `${base}/`, priority: 1.0 },
    { loc: `${base}/preyskurant/`, priority: 0.9 },
    ...districts.map((d) => ({ loc: `${base}/${d.slug}/`, priority: 0.9 }))
  ];
  for (const d of districts) {
    for (const t of repairTypes) {
      urls.push({ loc: `${base}/${d.slug}/${t.key}/`, priority: 0.8 });
      for (const r of roomConfigs) {
        urls.push({ loc: `${base}/${d.slug}/${t.key}/${r.slug}/`, priority: 0.75 });
      }
    }
    // pod-klyuch
    urls.push({ loc: `${base}/${d.slug}/pod-klyuch/`, priority: 0.85 });
  }
  // Высокоинтентные сценарии × все районы
  for (const s of scenarios) {
    for (const d of districts) {
      urls.push({ loc: `${base}/${s.slug}/${d.slug}/`, priority: 0.85 });
    }
  }
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority.toFixed(2)}</priority></url>`).join('\n')}
</urlset>`;
  return new Response(body, { status: 200, headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
