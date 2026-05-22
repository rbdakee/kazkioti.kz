import {
  COMPANY_ADDRESS,
  COMPANY_EMAIL,
  COMPANY_PHONE_TEL,
  SITE_NAME,
  SITE_URL,
  SOCIAL_LINKS,
} from '@/lib/constants'
import type { Locale } from '@/lib/i18n/routing'
import type { Dealer } from '@/lib/data/dealers'
import type { TractorFrontmatter } from '@/lib/types/tractor'

type JsonLdObject = Record<string, unknown>

const SCHEMA_CONTEXT = 'https://schema.org' as const

function abs(locale: Locale, path: string): string {
  const cleanPath = path.startsWith('/') ? path : path ? `/${path}` : ''
  return `${SITE_URL}/${locale}${cleanPath}`
}

function toAbsoluteAsset(image: string): string {
  if (/^https?:\/\//i.test(image)) return image
  const cleanPath = image.startsWith('/') ? image : `/${image}`
  return `${SITE_URL}${cleanPath}`
}

export function organizationJsonLd(locale: Locale): JsonLdObject {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'Organization',
    name: SITE_NAME,
    url: abs(locale, ''),
    logo: `${SITE_URL}/logo.png`,
    email: COMPANY_EMAIL,
    telephone: COMPANY_PHONE_TEL,
    sameAs: [SOCIAL_LINKS.instagram, SOCIAL_LINKS.youtube],
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY_ADDRESS,
      addressCountry: 'KZ',
    },
  }
}

export function productJsonLd(
  tractor: TractorFrontmatter,
  locale: Locale,
): JsonLdObject {
  const gallery = tractor.galleryImages ?? []
  const primaryImage = tractor.ogImage ?? tractor.heroImage
  const images = Array.from(
    new Set(
      [primaryImage, tractor.heroImage, ...gallery]
        .filter((src): src is string => Boolean(src))
        .map(toAbsoluteAsset),
    ),
  )

  const data: JsonLdObject = {
    '@context': SCHEMA_CONTEXT,
    '@type': 'Product',
    name: `${SITE_NAME} ${tractor.name}`,
    description: tractor.subtitle,
    image: images,
    sku: tractor.slug,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
  }

  const offerPrice = tractor.priceWithSubsidy ?? tractor.price
  if (typeof offerPrice === 'number') {
    data.offers = {
      '@type': 'Offer',
      priceCurrency: 'KZT',
      price: offerPrice,
      availability: 'https://schema.org/InStock',
      url: abs(locale, `/tractors/${tractor.slug}`),
    }
  }

  return data
}

export function localBusinessJsonLd(
  dealer: Dealer,
  locale: Locale,
): JsonLdObject {
  // AutoDealer (not LocalBusiness) — these locations sell vehicles.
  const data: JsonLdObject = {
    '@context': SCHEMA_CONTEXT,
    '@type': 'AutoDealer',
    name: `${SITE_NAME} · ${dealer.name}`,
    telephone: dealer.phone,
    url: abs(locale, `/dealers#${dealer.id}`),
    address: {
      '@type': 'PostalAddress',
      streetAddress: dealer.address,
      addressLocality: dealer.name,
      addressRegion: dealer.region,
      addressCountry: 'KZ',
    },
  }
  // dealer.hours is human-formatted (e.g. "пн–пт · 09:00–18:00"), not the
  // machine-parseable schema.org format ("Mo-Fr 09:00-18:00"). Skip to avoid
  // emitting invalid data.
  return data
}

export interface BreadcrumbItem {
  name: string
  url: string
}

export function breadcrumbListJsonLd(items: BreadcrumbItem[]): JsonLdObject {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export interface FAQEntry {
  question: string
  answer: string
}

export function faqPageJsonLd(items: FAQEntry[]): JsonLdObject {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
