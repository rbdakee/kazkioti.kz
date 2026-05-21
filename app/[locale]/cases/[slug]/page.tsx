import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import { routing } from '@/lib/i18n/routing'
import { getAllCases, getCase } from '@/lib/content/cases'
import { getTractor } from '@/lib/content/tractors'
import type { TractorFrontmatter } from '@/lib/types/tractor'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { CardTractor } from '@/components/ui/Card/CardTractor'
import { CardCase } from '@/components/ui/Card/CardCase'
import { FinalCTA } from '@/components/sections/FinalCTA'
import { buildCaseArticleComponents } from '@/components/mdx/article'

export async function generateStaticParams() {
  const params: Array<{ locale: Locale; slug: string }> = []
  for (const locale of routing.locales) {
    const records = await getAllCases(locale)
    for (const record of records) {
      params.push({ locale, slug: record.frontmatter.slug })
    }
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  const item = await getCase(slug, locale)
  if (!item) return {}
  const fm = item.frontmatter
  const title = fm.metaTitle ?? fm.title
  const description = fm.metaDescription ?? fm.farmName
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: fm.coverImage ? [fm.coverImage] : [],
    },
  }
}

function formatDate(iso: string, locale: Locale): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat(locale === 'kk' ? 'kk-KZ' : 'ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const item = await getCase(slug, locale)
  if (!item) notFound()

  const fm = item.frontmatter
  const t = await getTranslations({ locale })
  const tCases = await getTranslations({ locale, namespace: 'cases' })

  const relatedSlugs = Array.from(
    new Set<string>([fm.tractorModel, ...(fm.relatedTractors ?? [])]),
  )
  const relatedTractors = (
    await Promise.all(
      relatedSlugs.map(async (modelSlug) => {
        const tractor = await getTractor(modelSlug, locale)
        return tractor?.frontmatter ?? null
      }),
    )
  ).filter((tractor): tractor is TractorFrontmatter => tractor !== null)

  const allCases = await getAllCases(locale)
  const relatedCases = allCases
    .map((record) => record.frontmatter)
    .filter((other) => other.slug !== fm.slug)
    .sort((a, b) => {
      const aMatch = a.tractorModel === fm.tractorModel ? 0 : 1
      const bMatch = b.tractorModel === fm.tractorModel ? 0 : 1
      return aMatch - bMatch
    })
    .slice(0, 3)

  const metaCells: Array<{ label: string; value: string }> = [
    { label: tCases('metaCardFarm'), value: fm.farmName },
    { label: tCases('metaCardRegion'), value: fm.region },
    { label: tCases('metaCardModel'), value: fm.tractorModel.toUpperCase() },
    { label: tCases('metaCardDate'), value: formatDate(fm.date, locale) },
  ]

  return (
    <>
      <div className="mx-auto max-w-container px-4 pt-24 sm:px-6 lg:px-10">
        <Breadcrumbs
          items={[
            { label: t('breadcrumbs.home'), href: `/${locale}` },
            { label: t('breadcrumbs.cases'), href: `/${locale}/cases` },
            { label: fm.farmName },
          ]}
        />
      </div>

      <section className="bg-bg-default">
        <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-10">
          <div className="flex flex-wrap items-baseline justify-between gap-3 font-mono text-mono-label uppercase tracking-widest text-text-muted">
            <span>
              {fm.farmName} · {fm.region}
            </span>
            <span>
              {fm.tractorModel.toUpperCase()}
              {typeof fm.hectares === 'number'
                ? ` · ${new Intl.NumberFormat(locale === 'kk' ? 'kk-KZ' : 'ru-RU').format(fm.hectares)} ${tCases('metricHectares')}`
                : null}
            </span>
          </div>
          <h1 className="mt-6 max-w-[22ch] font-heading text-h1 text-text-primary">{fm.title}</h1>
          {fm.quote ? (
            <p className="mt-6 max-w-[60ch] text-lede text-text-muted">{fm.quote}</p>
          ) : null}
        </div>
      </section>

      <section className="bg-bg-default">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10">
          <div className="aspect-[21/9] overflow-hidden rounded-md bg-bg-muted">
            {fm.coverImage ? (
              <img
                src={fm.coverImage}
                alt={fm.farmName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center font-mono text-mono-label uppercase tracking-widest text-text-faint"
                aria-hidden="true"
              >
                {t('common.placeholderBadge')}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-bg-default">
        <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[1fr_280px]">
            <article className="flex max-w-[72ch] flex-col gap-5">
              <MDXRemote source={item.body} components={buildCaseArticleComponents()} />
              <Link
                href={`/${locale}/cases`}
                className="mt-8 border-t border-border pt-6 font-mono text-mono-label uppercase tracking-widest text-text-primary hover:text-brand-red"
              >
                {tCases('backToList')}
              </Link>
            </article>
            <aside className="hidden lg:block">
              <div className="sticky flex flex-col gap-6 rounded-md border border-border bg-bg-default p-6 transition-[top] duration-250 ease-out" style={{ top: 'calc(var(--header-offset, 58px) + 24px)' }}>
                <p className="font-mono text-mono-label uppercase tracking-widest text-text-muted">
                  {tCases('metaboxTitle')}
                </p>
                <dl className="flex flex-col gap-4">
                  {metaCells.map((cell) => (
                    <div key={cell.label} className="flex flex-col gap-1">
                      <dt className="font-mono text-mono-label uppercase tracking-widest text-text-muted">
                        {cell.label}
                      </dt>
                      <dd className="text-body-m text-text-primary">{cell.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {relatedTractors.length > 0 ? (
        <section className="bg-bg-soft">
          <div className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-10">
            <div className="flex max-w-3xl flex-col gap-3">
              <Eyebrow>02 · {tCases('relatedTractors')}</Eyebrow>
              <h2 className="font-heading text-h2 text-text-primary">{tCases('relatedTractors')}</h2>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedTractors.map((tractor) => (
                <CardTractor key={tractor.slug} tractor={tractor} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {relatedCases.length > 0 ? (
        <section className="bg-bg-default">
          <div className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-10">
            <div className="flex max-w-3xl flex-col gap-3">
              <Eyebrow>03 · {tCases('relatedTitle')}</Eyebrow>
              <h2 className="font-heading text-h2 text-text-primary">{tCases('relatedTitle')}</h2>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedCases.map((other) => (
                <CardCase
                  key={other.slug}
                  caseItem={other}
                  locale={locale}
                  labels={{
                    hectares: tCases('metricHectares'),
                    motorHours: tCases('metricMotorHours'),
                    years: tCases('metricYears'),
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <FinalCTA locale={locale} source={`case-${fm.slug}-final`} />
    </>
  )
}
