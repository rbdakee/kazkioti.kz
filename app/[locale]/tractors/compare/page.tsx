import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta.compare' })
  return { title: t('title'), description: t('description') }
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'compare' })
  return (
    <div className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-10">
      <h1 className="font-heading text-h1 text-text-primary">{t('title')}</h1>
    </div>
  )
}
