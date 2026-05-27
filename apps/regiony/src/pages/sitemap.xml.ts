import type { APIRoute } from 'astro';
import { cities } from '~/data/all-cities';
import { SITE_CONFIG } from '~/config';

export const GET: APIRoute = ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? `https://${SITE_CONFIG.domain}`;
  const today = new Date().toISOString().slice(0, 10);
  const urls: { loc: string; priority: number }[] = [
    { loc: `${base}/`, priority: 1.0 }
  ];
  for (const c of cities) {
    urls.push({ loc: `${base}/${c.slug}/`, priority: 0.95 });
    for (const d of c.districts) {
      urls.push({ loc: `${base}/${c.slug}/${d.slug}/`, priority: 0.9 });
      for (const t of c.repairTypes) {
        urls.push({ loc: `${base}/${c.slug}/${d.slug}/${t.key}/`, priority: 0.8 });
      }
    }
  }
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority.toFixed(2)}</priority></url>`).join('\n')}
</urlset>`;
  return new Response(body, { status: 200, headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
