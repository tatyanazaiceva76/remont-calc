import type { APIRoute } from 'astro';
import { cities, repairTypes } from '~/data/cities';
import { SITE_CONFIG } from '~/config';

export const GET: APIRoute = ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? `https://${SITE_CONFIG.domain}`;
  const today = new Date().toISOString().slice(0, 10);

  const urls = [
    { loc: `${base}/`, priority: 1.0 },
    ...repairTypes.map((t) => ({ loc: `${base}/${t.slug}/`, priority: 0.9 })),
    ...cities.map((c) => ({ loc: `${base}/v-${c.slug}/`, priority: 0.85 })),
    ...cities.flatMap((c) =>
      repairTypes.map((t) => ({
        loc: `${base}/v-${c.slug}/${t.slug}/`,
        priority: 0.8
      }))
    )
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${u.priority.toFixed(2)}</priority></url>`).join('\n')}
</urlset>`;

  return new Response(body, { status: 200, headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
