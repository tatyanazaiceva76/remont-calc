import type { APIRoute } from 'astro';

const NETWORK_HOSTS = [
  'www.kalkremont.ru', 'price.kalkremont.ru', 'sovety.kalkremont.ru', 'brand.kalkremont.ru',
  'moskva.kalkremont.ru','spb.kalkremont.ru','ekb.kalkremont.ru','kzn.kalkremont.ru','nsk.kalkremont.ru','krd.kalkremont.ru',
  'nn.kalkremont.ru','chel.kalkremont.ru','ufa.kalkremont.ru','sam.kalkremont.ru','rnd.kalkremont.ru','vrn.kalkremont.ru',
  'perm.kalkremont.ru','vlg.kalkremont.ru','tyumen.kalkremont.ru','brn.kalkremont.ru',
  'astr.kalkremont.ru','cbx.kalkremont.ru','irk.kalkremont.ru','izh.kalkremont.ru','kem.kalkremont.ru','khv.kalkremont.ru',
  'kir.kalkremont.ru','kld.kalkremont.ru','lpk.kalkremont.ru','oren.kalkremont.ru','pnz.kalkremont.ru','rzn.kalkremont.ru',
  'sar.kalkremont.ru','tlt.kalkremont.ru','tul.kalkremont.ru','vvo.kalkremont.ru','yar.kalkremont.ru',
  'vannye.kalkremont.ru','kuhni.kalkremont.ru','okna.kalkremont.ru','potolki.kalkremont.ru','dveri.kalkremont.ru',
  'elektro.kalkremont.ru','santehnika.kalkremont.ru','dizayn.kalkremont.ru','balkony.kalkremont.ru','styazhka.kalkremont.ru',
  'uborka.kalkremont.ru','demontazh.kalkremont.ru','kondicioner.kalkremont.ru','fasad.kalkremont.ru',
  // 10 новых
  'ipoteka-remont.ru','kuhni-zakaz-online.ru','dom-stroy-online.ru','natyazhnoi-master24.ru','okna-pvh-online.ru',
  'kupeshkafy24.ru','dveri-stalnye24.ru','perevodkvartiry.ru','dizayn-interyera-online.ru','kamin-zakaz24.ru'
];

export const GET: APIRoute = () => {
  const now = new Date().toISOString().slice(0, 10);
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    NETWORK_HOSTS.map((h) => '  <sitemap><loc>https://' + h + '/sitemap.xml</loc><lastmod>' + now + '</lastmod></sitemap>').join('\n') +
    '\n</sitemapindex>';
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
