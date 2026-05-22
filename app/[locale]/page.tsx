import { setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import { localizedAlternates } from '@/lib/seo/alternates'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/jsonLd'
import { JsonLd } from '@/components/seo/JsonLd'
import { Hero } from '@/components/sections/Hero'
import { UTPStripe } from '@/components/sections/UTPStripe'
import { TractorGrid } from '@/components/sections/TractorGrid'
import { FactorySplit } from '@/components/sections/FactorySplit'
import { CompareBanner } from '@/components/sections/CompareBanner'
// News and Cases sections are temporarily hidden until launch content is ready.
// import { CasesGrid } from '@/components/sections/CasesGrid'
// import { NewsGrid } from '@/components/sections/NewsGrid'
import { DealersMapPreview } from '@/components/sections/DealersMapPreview'
import { FinalCTA } from '@/components/sections/FinalCTA'
import { getAllTractors } from '@/lib/content/tractors'
// import { getAllCases } from '@/lib/content/cases'
// import { getAllNews } from '@/lib/content/news'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  return { alternates: localizedAlternates('', locale) }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const tractors = await getAllTractors(locale)

  return (
    <>
      <JsonLd data={[organizationJsonLd(locale), websiteJsonLd(locale)]} />
      <Hero locale={locale} />
      <UTPStripe locale={locale} />
      <TractorGrid
        tractors={tractors.map((record) => record.frontmatter)}
        locale={locale}
        viewAllHref={`/${locale}/tractors`}
      />
      <CompareBanner locale={locale} />
      <FactorySplit locale={locale} />
      {/*
      <CasesGrid cases={cases.map((record) => record.frontmatter)} locale={locale} />
      <NewsGrid articles={news.map((record) => record.frontmatter)} locale={locale} />
      */}
      <DealersMapPreview locale={locale} />
      <FinalCTA locale={locale} source="home-final" />
    </>
  )
}
