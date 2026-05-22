import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing, type Locale } from '@/lib/i18n/routing'
import { localizedAlternates } from '@/lib/seo/alternates'
import {
  brandJsonLd,
  breadcrumbListJsonLd,
  MANUFACTURER_BY_SLUG,
} from '@/lib/seo/jsonLd'
import { SITE_URL } from '@/lib/constants'
import { JsonLd } from '@/components/seo/JsonLd'
import { getAllTractors } from '@/lib/content/tractors'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { CardTractor } from '@/components/ui/Card/CardTractor'
import { FinalCTA } from '@/components/sections/FinalCTA'

const BRAND_NAME = 'Dongfeng'
const BRAND_PATH = '/dongfeng'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta.dongfeng' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: localizedAlternates(BRAND_PATH, locale),
  }
}

export default async function DongfengHubPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale })
  const tBrand = await getTranslations({ locale, namespace: 'manufacturer.dongfeng' })
  const tMeta = await getTranslations({ locale, namespace: 'meta.dongfeng' })

  const allTractors = await getAllTractors(locale)
  const dongfengTractors = allTractors.filter(
    (record) => MANUFACTURER_BY_SLUG[record.frontmatter.slug]?.name === BRAND_NAME,
  )

  const hubUrl = `${SITE_URL}/${locale}${BRAND_PATH}`
  const modelUrls = dongfengTractors.map(
    (record) => `${SITE_URL}/${locale}/tractors/${record.frontmatter.slug}`,
  )

  const jsonLdPayload = [
    brandJsonLd({
      brandName: BRAND_NAME,
      alternateName: ['Dong Feng', 'Дунфэн'],
      hubUrl,
      modelUrls,
      description: tMeta('description'),
    }),
    breadcrumbListJsonLd([
      { name: t('breadcrumbs.home'), url: `${SITE_URL}/${locale}` },
      { name: BRAND_NAME, url: hubUrl },
    ]),
  ]

  return (
    <>
      <JsonLd data={jsonLdPayload} />
      <section className="bg-bg-default">
        <div className="mx-auto max-w-container px-4 pb-12 pt-32 sm:px-6 lg:px-10">
          <Breadcrumbs
            items={[
              { label: t('breadcrumbs.home'), href: `/${locale}` },
              { label: BRAND_NAME },
            ]}
            className="mb-8"
          />
          <div className="flex max-w-3xl flex-col gap-5">
            <Eyebrow>{tBrand('eyebrow')}</Eyebrow>
            <h1 className="font-heading text-h1 text-text-primary">{tBrand('title')}</h1>
            <p className="text-lede text-text-muted">{tBrand('lede')}</p>
          </div>
        </div>
      </section>

      <section className="bg-bg-default">
        <div className="mx-auto max-w-container px-4 pb-20 sm:px-6 lg:px-10">
          <h2 className="font-heading text-h2 text-text-primary">
            {tBrand('modelsTitle')}
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {dongfengTractors.map((record) => (
              <CardTractor
                key={record.frontmatter.slug}
                tractor={record.frontmatter}
                locale={locale}
              />
            ))}
          </div>
        </div>
      </section>

      <FinalCTA locale={locale} source="dongfeng-hub-final" />
    </>
  )
}
