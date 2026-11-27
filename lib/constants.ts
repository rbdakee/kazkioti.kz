import type { Locale } from './i18n/routing'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kazkioti.kz'
export const SITE_NAME = 'KAZKIOTI'

export const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER ?? '77478764444'
export const TELEGRAM_USERNAME = process.env.TELEGRAM_USERNAME ?? 'kazkioti'

const WHATSAPP_GREETING: Record<Locale, string> = {
  ru: 'Здравствуйте, хочу узнать о тракторе KAZKIOTI',
  kk: 'Сәлеметсіз бе, KAZKIOTI тракторы туралы білгім келеді',
}

export function whatsappUrl(locale: Locale = 'ru'): string {
  const text = encodeURIComponent(WHATSAPP_GREETING[locale])
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`
}

export function telegramUrl(): string {
  return `https://t.me/${TELEGRAM_USERNAME}`
}

export interface NavItem {
  key: string
  href: string
}

export const NAV_ITEMS: readonly NavItem[] = [
  { key: 'tractors', href: '/tractors' },
  { key: 'attachments', href: '/attachments' },
  { key: 'parts', href: '/parts' },
  { key: 'dealers', href: '/dealers' },
  { key: 'about', href: '/about' },
] as const

/** Shown in navigation only while at least one news article is published. */
export const NEWS_NAV_ITEM: NavItem = { key: 'news', href: '/news' }

export function navItems(showNews: boolean): readonly NavItem[] {
  return showNews ? [...NAV_ITEMS, NEWS_NAV_ITEM] : NAV_ITEMS
}

export const SOCIAL_LINKS = {
  instagram: process.env.INSTAGRAM_URL ?? 'https://www.instagram.com/dong_feng_kz',
  youtube: process.env.YOUTUBE_URL ?? 'https://youtube.com/@kazkioti',
} as const

export const PDF_CATALOG_URL = '/docs/kazkioti-catalog.pdf'
