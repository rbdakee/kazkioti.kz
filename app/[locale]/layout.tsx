import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Geologica, Manrope, Montserrat } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing, type Locale } from '@/lib/i18n/routing'
import { SITE_URL } from '@/lib/constants'
import { localizedAlternates } from '@/lib/seo/alternates'
import { Header } from '@/components/sections/Header'
import { Footer } from '@/components/sections/Footer'
import { MessengerFAB } from '@/components/forms/MessengerFAB'
import { CookieBanner } from '@/components/sections/CookieBanner'
import { Analytics } from '@/components/seo/Analytics'
import '@/styles/globals.css'

const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
  preload: true,
})

const manrope = Manrope({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
  preload: true,
})

const geologica = Geologica({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-geologica',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
})

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!routing.locales.includes(locale as Locale)) notFound()
  const t = await getTranslations({ locale, namespace: 'meta.home' })
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t('title'), template: '%s — KAZKIOTI' },
    description: t('description'),
    alternates: localizedAlternates('', locale as Locale),
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
      yandex: process.env.YANDEX_VERIFICATION || undefined,
    },
    // Geo targeting: the factory is in Бадам, Ордабасынский район,
    // Туркестанская область. `KZ-13` is the ISO 3166-2 code for
    // Туркестанская обл. Yandex still consumes these legacy meta tags.
    other: {
      'geo.region': 'KZ-13',
      'geo.placename': 'Бадам, Туркестанская область, Казахстан',
      'geo.position': '42.5333;69.3833',
      ICBM: '42.5333, 69.3833',
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!routing.locales.includes(locale as Locale)) notFound()

  setRequestLocale(locale)
  const messages = await getMessages()
  const t = await getTranslations({ locale, namespace: 'common' })

  return (
    <html
      lang={locale}
      className={`${montserrat.variable} ${manrope.variable} ${geologica.variable}`}
    >
      <body className="bg-bg-default text-text-primary font-body antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-brand-red focus:px-4 focus:py-2 focus:text-white"
          >
            {t('skipToContent')}
          </a>
          <Header locale={locale as Locale} />
          <main id="main-content" className="min-h-screen">
            {children}
          </main>
          <Footer locale={locale as Locale} />
          <MessengerFAB locale={locale as Locale} />
          <CookieBanner />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
