import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'

export interface CompareBannerProps {
  locale: Locale
}

export async function CompareBanner({ locale }: CompareBannerProps) {
  const t = await getTranslations({ locale })
  return (
    <section className="bg-bg-default">
      <div className="mx-auto max-w-container px-4 pb-20 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-6 rounded-lg border border-border bg-bg-muted p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3">
            <Eyebrow>{t('breadcrumbs.compare')}</Eyebrow>
            <h2 className="font-heading text-h2 text-text-primary">{t('compare.title')}</h2>
            <p className="max-w-2xl text-lede text-text-muted">{t('compare.lede')}</p>
          </div>
          <Button asLink href={`/${locale}/tractors/compare`} variant="primary" size="lg">
            {t('tractors.compareTrayCta')}
          </Button>
        </div>
      </div>
    </section>
  )
}
