import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { VideoPlayer } from '@/components/ui/VideoPlayer'

export interface HeroProps {
  locale: Locale
}

export async function Hero({ locale }: HeroProps) {
  const t = await getTranslations({ locale, namespace: 'hero' })

  return (
    <section className="relative">
      <div className="mx-auto max-w-container px-4 pb-16 pt-12 sm:px-6 lg:px-10 lg:pt-20">
        <div className="flex items-center justify-between font-mono text-mono-label uppercase tracking-widest text-text-muted">
          <span>{t('location')}</span>
        </div>
        <div className="mt-10 flex max-w-4xl flex-col gap-6">
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <h1 className="font-heading text-display text-text-primary">{t('h1')}</h1>
          <p className="max-w-2xl text-lede text-text-muted">{t('lede')}</p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Button asLink href={`/${locale}/tractors`} variant="primary" size="lg">
              {t('ctaCatalog')}
            </Button>
            <Button asLink href={`/${locale}/contacts`} variant="secondary" size="lg">
              {t('ctaContact')}
            </Button>
          </div>
        </div>
        <div className="mt-12 overflow-hidden rounded-lg shadow-hero-media">
          <VideoPlayer
            type="loop"
            src="/videos/hero-loop.mp4"
            poster="/posters/hero-loop.jpg"
            alt="KAZKIOTI tractor at work"
            aspectRatio="21 / 9"
          />
        </div>
        <div className="mt-10 grid grid-cols-2 gap-6 border-t border-border pt-8 sm:grid-cols-3">
          <Metric value="10" label={t('metricYears')} />
          <Metric value="6" label={t('metricModels')} />
          <Metric value="30%" label={t('metricSubsidy')} />
        </div>
      </div>
    </section>
  )
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-mono text-h2 text-text-primary">{value}</p>
      <p className="mt-2 font-mono text-mono-label uppercase tracking-widest text-text-muted">
        {label}
      </p>
    </div>
  )
}
