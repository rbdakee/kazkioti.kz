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

export const MANUFACTURER_BY_SLUG: Record<
  string,
  { name: string; alternateName: string[]; url?: string }
> = {
  df404: { name: 'Dongfeng', alternateName: ['Dong Feng', 'Дунфэн'] },
  'df404-cab': { name: 'Dongfeng', alternateName: ['Dong Feng', 'Дунфэн'] },
  df904: { name: 'Dongfeng', alternateName: ['Dong Feng', 'Дунфэн'] },
  ts1204: { name: 'Wuzheng', alternateName: ['Ву Чжэн', 'Wu Zheng'] },
  ts1404: { name: 'Wuzheng', alternateName: ['Ву Чжэн', 'Wu Zheng'] },
  ts2114: { name: 'Wuzheng', alternateName: ['Ву Чжэн', 'Wu Zheng'] },
}

function getManufacturer(slug: string) {
  return MANUFACTURER_BY_SLUG[slug] ?? null
}

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
    // Dual-type: AutoDealer alone loses generic Organization signals,
    // so we emit both. Google and major LLMs accept arrays for @type.
    '@type': ['Organization', 'AutoDealer'],
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: [
      'KazKioti',
      'Каз КИОТИ',
      'КАЗ-КИОТИ',
      'Каз-Киоти',
      'Қаз КИОТИ',
      'KAZKIOTI Tractors',
    ],
    url: abs(locale, ''),
    logo: `${SITE_URL}/logo.png`,
    email: COMPANY_EMAIL,
    telephone: COMPANY_PHONE_TEL,
    slogan:
      locale === 'kk'
        ? 'Қазақстанда құрастырылған тракторлар'
        : 'Тракторы, собранные в Казахстане',
    foundingDate: '2016',
    foundingLocation: {
      '@type': 'Place',
      name: 'Бадам, Туркестанская область, Казахстан',
    },
    areaServed: [
      { '@type': 'Country', name: 'Kazakhstan' },
      { '@type': 'AdministrativeArea', name: 'Туркестанская область' },
      { '@type': 'AdministrativeArea', name: 'Алматинская область' },
      { '@type': 'AdministrativeArea', name: 'Карагандинская область' },
      { '@type': 'AdministrativeArea', name: 'Акмолинская область' },
      { '@type': 'AdministrativeArea', name: 'Костанайская область' },
      { '@type': 'AdministrativeArea', name: 'Восточно-Казахстанская область' },
      { '@type': 'AdministrativeArea', name: 'Жамбылская область' },
      { '@type': 'AdministrativeArea', name: 'Кызылординская область' },
    ],
    knowsAbout: [
      'Сельскохозяйственная техника',
      'Тракторы',
      'Dongfeng',
      'Wuzheng',
      'KIOTI',
      'Навесное оборудование',
      'Сельхозтехника в Казахстане',
      'Субсидируемая техника',
      'Лизинг сельхозтехники',
    ],
    sameAs: [SOCIAL_LINKS.instagram, SOCIAL_LINKS.youtube].filter(Boolean),
    inLanguage: ['ru', 'kk'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY_ADDRESS,
      addressCountry: 'KZ',
    },
  }
}

export function websiteJsonLd(_locale: Locale): JsonLdObject {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: ['ru', 'kk'],
    publisher: { '@id': `${SITE_URL}/#organization` },
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

  const manufacturer = getManufacturer(tractor.slug)
  const productUrl = abs(locale, `/tractors/${tractor.slug}`)
  const modelCode = tractor.slug.toUpperCase()

  const data: JsonLdObject = {
    '@context': SCHEMA_CONTEXT,
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: `${SITE_NAME} ${tractor.name}`,
    description: tractor.subtitle,
    image: images,
    sku: tractor.slug,
    mpn: modelCode,
    model: modelCode,
    category: 'Сельскохозяйственная техника / Тракторы',
    audience: {
      '@type': 'Audience',
      audienceType: 'Фермеры, агрохозяйства',
    },
    inLanguage: locale === 'kk' ? 'kk' : 'ru',
    brand: manufacturer
      ? {
          '@type': 'Brand',
          name: manufacturer.name,
          alternateName: manufacturer.alternateName,
        }
      : {
          '@type': 'Brand',
          name: SITE_NAME,
        },
  }

  if (manufacturer) {
    data.manufacturer = {
      '@type': 'Organization',
      name: manufacturer.name,
      alternateName: manufacturer.alternateName,
    }
  }

  const offerPrice = tractor.priceWithSubsidy ?? tractor.price
  if (typeof offerPrice === 'number') {
    const now = new Date()
    const priceValidUntil = `${now.getUTCFullYear() + 1}-12-31`
    data.offers = {
      '@type': 'Offer',
      priceCurrency: 'KZT',
      price: offerPrice,
      priceValidUntil,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: productUrl,
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
      },
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

export interface BrandJsonLdArgs {
  brandName: string
  alternateName: string[]
  hubUrl: string
  modelUrls: string[]
  description?: string
}

export function brandJsonLd(args: BrandJsonLdArgs): JsonLdObject {
  const data: JsonLdObject = {
    '@context': SCHEMA_CONTEXT,
    '@type': 'Brand',
    name: args.brandName,
    alternateName: args.alternateName,
    url: args.hubUrl,
    subjectOf: { '@type': 'WebPage', url: args.hubUrl },
    makesOffer: {
      '@type': 'OfferCatalog',
      name: `${args.brandName} tractors at ${SITE_NAME}`,
      itemListElement: args.modelUrls.map((url, i) => ({
        '@type': 'Offer',
        position: i + 1,
        itemOffered: { '@type': 'Product', url },
        url,
      })),
    },
  }
  if (args.description) {
    data.description = args.description
  }
  return data
}
