import { Suspense } from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import { getAllTractors } from '@/lib/content/tractors'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { CompareTable } from '@/components/sections/CompareTable'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta.compare' })
  return { title: t('title'), description: t('description') }
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'compare' })
  const tractors = await getAllTractors(locale)
  const frontmatters = tractors.map((record) => record.frontmatter)

  return (
    <>
      <section className="bg-bg-default">
        <div className="mx-auto max-w-container px-4 pb-12 pt-32 sm:px-6 lg:px-10">
          <div className="flex max-w-3xl flex-col gap-5">
            <Eyebrow>02 · {t('title')}</Eyebrow>
            <h1 className="font-heading text-display text-text-primary">{t('h1')}</h1>
            <p className="text-lede text-text-muted">{t('lede')}</p>
          </div>
        </div>
      </section>
      <section className="bg-bg-soft">
        <div className="mx-auto max-w-container px-4 py-12 sm:px-6 lg:px-10">
          <Suspense
            fallback={
              <p className="font-mono text-mono-label uppercase tracking-widest text-text-muted">
                {t('loading')}
              </p>
            }
          >
            <CompareTable tractors={frontmatters} locale={locale} />
          </Suspense>
        </div>
      </section>
    </>
  )
}
