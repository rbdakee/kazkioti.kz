import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import { getAllCases } from '@/lib/content/cases'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { CasesFilter } from '@/components/sections/CasesFilter'
import { FinalCTA } from '@/components/sections/FinalCTA'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta.cases' })
  return { title: t('title'), description: t('description') }
}

export default async function CasesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale })
  const tCases = await getTranslations({ locale, namespace: 'cases' })

  const records = await getAllCases(locale)
  const cases = records.map((record) => record.frontmatter)

  return (
    <>
      <div className="mx-auto max-w-container px-4 pt-24 sm:px-6 lg:px-10">
        <Breadcrumbs
          items={[
            { label: t('breadcrumbs.home'), href: `/${locale}` },
            { label: t('breadcrumbs.cases') },
          ]}
        />
      </div>
      <section className="bg-bg-default">
        <div className="mx-auto max-w-container px-4 py-16 sm:px-6 lg:px-10">
          <div className="flex max-w-3xl flex-col gap-4">
            <Eyebrow>{tCases('heroEyebrow')}</Eyebrow>
            <h1 className="font-heading text-h1 text-text-primary">{tCases('h1')}</h1>
            <p className="text-lede text-text-muted">{tCases('lede')}</p>
          </div>
          <div className="mt-12">
            <CasesFilter
              cases={cases}
              locale={locale}
              filterNote={tCases('filterNote')}
              filterAllLabel={tCases('filterAll')}
              emptyState={tCases('emptyState')}
              cardLabels={{
                hectares: tCases('metricHectares'),
                motorHours: tCases('metricMotorHours'),
                years: tCases('metricYears'),
              }}
            />
          </div>
        </div>
      </section>
      <FinalCTA locale={locale} source="cases-list-final" />
    </>
  )
}
