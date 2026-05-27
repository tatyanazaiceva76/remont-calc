import { niches } from '../../../../src/data/niche-services';
import { nicheCities } from '../../../../src/data/niche-cities';
export const niche = niches.find((n) => n.slug === 'balkony-i-lodzhii');
export { nicheCities };
if (!niche) throw new Error('Niche balkony-i-lodzhii not found');
