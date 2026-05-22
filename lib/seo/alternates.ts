import type { Metadata } from 'next'
import { routing, type Locale } from '@/lib/i18n/routing'
import { SITE_URL } from '@/lib/constants'

type Alternates = NonNullable<Metadata['alternates']>
type Languages = NonNullable<Alternates['languages']>

export function localizedAlternates(path: string, locale: Locale): Alternates {
  const cleanPath = path.startsWith('/') ? path : path ? `/${path}` : ''
  const languages: Languages = {}
  for (const l of routing.locales) {
    languages[l] = `${SITE_URL}/${l}${cleanPath}`
  }
  languages['x-default'] = `${SITE_URL}/${routing.defaultLocale}${cleanPath}`
  return {
    canonical: `${SITE_URL}/${locale}${cleanPath}`,
    languages,
  }
}
