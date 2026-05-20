import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import { Button } from '@/components/ui/Button'
import { DealersMap, type DealerPoint } from '@/components/ui/Map/DealersMap'

const PREVIEW_POINTS: readonly DealerPoint[] = [
  { id: 'factory-badam', city: 'Бадам', type: 'factory', cx: 420, cy: 320 },
  { id: 'aktobe', city: 'Актобе', type: 'dealer', cx: 220, cy: 200 },
  { id: 'uralsk', city: 'Уральск', type: 'dealer', cx: 160, cy: 160 },
  { id: 'kostanay', city: 'Костанай', type: 'dealer', cx: 340, cy: 140 },
  { id: 'astana', city: 'Астана', type: 'dealer', cx: 460, cy: 170 },
  { id: 'karagandy', city: 'Караганда', type: 'service', cx: 520, cy: 220 },
  { id: 'semey', city: 'Семей', type: 'dealer', cx: 640, cy: 180 },
  { id: 'kyzylorda', city: 'Кызылорда', type: 'service', cx: 360, cy: 300 },
  { id: 'almaty', city: 'Алматы', type: 'dealer', cx: 600, cy: 340 },
  { id: 'taraz', city: 'Тараз', type: 'service', cx: 500, cy: 340 },
]

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
