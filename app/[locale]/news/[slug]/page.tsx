import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import { routing } from '@/lib/i18n/routing'
import { getAllNews, getNews } from '@/lib/content/news'
import type { NewsFrontmatter } from '@/lib/types/news'
import { SITE_URL } from '@/lib/constants'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { CardNews } from '@/components/ui/Card/CardNews'
import { ArticleToc } from '@/components/sections/ArticleToc'
import { ArticleShareRow } from '@/components/sections/ArticleShareRow'
import { FinalCTA } from '@/components/sections/FinalCTA'
import { buildNewsArticleComponents } from '@/components/mdx/article'
import { extractToc } from '@/lib/utils/mdxToc'

const TAG_KEY: Record<NewsFrontmatter['tag'], 'tagProduction' | 'tagDelivery' | 'tagPartnership' | 'tagLineup'> = {
  production: 'tagProduction',
  delivery: 'tagDelivery',
  partnership: 'tagPartnership',
  lineup: 'tagLineup',
}

export async function generateStaticParams() {
  const params: Array<{ locale: Locale; slug: string }> = []
  for (const locale of routing.locales) {
    const records = await getAllNews(locale)
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
  const article = await getNews(slug, locale)
  if (!article) return {}
  const fm = article.frontmatter
  const title = fm.metaTitle ?? fm.title
  const description = fm.metaDescription ?? fm.excerpt
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

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const article = await getNews(slug, locale)
  if (!article) notFound()

  const fm = article.frontmatter
  const t = await getTranslations({ locale })
  const tNews = await getTranslations({ locale, namespace: 'news' })

  const toc = extractToc(article.body)

  const allRecords = await getAllNews(locale)
  const others = allRecords
    .map((record) => record.frontmatter)
    .filter((item) => item.slug !== fm.slug)
  const sameTag = others.filter((item) => item.tag === fm.tag)
  const related = [...sameTag, ...others.filter((item) => item.tag !== fm.tag)]
    .filter((item, index, list) => list.findIndex((x) => x.slug === item.slug) === index)
    .slice(0, 3)

  const articleUrl = `${SITE_URL}/${locale}/news/${fm.slug}`
  const tagLabel = tNews(TAG_KEY[fm.tag])

  return (
    <>
      <div className="mx-auto max-w-container px-4 pt-24 sm:px-6 lg:px-10">
        <Breadcrumbs
          items={[
            { label: t('breadcrumbs.home'), href: `/${locale}` },
            { label: t('breadcrumbs.news'), href: `/${locale}/news` },
            { label: fm.title },
          ]}
        />
      </div>

      <section className="bg-bg-default">
        <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-10">
          <div className="flex flex-wrap items-baseline justify-between gap-3 font-mono text-mono-label uppercase tracking-widest text-text-muted">
            <time dateTime={fm.date}>{formatDate(fm.date, locale)}</time>
            <span>
              {tagLabel}
              {typeof fm.readingMinutes === 'number'
                ? ` · ${fm.readingMinutes} ${tNews('minutes')}`
                : null}
            </span>
          </div>
          <h1 className="mt-6 max-w-[24ch] font-heading text-h1 text-text-primary">{fm.title}</h1>
          <p className="mt-6 max-w-[60ch] text-lede text-text-muted">{fm.excerpt}</p>
        </div>
      </section>

      <section className="bg-bg-default">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10">
          <div className="aspect-[21/9] overflow-hidden rounded-md bg-bg-muted">
            {fm.coverImage ? (
              <img
                src={fm.coverImage}
                alt={fm.title}
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
              <MDXRemote source={article.body} components={buildNewsArticleComponents()} />
              <ArticleShareRow
                url={articleUrl}
                title={fm.title}
                labels={{
                  share: tNews('share'),
                  linkedin: tNews('shareLinkedin'),
                  whatsapp: tNews('shareWhatsapp'),
                  telegram: tNews('shareTelegram'),
                  copy: tNews('shareCopy'),
                  copied: tNews('shareCopied'),
                }}
                className="mt-8"
              />
              <Link
                href={`/${locale}/news`}
                className="mt-6 font-mono text-mono-label uppercase tracking-widest text-text-primary hover:text-brand-red"
              >
                {tNews('backToList')}
              </Link>
            </article>
            {toc.length > 0 ? (
              <aside className="hidden lg:block">
                <div className="sticky transition-[top] duration-250 ease-out" style={{ top: 'calc(var(--header-offset, 58px) + 24px)' }}>
                  <ArticleToc
                    entries={toc}
                    title={tNews('tocTitle')}
                    ariaLabel={tNews('tocAriaLabel')}
                  />
                </div>
              </aside>
            ) : null}
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="bg-bg-soft">
          <div className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-10">
            <div className="flex max-w-3xl flex-col gap-3">
              <Eyebrow>02 · {tNews('related')}</Eyebrow>
              <h2 className="font-heading text-h2 text-text-primary">{tNews('relatedTitle')}</h2>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {related.map((item) => (
                <CardNews
                  key={item.slug}
                  article={item}
                  locale={locale}
                  tagLabel={tNews(TAG_KEY[item.tag])}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <FinalCTA locale={locale} source={`news-${fm.slug}-final`} />
    </>
  )
}
