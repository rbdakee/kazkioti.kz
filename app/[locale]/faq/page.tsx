import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import { getAllFAQGroups } from '@/lib/content/faq'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { MiniContactForm } from '@/components/forms/MiniContactForm'
import { FAQClient } from '@/components/sections/FAQClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta.faq' })
  return { title: t('title'), description: t('description') }
}

export default async function FAQPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [tBc, tFaq, groups] = await Promise.all([
    getTranslations({ locale, namespace: 'breadcrumbs' }),
    getTranslations({ locale, namespace: 'faq' }),
    getAllFAQGroups(locale),
  ])

  const categoryLabels: Record<string, string> = {
    warranty: tFaq('groupWarranty'),
    leasing: tFaq('groupLeasing'),
    delivery: tFaq('groupDelivery'),
    docs: tFaq('groupDocs'),
    service: tFaq('groupService'),
  }

  return (
    <>
      <div className="mx-auto max-w-container px-4 pt-8 sm:px-6 lg:px-10">
        <Breadcrumbs
          items={[
            { label: tBc('home'), href: `/${locale}` },
            { label: tBc('faq') },
          ]}
        />
      </div>

      <section className="mx-auto max-w-container px-4 pb-16 pt-10 sm:px-6 lg:px-10">
        <Eyebrow>{tFaq('heroEyebrow')}</Eyebrow>
        <h1 className="mt-4 max-w-[20ch] font-heading text-h1 text-text-primary">{tFaq('h1')}</h1>
        <p className="mt-5 max-w-[60ch] text-lede text-text-muted">{tFaq('lede')}</p>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
          <FAQClient groups={groups} categoryLabels={categoryLabels} />
        </div>
      </section>

      <section className="border-t border-border bg-bg-muted py-20">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow>{tFaq('noAnswer')}</Eyebrow>
              <h2 className="mt-4 font-heading text-h2 text-text-primary">{tFaq('askCta')}</h2>
              <p className="mt-3 text-lede text-text-muted">{tFaq('noAnswerLede')}</p>
            </div>
            <div className="rounded-lg border border-border bg-bg-default p-8 shadow-form">
              <MiniContactForm locale={locale} source="faq-page" />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
