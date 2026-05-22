import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  locales: ['ru', 'kk'],
  defaultLocale: 'kk',
  localePrefix: 'always',
  // Always land first-time visitors on the Kazakh locale; the language switcher
  // and cookie still let users move to RU.
  localeDetection: false,
})

export type Locale = (typeof routing.locales)[number]

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
