import { fetchSettings } from '@/lib/cms/client'
import { slugify } from '@/shared/slugify'
import type { Dealer as DealerDoc } from '@/shared/content'
import { toPhoneTel } from './company'

export interface Dealer extends DealerDoc {
  /** Derived from the city name so editors never manage keys by hand. */
  id: string
  phoneHref: string
}

export async function getDealers(): Promise<Dealer[]> {
  const { dealers } = await fetchSettings('dealers')
  return dealers.map((dealer, index) => ({
    ...dealer,
    id: slugify(dealer.name) || `dealer-${index + 1}`,
    phoneHref: `tel:${toPhoneTel(dealer.phone)}`,
  }))
}

export function dealerRegions(dealers: readonly Dealer[]): string[] {
  return Array.from(new Set(dealers.map((dealer) => dealer.region)))
}
