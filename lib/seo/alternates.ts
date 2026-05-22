import type { Metadata } from 'next'
import { routing, type Locale } from '@/lib/i18n/routing'
import { SITE_URL } from '@/lib/constants'

type Alternates = NonNullable<Metadata['alternates']>
type Languages = NonNullable<Alternates['languages']>

// Signal Kazakhstan as the geo target for both languages. URL paths remain
// `/ru/...` and `/kk/...`; only the hreflang keys carry the region qualifier.
// The literal `as const` is required so Next's `Languages` mapped type accepts
// these keys (it only allows known hreflang codes, not arbitrary strings).
export const HREFLANG_BY_LOCALE = {
  ru: 'ru-KZ',
  kk: 'kk-KZ',
} as const satisfies Record<Locale, string>

export function localizedAlternates(path: string, locale: Locale): Alternates {
  const cleanPath = path.startsWith('/') ? path : path ? `/${path}` : ''
  const languages: Languages = {}
  for (const l of routing.locales) {
    languages[HREFLANG_BY_LOCALE[l]] = `${SITE_URL}/${l}${cleanPath}`
  }
  languages['x-default'] = `${SITE_URL}/${routing.defaultLocale}${cleanPath}`
  return {
    canonical: `${SITE_URL}/${locale}${cleanPath}`,
    languages,
  }
}
