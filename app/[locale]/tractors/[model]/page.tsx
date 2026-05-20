import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import { getTractor, getAllTractors } from '@/lib/content/tractors'
import { routing } from '@/lib/i18n/routing'

export async function generateStaticParams() {
  const params: Array<{ locale: Locale; model: string }> = []
  for (const locale of routing.locales) {
    const tractors = await getAllTractors(locale)
    for (const tractor of tractors) {
      params.push({ locale, model: tractor.frontmatter.slug })
    }
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; model: string }>
}) {
  const { locale, model } = await params
  const tractor = await getTractor(model, locale)
  if (!tractor) return {}
  const t = await getTranslations({ locale, namespace: 'meta.tractorDetail' })
  return {
    title: t('title', { model: tractor.frontmatter.name }),
    description: t('description', {
      model: tractor.frontmatter.name,
      power: tractor.frontmatter.power,
    }),
  }
}

export default async function TractorDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; model: string }>
}) {
  const { locale, model } = await params
  setRequestLocale(locale)
  const tractor = await getTractor(model, locale)
  if (!tractor) notFound()

  return (
    <div className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-10">
      <h1 className="font-heading text-h1 text-text-primary">{tractor.frontmatter.name}</h1>
    </div>
  )
}
