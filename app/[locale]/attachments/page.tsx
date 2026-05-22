import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import { localizedAlternates } from '@/lib/seo/alternates'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { AttachmentsCatalog } from '@/components/sections/AttachmentsCatalog'
import { FinalCTA } from '@/components/sections/FinalCTA'
import { getAllAttachments } from '@/lib/content/attachments'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta.attachments' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: localizedAlternates('/attachments', locale),
  }
}

export default async function AttachmentsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'attachments' })
  const tCrumbs = await getTranslations({ locale, namespace: 'breadcrumbs' })

  const records = await getAllAttachments(locale)
  const attachments = records.map((record) => record.frontmatter)

  return (
    <>
      <section className="border-b border-border bg-bg-default">
        <div className="mx-auto flex max-w-container flex-col gap-6 px-4 pb-12 pt-24 sm:px-6 lg:px-10">
          <Breadcrumbs
            items={[
              { label: tCrumbs('home'), href: `/${locale}` },
              { label: tCrumbs('attachments') },
            ]}
          />
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <h1 className="max-w-[18ch] font-heading text-display text-text-primary">
            {t('h1')}
          </h1>
          <p className="max-w-2xl text-lede text-text-muted">{t('lede')}</p>
        </div>
      </section>

      <section className="bg-bg-default">
        <div className="mx-auto max-w-container px-4 py-16 sm:px-6 lg:px-10">
          <AttachmentsCatalog locale={locale} attachments={attachments} />
        </div>
      </section>

      <section className="bg-bg-muted">
        <div className="mx-auto max-w-container px-4 py-16 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-6 rounded-lg border border-border bg-bg-default p-8 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-mono-label uppercase tracking-widest text-text-muted">
                <span className="text-brand-red">05</span>
              </span>
              <h2 className="font-heading text-h3 text-text-primary">{t('bottomCtaTitle')}</h2>
              <p className="max-w-xl text-body-m text-text-muted">{t('bottomCtaBody')}</p>
            </div>
            <Button asLink href={`/${locale}/contacts`} variant="primary" size="lg">
              {t('bottomCtaButton')}
            </Button>
          </div>
        </div>
      </section>

      <FinalCTA locale={locale} source="attachments-final" />
    </>
  )
}
