import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { LeadForm } from '@/components/forms/LeadForm'
import { COMPANY_EMAIL, COMPANY_PHONE_HUMAN, COMPANY_PHONE_TEL } from '@/lib/constants'

export interface FinalCTAProps {
  locale: Locale
  defaultModel?: string
  source?: string
}

export async function FinalCTA({ locale, defaultModel, source }: FinalCTAProps) {
  const t = await getTranslations({ locale })
  return (
    <section id="final" className="relative overflow-hidden bg-bg-muted">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-brand-red/5 blur-3xl"
      />
      <div className="mx-auto grid max-w-container gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-10">
        <div className="flex flex-col gap-6">
          <Eyebrow>{t('forms.submit')}</Eyebrow>
          <h2 className="font-heading text-h2 text-text-primary">
            {t('tractors.ctaTitle')}
          </h2>
          <p className="max-w-lg text-lede text-text-muted">{t('contacts.lede')}</p>
          <div className="mt-6 flex flex-col gap-3 border-t border-border pt-6">
            <a
              href={`tel:${COMPANY_PHONE_TEL}`}
              className="font-heading text-h3 text-text-primary hover:text-brand-red"
            >
              {COMPANY_PHONE_HUMAN}
            </a>
            <a
              href={`mailto:${COMPANY_EMAIL}`}
              className="font-mono text-mono-label uppercase tracking-widest text-text-muted hover:text-text-primary"
            >
              {COMPANY_EMAIL}
            </a>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-bg-default p-8 shadow-form">
          <LeadForm locale={locale} defaultModel={defaultModel} source={source ?? 'final-cta'} />
        </div>
      </div>
    </section>
  )
}
