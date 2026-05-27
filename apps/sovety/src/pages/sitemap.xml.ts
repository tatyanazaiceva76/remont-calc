import type { APIRoute } from 'astro';
import { guides } from '~/data/guides';
import { SITE_CONFIG } from '~/config';

export const GET: APIRoute = ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? `https://${SITE_CONFIG.domain}`;
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${base}/`, priority: 1.0 },
    ...guides.map((g) => ({ loc: `${base}/${g.slug}/`, priority: 0.9 }))
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority.toFixed(2)}</priority></url>`).join('\n')}
</urlset>`;
  return new Response(body, { status: 200, headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
