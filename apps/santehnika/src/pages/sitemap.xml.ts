import type { APIRoute } from 'astro';
import { niche, nicheCities } from '~/data/niche';
import { SCENARIOS } from '~/data/scenarios';
import { SITE_CONFIG } from '~/config';

export const GET: APIRoute = ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? `https://${SITE_CONFIG.domain}`;
  const today = new Date().toISOString().slice(0, 10);
  const n = niche!;
  const urls: { loc: string; priority: number }[] = [
    { loc: `${base}/`, priority: 1.0 },
    ...n.subTypes.map((s) => ({ loc: `${base}/${s.slug}/`, priority: 0.9 })),
    ...nicheCities.map((c) => ({ loc: `${base}/v-${c.slug}/`, priority: 0.85 }))
  ];
  for (const s of n.subTypes) {
    for (const c of nicheCities) {
      urls.push({ loc: `${base}/${s.slug}/v-${c.slug}/`, priority: 0.8 });
    }
  }
  for (const sc of SCENARIOS) {
    urls.push({ loc: `${base}/scenariy/${sc.slug}/`, priority: 0.9 });
    for (const c of nicheCities) {
      urls.push({ loc: `${base}/scenariy/${sc.slug}/v-${c.slug}/`, priority: 0.8 });
    }
  }
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority.toFixed(2)}</priority></url>`).join('\n')}
</urlset>`;
  return new Response(body, { status: 200, headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
