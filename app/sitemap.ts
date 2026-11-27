import type { MetadataRoute } from 'next'
import { routing } from '@/lib/i18n/routing'
import { SITE_URL } from '@/lib/constants'
import { HREFLANG_BY_LOCALE } from '@/lib/seo/alternates'
import { getAllTractors } from '@/lib/content/tractors'
import { getAllNews } from '@/lib/content/news'

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>

interface RouteMeta {
  path: string
  priority: number
  changeFrequency: ChangeFrequency
}

// Cases are intentionally omitted — the section is temporarily hidden. News is
// listed only while something is published (drafts never reach the site). The /attachments detail pages do not exist (no
// `[slug]/page.tsx`), so individual attachment URLs are excluded as well.
const STATIC_ROUTES: readonly RouteMeta[] = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/tractors', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/tractors/compare', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/dongfeng', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/wuzheng', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/attachments', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/parts', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/dealers', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/contacts', priority: 0.5, changeFrequency: 'monthly' },
] as const

function buildEntry(
  path: string,
  lastModified: Date,
  changeFrequency: ChangeFrequency,
  priority: number,
): MetadataRoute.Sitemap[number] {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [HREFLANG_BY_LOCALE[locale], `${SITE_URL}/${locale}${path}`]),
  ) as Record<(typeof HREFLANG_BY_LOCALE)[(typeof routing.locales)[number]], string>

  return {
    url: `${SITE_URL}/${routing.defaultLocale}${path}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages },
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BUILD_DATE = new Date()

  const [tractors, news] = await Promise.all([
    getAllTractors(routing.defaultLocale),
    getAllNews(routing.defaultLocale),
  ])

  const staticEntries = STATIC_ROUTES.map((route) =>
    buildEntry(route.path, BUILD_DATE, route.changeFrequency, route.priority),
  )

  const tractorEntries = tractors.map((tractor) =>
    buildEntry(`/tractors/${tractor.frontmatter.slug}`, BUILD_DATE, 'monthly', 0.9),
  )

  const newsEntries =
    news.length > 0
      ? [
          buildEntry('/news', BUILD_DATE, 'weekly', 0.6),
          ...news.map((article) =>
            buildEntry(`/news/${article.frontmatter.slug}`, new Date(article.frontmatter.date), 'yearly', 0.5),
          ),
        ]
      : []

  return [...staticEntries, ...tractorEntries, ...newsEntries]
}
