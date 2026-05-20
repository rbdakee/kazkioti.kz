import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { DealersDirectory } from '@/components/sections/DealersDirectory'
import { FinalCTA } from '@/components/sections/FinalCTA'
import { DEALERS, DEALER_REGIONS } from '@/lib/data/dealers'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta.dealers' })
  return { title: t('title'), description: t('description') }
}

export default async function DealersPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'dealers' })
  const tCrumbs = await getTranslations({ locale, namespace: 'breadcrumbs' })
  const tNav = await getTranslations({ locale, namespace: 'nav' })

  return (
    <>
      <section className="border-b border-border bg-bg-default">
        <div className="mx-auto flex max-w-container flex-col gap-6 px-4 pb-12 pt-24 sm:px-6 lg:px-10">
          <Breadcrumbs
            items={[
              { label: tCrumbs('home'), href: `/${locale}` },
              { label: tNav('dealers') },
            ]}
          />
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <h1 className="max-w-[20ch] font-heading text-display text-text-primary">
            {t('h1')}
          </h1>
          <p className="max-w-2xl text-lede text-text-muted">{t('lede')}</p>
        </div>
      </section>

      <DealersDirectory dealers={DEALERS} regions={DEALER_REGIONS} />

      <section className="bg-bg-default">
        <div className="mx-auto max-w-container px-4 py-16 sm:px-6 lg:px-10">
          <div className="flex flex-col items-start gap-6 rounded-lg border border-text-primary bg-text-primary p-8 text-white md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-mono-label uppercase tracking-widest text-white/60">
                <span className="text-brand-red">02</span> · {t('typeDealer')}
              </span>
              <h2 className="font-heading text-h3 text-white">{t('h1')}</h2>
              <p className="max-w-xl text-body-m text-white/70">{t('lede')}</p>
            </div>
            <Button asLink href={`/${locale}/contacts`} variant="primary" size="lg">
              {t('typeDealer')} →
            </Button>
          </div>
        </div>
      </section>

      <FinalCTA locale={locale} source="dealers-final" />
    </>
  )
}
