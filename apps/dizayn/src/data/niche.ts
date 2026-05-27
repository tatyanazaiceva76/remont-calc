import { niches } from '../../../../src/data/niche-services';
import { nicheCities } from '../../../../src/data/niche-cities';
export const niche = niches.find((n) => n.slug === 'dizayn-interyera');
export { nicheCities };
if (!niche) throw new Error('Niche dizayn-interyera not found');
