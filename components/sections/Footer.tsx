import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import {
  COMPANY_EMAIL,
  COMPANY_PHONE_HUMAN,
  COMPANY_PHONE_TEL,
  SOCIAL_LINKS,
} from '@/lib/constants'

export interface FooterProps {
  locale: Locale
}

export async function Footer({ locale }: FooterProps) {
  const t = await getTranslations({ locale })
  return (
    <footer className="bg-bg-invert text-white">
      <div className="mx-auto grid max-w-container gap-12 px-4 py-16 sm:px-6 lg:grid-cols-5 lg:px-10">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Link href={`/${locale}`} className="flex items-center" aria-label="KAZKIOTI">
            <Image src="/logo.png" alt="KAZKIOTI" width={420} height={96} className="h-8 w-auto" />
          </Link>
          <p className="max-w-sm text-body-m text-white/70">{t('footer.tagline')}</p>
          <div className="flex gap-3">
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="inline-flex h-10 w-10 items-center justify-center rounded-pill border border-white/15 hover:bg-white/10"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
              </svg>
            </a>
            <a
              href={SOCIAL_LINKS.youtube}
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="inline-flex h-10 w-10 items-center justify-center rounded-pill border border-white/15 hover:bg-white/10"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M21.6 7.2a2.4 2.4 0 0 0-1.7-1.7C18.3 5 12 5 12 5s-6.3 0-7.9.5A2.4 2.4 0 0 0 2.4 7.2 25 25 0 0 0 2 12a25 25 0 0 0 .4 4.8 2.4 2.4 0 0 0 1.7 1.7C5.7 19 12 19 12 19s6.3 0 7.9-.5a2.4 2.4 0 0 0 1.7-1.7A25 25 0 0 0 22 12a25 25 0 0 0-.4-4.8zM10 15V9l5 3-5 3z" />
              </svg>
            </a>
          </div>
        </div>
        <FooterColumn title={t('footer.catalogTitle')}>
          <Link href={`/${locale}/tractors`}>{t('nav.tractors')}</Link>
          <Link href={`/${locale}/attachments`}>{t('nav.attachments')}</Link>
          <Link href={`/${locale}/parts`}>{t('nav.parts')}</Link>
          <Link href={`/${locale}/tractors/compare`}>{t('breadcrumbs.compare')}</Link>
        </FooterColumn>
        <FooterColumn title={t('footer.companyTitle')}>
          <Link href={`/${locale}/about`}>{t('nav.about')}</Link>
          {/* News and Cases sections are temporarily disabled until content is ready. */}
          <Link href={`/${locale}/faq`}>{t('nav.faq')}</Link>
        </FooterColumn>
        <FooterColumn title={t('footer.contactsTitle')}>
          <a href={`tel:${COMPANY_PHONE_TEL}`}>{COMPANY_PHONE_HUMAN}</a>
          <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a>
          <Link href={`/${locale}/dealers`}>{t('nav.dealers')}</Link>
          <Link href={`/${locale}/contacts`}>{t('nav.contacts')}</Link>
        </FooterColumn>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-container flex-col gap-3 px-4 py-6 font-mono text-mono-label uppercase tracking-widest text-white/60 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <span>{t('footer.copyright')}</span>
          <Link href={`/${locale}/faq`} className="hover:text-white">
            {t('footer.privacy')}
          </Link>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-mono text-mono-label uppercase tracking-widest text-white/60">{title}</h3>
      <div className="flex flex-col gap-2 text-body-m [&_a:hover]:text-white [&_a]:text-white/85">
        {children}
      </div>
    </div>
  )
}
