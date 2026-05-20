import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import { getNews } from '@/lib/content/news'

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const item = await getNews(slug, locale)
  if (!item) notFound()
  return (
    <div className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-10">
      <h1 className="font-heading text-h1 text-text-primary">{item.frontmatter.title}</h1>
    </div>
  )
}
