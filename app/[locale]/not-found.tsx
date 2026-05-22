import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'notFound' })
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: { index: false, follow: true },
  }
}

export default async function NotFound() {
  const tCommon = await getTranslations('common')
  const tNotFound = await getTranslations('notFound')
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-container flex-col items-center justify-center gap-6 px-4 text-center sm:px-6 lg:px-10">
      <p className="font-mono text-mono-label uppercase tracking-widest text-text-muted">404</p>
      <h1 className="font-heading text-h1 text-text-primary">{tNotFound('title')}</h1>
      <Link
        href="/"
        className="rounded-pill bg-brand-red px-5 py-3 font-medium text-white hover:bg-brand-red-hover"
      >
        {tCommon('backToList')}
      </Link>
    </div>
  )
}
