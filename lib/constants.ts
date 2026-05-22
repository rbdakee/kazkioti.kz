import type { Locale } from './i18n/routing'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kazkioti.kz'
export const SITE_NAME = 'KAZKIOTI'

export const COMPANY_PHONE_HUMAN = '+7 747 876 44 44'
export const COMPANY_PHONE_TEL = '+77478764444'
export const COMPANY_EMAIL = 'info@kazkioti.kz'
export const COMPANY_ADDRESS =
  'Туркестанская обл., Ордабасынский р-н, с. Бадам, Казахстанско-Турецкая индустриальная зона'

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
  { key: 'news', href: '/news' },
] as const

export const SOCIAL_LINKS = {
  instagram: process.env.INSTAGRAM_URL ?? 'https://instagram.com/kazkioti',
  youtube: process.env.YOUTUBE_URL ?? 'https://youtube.com/@kazkioti',
  telegram: process.env.TELEGRAM_CHANNEL_URL ?? `https://t.me/${TELEGRAM_USERNAME}`,
} as const

export const PDF_CATALOG_URL = '/docs/kazkioti-catalog.pdf'

export const TRACTOR_SLUGS = ['df404', 'df404-cab', 'df904', 'ts1204', 'ts1404', 'ts2114'] as const
export type TractorSlug = (typeof TRACTOR_SLUGS)[number]
