import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import { Eyebrow } from '@/components/ui/Eyebrow'

export interface FactorySplitProps {
  locale: Locale
}

export async function FactorySplit({ locale }: FactorySplitProps) {
  const t = await getTranslations({ locale })
  return (
    <section className="bg-bg-default">
      <div className="mx-auto grid max-w-container gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-10">
        <div className="flex flex-col justify-center gap-6">
          <Eyebrow>{t('about.factoryTitle')}</Eyebrow>
          <h2 className="font-heading text-h2 text-text-primary">{t('about.title')}</h2>
          <p className="max-w-xl text-lede text-text-muted">{t('about.lede')}</p>
          <dl className="mt-4 grid grid-cols-3 gap-6 border-t border-border pt-6">
            <Stat value="50%" label={t('about.factoryStats.localization')} />
            <Stat value="2016" label={t('about.factoryStats.founded')} />
            <Stat value="24/7" label={t('about.factoryStats.service')} />
          </dl>
          <Link
            href={`/${locale}/about`}
            className="mt-4 inline-flex w-fit font-mono text-mono-label uppercase tracking-widest text-text-primary underline-offset-4 hover:text-brand-red hover:underline"
          >
            {t('common.learnMore')} →
          </Link>
        </div>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded">
          <Image
            src="/images/factory.jpg"
            alt="KAZKIOTI — завод в с. Бадам"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className="font-mono text-h2 text-text-primary">{value}</dd>
      <p className="mt-1 font-mono text-mono-label uppercase tracking-widest text-text-muted">
        {label}
      </p>
    </div>
  )
}
