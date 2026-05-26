import type { APIRoute } from 'astro';
import { scenarios } from '~/data/wallpaper-scenarios';
import { laminateScenarios } from '~/data/laminate-scenarios';
import { paintScenarios } from '~/data/paint-scenarios';
import { tileScenarios } from '~/data/tile-scenarios';
import { plasterScenarios } from '~/data/plaster-scenarios';
import { linoleumScenarios } from '~/data/linoleum-scenarios';
import { drywallScenarios } from '~/data/drywall-scenarios';
import { insulationScenarios } from '~/data/insulation-scenarios';
import { concreteScenarios } from '~/data/concrete-scenarios';
import { regionScenarios } from '~/data/repair-regions';
import { roomTypePages } from '~/data/repair-by-room';
import { articles } from '~/data/sovety-articles';
import { comparisons } from '~/data/comparison-pages';
import { brandProducts } from '~/data/brand-products';
import { roofScenarios } from '~/data/roof-scenarios';
import { cities as regionsCities } from '~/data/regions-data';
import { niches } from '~/data/niche-services';
import { nicheCities } from '~/data/niche-cities';
import { topCities } from '~/data/top-cities-districts';
import { nicheScenarios } from '~/data/niche-scenarios';
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
    { loc: `${base}/raschet-shtukaturki/`, priority: 0.9, changefreq: 'weekly' },
    { loc: `${base}/raschet-linoleuma/`, priority: 0.9, changefreq: 'weekly' },
    { loc: `${base}/raschet-gipsokartona/`, priority: 0.9, changefreq: 'weekly' },
    { loc: `${base}/raschet-uteplitelya/`, priority: 0.9, changefreq: 'weekly' },
    { loc: `${base}/raschet-betona/`, priority: 0.9, changefreq: 'weekly' },
    { loc: `${base}/stoimost-remonta/`, priority: 1.0, changefreq: 'weekly' },
    { loc: `${base}/sovety/`, priority: 0.9, changefreq: 'weekly' },
    { loc: `${base}/chto-luchshe/`, priority: 0.9, changefreq: 'weekly' },
    { loc: `${base}/o-sayte/`, priority: 0.5, changefreq: 'yearly' },
    { loc: `${base}/brand/`, priority: 0.9, changefreq: 'weekly' },
    { loc: `${base}/raschet-krovli/`, priority: 0.9, changefreq: 'weekly' },
    { loc: `${base}/skolko-hvatit/`, priority: 0.85, changefreq: 'monthly' },
    { loc: `${base}/widget/`, priority: 0.7, changefreq: 'monthly' },
    { loc: `${base}/karta-sayta/`, priority: 0.6, changefreq: 'weekly' },
    { loc: `${base}/poisk/`, priority: 0.5, changefreq: 'monthly' },
    { loc: `${base}/raschet-plintusa/`, priority: 0.9, changefreq: 'monthly' },
    { loc: `${base}/raschet-gruntovki/`, priority: 0.9, changefreq: 'monthly' },
    { loc: `${base}/remont-kvartiry/`, priority: 0.95, changefreq: 'weekly' },
    ...roomTypePages.map((p) => ({
      loc: `${base}/remont-kvartiry/${p.slug}/`,
      priority: 0.9,
      changefreq: 'monthly'
    })),
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
    })),
    ...plasterScenarios.map((s) => ({
      loc: `${base}/raschet-shtukaturki/${s.slug}/`,
      priority: 0.8,
      changefreq: 'monthly'
    })),
    ...linoleumScenarios.map((s) => ({
      loc: `${base}/raschet-linoleuma/${s.slug}/`,
      priority: 0.8,
      changefreq: 'monthly'
    })),
    ...drywallScenarios.map((s) => ({
      loc: `${base}/raschet-gipsokartona/${s.slug}/`,
      priority: 0.8,
      changefreq: 'monthly'
    })),
    ...insulationScenarios.map((s) => ({
      loc: `${base}/raschet-uteplitelya/${s.slug}/`,
      priority: 0.8,
      changefreq: 'monthly'
    })),
    ...concreteScenarios.map((s) => ({
      loc: `${base}/raschet-betona/${s.slug}/`,
      priority: 0.8,
      changefreq: 'monthly'
    })),
    ...regionScenarios.map((s) => ({
      loc: `${base}/stoimost-remonta/${s.slug}/`,
      priority: 0.9, // высокий — это коммерческий контент
      changefreq: 'monthly'
    })),
    ...articles.map((a) => ({
      loc: `${base}/sovety/${a.slug}/`,
      priority: 0.8,
      changefreq: 'monthly'
    })),
    ...comparisons.map((c) => ({
      loc: `${base}/chto-luchshe/${c.slug}/`,
      priority: 0.85, // высокий коммерческий интент
      changefreq: 'monthly'
    })),
    ...brandProducts.map((p) => ({
      loc: `${base}/brand/${p.slug}/`,
      priority: 0.85, // самый коммерческий интент в нише
      changefreq: 'monthly'
    })),
    ...roofScenarios.map((s) => ({
      loc: `${base}/raschet-krovli/${s.slug}/`,
      priority: 0.8,
      changefreq: 'monthly'
    })),
    // Регионы РФ — мега-каталог из 17 городов × районы × типы (≈400 URL)
    { loc: `${base}/regiony/`, priority: 0.95, changefreq: 'weekly' },
    ...regionsCities.flatMap((c) => [
      { loc: `${base}/regiony/${c.slug}/`, priority: 0.9, changefreq: 'weekly' },
      ...c.districts.flatMap((d) => [
        { loc: `${base}/regiony/${c.slug}/${d.slug}/`, priority: 0.85, changefreq: 'monthly' },
        ...c.repairTypes.map((t) => ({
          loc: `${base}/regiony/${c.slug}/${d.slug}/${t.key}/`,
          priority: 0.8,
          changefreq: 'monthly'
        })),
        // Niche × district в /regiony/ (новое!)
        ...niches.map((n) => ({
          loc: `${base}/regiony/${c.slug}/${d.slug}/${n.slug}/`,
          priority: 0.8,
          changefreq: 'monthly'
        }))
      ])
    ]),
    // Смежные ниши (ремонт ванной, кухни, потолки, двери, электрика)
    { loc: `${base}/srednyaya-tsena-na-remont/`, priority: 0.9, changefreq: 'weekly' },
    { loc: `${base}/smeta/`, priority: 0.95, changefreq: 'monthly' },
    { loc: `${base}/karta-seti/`, priority: 0.7, changefreq: 'monthly' },
    ...niches.flatMap((n) => [
      { loc: `${base}/${n.slug}/`, priority: 0.9, changefreq: 'weekly' },
      ...n.subTypes.map((s) => ({
        loc: `${base}/${n.slug}/${s.slug}/`,
        priority: 0.85,
        changefreq: 'monthly'
      })),
      ...nicheCities.map((c) => ({
        loc: `${base}/${n.slug}/v-${c.slug}/`,
        priority: 0.85,
        changefreq: 'monthly'
      })),
      // District × niche для топ-4 городов (Москва, СПб, Екб, Казань)
      ...topCities.flatMap((tc) => tc.districts.map((d) => ({
        loc: `${base}/${n.slug}/${d.slug}-${tc.slug}/`,
        priority: 0.85,
        changefreq: 'monthly'
      }))),
      // Niche scenarios: срочный, после потопа, эконом, премиум
      ...nicheScenarios.map((s) => ({
        loc: `${base}/${n.slug}/${s.slug}-remont/`,
        priority: 0.85,
        changefreq: 'monthly'
      }))
    ])
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
