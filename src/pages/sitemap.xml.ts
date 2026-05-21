import type { APIRoute } from 'astro';
import { scenarios } from '~/data/wallpaper-scenarios';
import { laminateScenarios } from '~/data/laminate-scenarios';
import { paintScenarios } from '~/data/paint-scenarios';
import { tileScenarios } from '~/data/tile-scenarios';
import { SITE_CONFIG } from '~/config';

export const GET: APIRoute = ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? `https://${SITE_CONFIG.domain}`;
  const today = new Date().toISOString().slice(0, 10);

  const urls: Array<{ loc: string; priority: number; changefreq: string }> = [
    { loc: `${base}/`, priority: 1.0, changefreq: 'monthly' },
    { loc: `${base}/raschet-oboev/`, priority: 0.9, changefreq: 'weekly' },
    { loc: `${base}/raschet-laminata/`, priority: 0.9, changefreq: 'weekly' },
    { loc: `${base}/raschet-kraski/`, priority: 0.9, changefreq: 'weekly' },
    { loc: `${base}/raschet-plitki/`, priority: 0.9, changefreq: 'weekly' },
    ...scenarios.map((s) => ({
      loc: `${base}/raschet-oboev/${s.slug}/`,
      priority: 0.8,
      changefreq: 'monthly'
    })),
    ...laminateScenarios.map((s) => ({
      loc: `${base}/raschet-laminata/${s.slug}/`,
      priority: 0.8,
      changefreq: 'monthly'
    })),
    ...paintScenarios.map((s) => ({
      loc: `${base}/raschet-kraski/${s.slug}/`,
      priority: 0.8,
      changefreq: 'monthly'
    })),
    ...tileScenarios.map((s) => ({
      loc: `${base}/raschet-plitki/${s.slug}/`,
      priority: 0.8,
      changefreq: 'monthly'
    }))
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority.toFixed(1)}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
};
