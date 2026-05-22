import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import { localizedAlternates } from '@/lib/seo/alternates'
import { getAllTractors } from '@/lib/content/tractors'
import { TractorGrid } from '@/components/sections/TractorGrid'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { FinalCTA } from '@/components/sections/FinalCTA'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta.tractors' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: localizedAlternates('/tractors', locale),
  }
}

export default async function TractorsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'catalog' })
  const tractors = await getAllTractors(locale)

  return (
    <>
      <section className="bg-bg-default">
        <div className="mx-auto max-w-container px-4 pb-12 pt-32 sm:px-6 lg:px-10">
          <div className="flex max-w-3xl flex-col gap-5">
            <Eyebrow>{t('eyebrow')}</Eyebrow>
            <h1 className="font-heading text-h1 text-text-primary">{t('h1')}</h1>
            <p className="text-lede text-text-muted">{t('lede')}</p>
          </div>
        </div>
      </section>
      <TractorGrid
        tractors={tractors.map((record) => record.frontmatter)}
        locale={locale}
        showFilter
        showCompareTray
      />
      <FinalCTA locale={locale} source="catalog-final" />
    </>
  )
}
