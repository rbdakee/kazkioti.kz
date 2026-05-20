import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing, type Locale } from '@/lib/i18n/routing'
import { SITE_URL } from '@/lib/constants'
import { Header } from '@/components/sections/Header'
import { Footer } from '@/components/sections/Footer'
import { MessengerFAB } from '@/components/forms/MessengerFAB'
import { CookieBanner } from '@/components/sections/CookieBanner'
import '@/styles/globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
  preload: true,
})

const inter = Inter({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: false,
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
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        ru: `${SITE_URL}/ru`,
        kk: `${SITE_URL}/kk`,
        'x-default': `${SITE_URL}/ru`,
      },
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
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
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
      </body>
    </html>
  )
}
