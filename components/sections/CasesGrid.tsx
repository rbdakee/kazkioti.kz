import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import type { CaseFrontmatter } from '@/lib/types/case'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { CardCase } from '@/components/ui/Card/CardCase'

export interface CasesGridProps {
  cases: readonly CaseFrontmatter[]
  locale: Locale
  showViewAll?: boolean
}

export async function CasesGrid({ cases, locale, showViewAll = true }: CasesGridProps) {
  const t = await getTranslations({ locale })
  return (
    <section className="bg-bg-soft">
      <div className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-10">
        <SectionHeader
          eyebrow={t('cases.title')}
          h2={t('cases.title')}
          lede={t('cases.lede')}
          link={showViewAll ? { label: t('cases.viewAll'), href: `/${locale}/cases` } : undefined}
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cases.map((item) => (
            <CardCase
              key={item.slug}
              caseItem={item}
              locale={locale}
              labels={{
                hectares: t('cases.metricHectares'),
                motorHours: t('cases.metricMotorHours'),
                years: t('cases.metricYears'),
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
