// Маппинг семантически связанных сценариев между разными калькуляторами.
// Использует общий "ключ" (например "spalnyu" или "18-kv-m"), чтобы найти
// соответствующие страницы в других калькуляторах.

interface ScenarioRef { slug: string; h1: string; }

export interface CrossLink {
  label: string;          // что показать пользователю ("Ламинат на спальню")
  href: string;           // куда вести
}

// Извлекаем "ключ" из slug — общая часть для сравнения
// Например 'na-spalnyu' → 'spalnyu', 'na-komnatu-18-kv-m' → '18-kv-m'
function extractKey(slug: string): string | null {
  // Площадь: "na-komnatu-18-kv-m" → "18-kv-m"
  const areaMatch = slug.match(/(\d+)-kv-m/);
  if (areaMatch) return `${areaMatch[1]}-kv-m`;

  // Тип комнаты: "na-spalnyu" → "spalnyu"
  const roomMatch = slug.match(/^na-([a-z]+)$/);
  if (roomMatch) return roomMatch[1];

  return null;
}

// Найти связанный slug в другом наборе
function findRelated(
  key: string,
  others: ScenarioRef[],
  matcher: (slug: string, key: string) => boolean
): ScenarioRef | null {
  return others.find((s) => matcher(s.slug, key)) ?? null;
}

export interface CrossCalcContext {
  wallpaper: ScenarioRef[];
  laminate: ScenarioRef[];
  paint: ScenarioRef[];
  tile: ScenarioRef[];
}

export function getCrossLinks(
  currentCalc: 'wallpaper' | 'laminate' | 'paint' | 'tile',
  currentSlug: string,
  ctx: CrossCalcContext
): CrossLink[] {
  const key = extractKey(currentSlug);
  if (!key) return [];

  const calcs = [
    { id: 'wallpaper' as const, name: 'Обои', path: 'raschet-oboev', items: ctx.wallpaper },
    { id: 'laminate' as const, name: 'Ламинат', path: 'raschet-laminata', items: ctx.laminate },
    { id: 'paint' as const, name: 'Краска', path: 'raschet-kraski', items: ctx.paint },
    { id: 'tile' as const, name: 'Плитка', path: 'raschet-plitki', items: ctx.tile }
  ];

  const links: CrossLink[] = [];
  for (const c of calcs) {
    if (c.id === currentCalc) continue;

    // Для площади: ищем совпадение по числу метров (точное или близкое)
    const areaMatch = key.match(/^(\d+)-kv-m$/);
    if (areaMatch) {
      const target = parseInt(areaMatch[1], 10);
      // Точное совпадение
      let found = c.items.find((s) => s.slug.includes(`${target}-kv-m`));
      if (!found) {
        // Ближайшее
        const candidates = c.items
          .map((s) => {
            const m = s.slug.match(/(\d+)-kv-m/);
            return m ? { s, area: parseInt(m[1], 10) } : null;
          })
          .filter((x): x is { s: ScenarioRef; area: number } => x !== null);
        if (candidates.length > 0) {
          candidates.sort((a, b) => Math.abs(a.area - target) - Math.abs(b.area - target));
          found = candidates[0].s;
        }
      }
      if (found) {
        links.push({
          label: `${c.name} (${target} м²)`,
          href: `/${c.path}/${found.slug}/`
        });
      }
      continue;
    }

    // Для типа комнаты: ищем slug `na-{key}`
    const found = c.items.find((s) => s.slug === `na-${key}`);
    if (found) {
      links.push({
        label: `${c.name} (${humanize(key)})`,
        href: `/${c.path}/${found.slug}/`
      });
    }
  }

  return links;
}

function humanize(key: string): string {
  const map: Record<string, string> = {
    spalnyu: 'спальня',
    kuhnyu: 'кухня',
    detskuyu: 'детская',
    gostinuyu: 'гостиная',
    zal: 'зал',
    prihozhuyu: 'прихожая',
    koridor: 'коридор',
    vannuyu: 'ванная',
    tualet: 'туалет',
    kabinet: 'кабинет'
  };
  return map[key] ?? key;
}
