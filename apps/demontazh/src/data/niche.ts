import { niches } from '../../../../src/data/niche-services';
import { nicheCities } from '../../../../src/data/niche-cities';
export const niche = niches.find((n) => n.slug === 'demontazh-rabot');
export { nicheCities };
if (!niche) throw new Error('Niche demontazh-rabot not found');
