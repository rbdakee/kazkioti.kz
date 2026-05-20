import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { DealersMap, type DealerPoint } from '@/components/ui/Map/DealersMap'
import { PartsRequestForm } from '@/components/forms/PartsRequestForm'
import { FinalCTA } from '@/components/sections/FinalCTA'
import { DEALERS } from '@/lib/data/dealers'
import { COMPANY_PHONE_HUMAN, COMPANY_PHONE_TEL } from '@/lib/constants'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta.parts' })
  return { title: t('title'), description: t('description') }
}

function dealerToMapPoint(dealer: (typeof DEALERS)[number]): DealerPoint {
  const type: DealerPoint['type'] = dealer.id === 'badam' ? 'factory' : dealer.service ? 'service' : 'dealer'
  return {
    id: dealer.id,
    city: dealer.name,
    type,
    cx: dealer.cx,
    cy: dealer.cy,
    address: dealer.address,
    phone: dealer.phone,
    hours: dealer.hours,
  }
}

export default async function PartsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'parts' })
  const tCrumbs = await getTranslations({ locale, namespace: 'breadcrumbs' })
  const tNav = await getTranslations({ locale, namespace: 'nav' })
  const tCommon = await getTranslations({ locale, namespace: 'common' })
  const tUnits = await getTranslations({ locale, namespace: 'units' })

  const servicePoints = DEALERS.filter((dealer) => dealer.service || dealer.id === 'badam').map(
    dealerToMapPoint,
  )

  const services = [
    { num: '01', title: t('item1Title'), body: t('item1Body') },
    { num: '02', title: t('item2Title'), body: t('item2Body') },
    { num: '03', title: t('item3Title'), body: t('item3Body') },
    { num: '04', title: t('item4Title'), body: t('item4Body') },
  ] as const

  const metrics = [
    { value: '90%', label: t('metricStock') },
    { value: '24/7', label: t('metricSupport') },
    { value: '1–3', label: t('metricDelivery') },
    { value: `90 ${tUnits('km')}`, label: t('metricDistance') },
  ] as const

  return (
    <>
      <section className="border-b border-border bg-bg-default">
        <div className="mx-auto max-w-container px-4 pb-16 pt-24 sm:px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <div className="flex flex-col gap-6">
              <Breadcrumbs
                items={[
                  { label: tCrumbs('home'), href: `/${locale}` },
                  { label: tNav('parts') },
                ]}
              />
              <Eyebrow>{t('eyebrow')}</Eyebrow>
              <h1 className="max-w-[14ch] font-heading text-display text-text-primary">
                {t('h1')}
              </h1>
              <p className="max-w-2xl text-lede text-text-muted">{t('lede')}</p>
              <div className="mt-2 flex flex-wrap gap-3">
                <Button asLink href="#order" variant="primary" size="lg">
                  {t('requestService')} →
                </Button>
                <Button asLink href={`tel:${COMPANY_PHONE_TEL}`} variant="secondary" size="lg">
                  {COMPANY_PHONE_HUMAN}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 rounded-lg border border-border bg-bg-soft p-6 sm:p-7">
              {metrics.map((metric) => (
                <div key={metric.label} className="flex flex-col gap-2">
                  <span className="font-heading text-h2 leading-none text-text-primary">
                    {metric.value}
                  </span>
                  <span className="font-mono text-mono-label uppercase tracking-widest text-text-muted">
                    {metric.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bg-soft">
        <div className="mx-auto flex max-w-container flex-col gap-10 px-4 py-16 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-mono-label uppercase tracking-widest text-text-muted">
              <span className="text-brand-red">01</span> · {t('whatWeDo')}
            </span>
            <h2 className="max-w-2xl font-heading text-h2 text-text-primary">
              {t('whatWeDoTitle')}
            </h2>
          </div>
          <Reveal
            stagger
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {services.map((service) => (
              <div
                key={service.num}
                className="flex flex-col gap-3 border-t-2 border-text-primary pt-5"
              >
                <span className="font-mono text-mono-label uppercase tracking-widest text-text-faint">
                  {service.num}
                </span>
                <h3 className="font-heading text-h3 leading-tight text-text-primary">
                  {service.title}
                </h3>
                <p className="text-body-s text-text-muted">{service.body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section id="order" className="scroll-mt-20 bg-bg-default">
        <div className="mx-auto max-w-container px-4 py-16 sm:px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div className="flex flex-col gap-4">
              <span className="font-mono text-mono-label uppercase tracking-widest text-text-muted">
                <span className="text-brand-red">02</span> · {t('requestService')}
              </span>
              <h2 className="max-w-[18ch] font-heading text-h2 text-text-primary">
                {t('formTitle')}
              </h2>
              <p className="max-w-xl text-lede text-text-muted">{t('formLede')}</p>
            </div>
            <div className="rounded-lg border border-border bg-bg-default p-7 shadow-form">
              <PartsRequestForm locale={locale} />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bg-soft">
        <div className="mx-auto max-w-container px-4 py-16 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <span className="font-mono text-mono-label uppercase tracking-widest text-text-muted">
                <span className="text-brand-red">03</span> · {t('serviceMapTitle')}
              </span>
              <h2 className="max-w-2xl font-heading text-h2 text-text-primary">
                {t('serviceMapTitle')}
              </h2>
              <p className="max-w-2xl text-lede text-text-muted">{t('serviceMapLede')}</p>
            </div>
            <div className="rounded-lg border border-border bg-bg-default p-6">
              <DealersMap
                dealers={servicePoints}
                variant="service"
                interactive={false}
              />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <ul className="flex flex-wrap gap-4 font-mono text-mono-label uppercase tracking-widest text-text-muted">
                  <li className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-brand-red" aria-hidden="true" />
                    {tNav('parts')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-brand-blue" aria-hidden="true" />
                    {t('serviceMapTitle')}
                  </li>
                </ul>
                <Button asLink href={`/${locale}/dealers`} variant="secondary" size="md">
                  {tCommon('openMap')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bg-default">
        <div className="mx-auto max-w-container px-4 py-12 sm:px-6 lg:px-10">
          <div className="flex flex-col items-start gap-4 rounded-md border border-border bg-bg-soft p-6 md:flex-row md:items-center md:justify-between">
            <p className="text-body-m text-text-muted">
              {t('callPrompt')}{' '}
              <a
                className="font-mono font-medium text-text-primary hover:text-brand-red"
                href={`tel:${COMPANY_PHONE_TEL}`}
              >
                {COMPANY_PHONE_HUMAN}
              </a>
            </p>
            <Button asLink href={`tel:${COMPANY_PHONE_TEL}`} variant="primary" size="md">
              {t('callButton')}
            </Button>
          </div>
        </div>
      </section>

      <FinalCTA locale={locale} source="parts-final" />
    </>
  )
}
