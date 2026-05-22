import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import { localizedAlternates } from '@/lib/seo/alternates'
import { breadcrumbListJsonLd } from '@/lib/seo/jsonLd'
import {
  COMPANY_PHONE_HUMAN,
  COMPANY_PHONE_TEL,
  COMPANY_EMAIL,
  SITE_URL,
  SOCIAL_LINKS,
  whatsappUrl,
} from '@/lib/constants'
import { JsonLd } from '@/components/seo/JsonLd'
import { DEALERS } from '@/lib/data/dealers'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { LeadForm } from '@/components/forms/LeadForm'
import { ContactsMap } from '@/components/sections/ContactsMap'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta.contacts' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: localizedAlternates('/contacts', locale),
  }
}

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [tBc, t] = await Promise.all([
    getTranslations({ locale, namespace: 'breadcrumbs' }),
    getTranslations({ locale, namespace: 'contacts' }),
  ])

  const dealerCount = DEALERS.filter((d) => d.dealer).length
  const serviceCount = DEALERS.filter((d) => d.service).length
  const factoryCount = DEALERS.filter((d) => d.id === 'badam').length

  const contactCards = [
    {
      label: t('phoneLabel'),
      value: COMPANY_PHONE_HUMAN,
      desc: t('phoneDesc'),
      href: `tel:${COMPANY_PHONE_TEL}`,
      highlight: true,
    },
    {
      label: t('emailLabel'),
      value: COMPANY_EMAIL,
      desc: t('emailDesc'),
      href: `mailto:${COMPANY_EMAIL}`,
      highlight: false,
    },
    {
      label: t('whatsappLabel'),
      value: 'WhatsApp',
      desc: t('messengerDesc'),
      href: whatsappUrl(locale),
      highlight: false,
    },
    {
      label: t('dealersLabel'),
      value: String(dealerCount + serviceCount + factoryCount),
      desc: t('dealersDesc'),
      href: `/${locale}/dealers`,
      highlight: false,
    },
  ]

  const requisites = [
    { label: t('requisitesLegalName'), value: t('requisitesLegalNameValue') },
    { label: t('requisitesBin'), value: t('requisitesBinValue') },
    { label: t('requisitesAddress'), value: t('requisitesAddressValue') },
    { label: t('requisitesBank'), value: t('requisitesBankValue') },
  ]

  const breadcrumbs = breadcrumbListJsonLd([
    { name: tBc('home'), url: `${SITE_URL}/${locale}` },
    { name: tBc('contacts'), url: `${SITE_URL}/${locale}/contacts` },
  ])

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <div className="mx-auto max-w-container px-4 pt-8 sm:px-6 lg:px-10">
        <Breadcrumbs
          items={[
            { label: tBc('home'), href: `/${locale}` },
            { label: tBc('contacts') },
          ]}
        />
      </div>

      <section className="mx-auto max-w-container px-4 pb-16 pt-10 sm:px-6 lg:px-10">
        <Eyebrow>{t('heroEyebrow')}</Eyebrow>
        <h1 className="mt-4 max-w-[18ch] font-heading text-h1 text-text-primary">{t('h1')}</h1>
        <p className="mt-5 max-w-[60ch] text-lede text-text-muted">{t('lede')}</p>
      </section>

      <section className="py-6">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {contactCards.map(({ label, value, desc, href, highlight }) => (
              <li key={label}>
                <a
                  href={href}
                  className={`group flex flex-col gap-2 rounded-md border p-6 transition-transform duration-fast hover:-translate-y-0.5 ${
                    highlight
                      ? 'border-text-primary bg-text-primary text-white'
                      : 'border-border bg-bg-default hover:border-border-strong'
                  }`}
                >
                  <span
                    className={`font-mono text-mono-label uppercase tracking-widest ${
                      highlight ? 'text-white/50' : 'text-text-muted'
                    }`}
                  >
                    {label}
                  </span>
                  <span
                    className={`font-mono text-[18px] font-medium leading-tight ${
                      highlight ? 'text-white' : 'text-text-primary'
                    }`}
                  >
                    {value}
                  </span>
                  <span
                    className={`text-body-s ${highlight ? 'text-white/65' : 'text-text-muted'}`}
                  >
                    {desc}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-bg-muted py-16">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="flex flex-col gap-4 rounded-lg border border-border bg-bg-default p-5">
              <div className="flex items-center justify-between font-mono text-mono-label uppercase tracking-widest text-text-muted">
                <span>{t('mapLabel')}</span>
                <span className="text-text-faint">{t('mapCoords')}</span>
              </div>
              <ContactsMap dealers={DEALERS} />
              <div className="flex flex-wrap items-start justify-between gap-4 border-t border-border pt-4">
                <div>
                  <p className="font-mono text-mono-label uppercase tracking-widest text-text-muted">
                    {t('factoryTitle')}
                  </p>
                  <p className="mt-1 font-heading text-h3 font-semibold text-text-primary">
                    {t('mapAddress')}
                  </p>
                </div>
                <a
                  href="https://2gis.kz/shymkent/search/KAZKIOTI"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center rounded-pill border border-border-strong px-4 py-2 font-mono text-mono-label uppercase tracking-widest hover:border-text-primary"
                >
                  {t('mapRouteButton')}
                </a>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-bg-default p-8 shadow-form">
              <Eyebrow>{t('formEyebrow')}</Eyebrow>
              <h2 className="mt-3 mb-6 font-heading text-h2 text-text-primary">{t('formTitle')}</h2>
              <LeadForm locale={locale} source="contacts-page" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
          <Eyebrow>{t('requisitesTitle')}</Eyebrow>
          <div className="mt-6 overflow-hidden rounded border border-border bg-bg-default">
            <dl className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
              {requisites.map(({ label, value }, index) => (
                <div
                  key={label}
                  className={`flex flex-col gap-2 p-5 ${
                    index < requisites.length - 1
                      ? 'border-b border-border sm:border-b-0 sm:border-r'
                      : ''
                  }`}
                >
                  <dt className="font-mono text-mono-label uppercase tracking-widest text-text-muted">
                    {label}
                  </dt>
                  <dd className="text-body-m leading-snug text-text-primary">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-12 flex flex-col gap-4">
            <Eyebrow>{t('socialTitle')}</Eyebrow>
            <div className="flex flex-wrap gap-4">
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-pill border border-border-strong px-5 py-2.5 font-mono text-mono-label uppercase tracking-widest hover:border-text-primary"
              >
                <InstagramIcon />
                {t('socialInstagram')}
              </a>
              <a
                href={whatsappUrl(locale)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-pill border border-border-strong px-5 py-2.5 font-mono text-mono-label uppercase tracking-widest hover:border-text-primary"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-4 w-4"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

