import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import { localizedAlternates } from '@/lib/seo/alternates'
import { getAllNews } from '@/lib/content/news'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { NewsFilter } from '@/components/sections/NewsFilter'
import { FinalCTA } from '@/components/sections/FinalCTA'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta.news' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: localizedAlternates('/news', locale),
  }
}

export default async function NewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ page?: string }>
}) {
  const { locale } = await params
  const { page } = await searchParams
  setRequestLocale(locale)

  const t = await getTranslations({ locale })
  const tNews = await getTranslations({ locale, namespace: 'news' })

  const records = await getAllNews(locale)
  const articles = records.map((record) => record.frontmatter)

  const parsedPage = page ? Number.parseInt(page, 10) : 1
  const initialPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1

  return (
    <>
      <div className="mx-auto max-w-container px-4 pt-24 sm:px-6 lg:px-10">
        <Breadcrumbs
          items={[
            { label: t('breadcrumbs.home'), href: `/${locale}` },
            { label: t('breadcrumbs.news') },
          ]}
        />
      </div>
      <section className="bg-bg-default">
        <div className="mx-auto max-w-container px-4 py-16 sm:px-6 lg:px-10">
          <div className="flex max-w-3xl flex-col gap-4">
            <Eyebrow>{tNews('heroEyebrow')}</Eyebrow>
            <h1 className="font-heading text-h1 text-text-primary">{tNews('h1')}</h1>
            <p className="text-lede text-text-muted">{tNews('lede')}</p>
          </div>
          <div className="mt-12">
            <NewsFilter
              articles={articles}
              locale={locale}
              basePath={`/${locale}/news`}
              initialPage={initialPage}
              labels={{
                all: tNews('tagAll'),
                production: tNews('tagProduction'),
                delivery: tNews('tagDelivery'),
                partnership: tNews('tagPartnership'),
                lineup: tNews('tagLineup'),
                empty: tNews('emptyState'),
                filterLabel: tNews('filterLabel'),
              }}
              tagLabels={{
                production: tNews('tagProduction'),
                delivery: tNews('tagDelivery'),
                partnership: tNews('tagPartnership'),
                lineup: tNews('tagLineup'),
              }}
            />
          </div>
        </div>
      </section>
      <FinalCTA locale={locale} source="news-list-final" />
    </>
  )
}
