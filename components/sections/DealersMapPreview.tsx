import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import { Button } from '@/components/ui/Button'
import { DealersMap, type DealerPoint } from '@/components/ui/Map/DealersMap'
import { DEALERS } from '@/lib/data/dealers'

const PREVIEW_POINTS: readonly DealerPoint[] = DEALERS.map((dealer) => ({
  id: dealer.id,
  city: dealer.name,
  type: 'dealer',
  cx: dealer.cx,
  cy: dealer.cy,
}))

export interface DealersMapPreviewProps {
  locale: Locale
}

export async function DealersMapPreview({ locale }: DealersMapPreviewProps) {
  const t = await getTranslations({ locale })
  return (
    <section className="bg-bg-soft">
      <div className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="font-heading text-h2 text-text-primary">{t('dealers.title')}</h2>
            <p className="mt-3 max-w-2xl text-lede text-text-muted">{t('dealers.lede')}</p>
          </div>
          <div className="relative rounded-lg border border-border bg-bg-default p-6">
            <DealersMap dealers={PREVIEW_POINTS} interactive={false} />
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <ul className="flex flex-wrap gap-4 font-mono text-mono-label uppercase tracking-widest text-text-muted">
                <li className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-brand-red" aria-hidden="true" />
                  {t('dealers.typeFactory')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-text-primary" aria-hidden="true" />
                  {t('dealers.typeDealer')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-brand-blue" aria-hidden="true" />
                  {t('dealers.typeService')}
                </li>
              </ul>
              <Button asLink href={`/${locale}/dealers`} variant="primary" size="md">
                {t('common.openMap')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
