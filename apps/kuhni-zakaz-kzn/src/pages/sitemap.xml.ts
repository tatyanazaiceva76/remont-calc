import type { APIRoute } from 'astro';
export const GET: APIRoute = ({ site }) => {
  const base = site?.href.replace(/\/$/, '') ?? 'https://kzn.kuhni-zakaz-online.ru';
  const services = ["klassika","sovremennyy","loft","malenkaya"];
  const urls = [base + '/', ...services.map((s) => base + '/uslugi/' + s + '/')];
  const now = new Date().toISOString().slice(0, 10);
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => '  <url><loc>' + u + '</loc><lastmod>' + now + '</lastmod></url>').join('\n') + '\n</urlset>';
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
