import type { MetadataRoute } from 'next'
import { routing } from '@/lib/i18n/routing'
import { SITE_URL } from '@/lib/constants'
import { getAllTractors } from '@/lib/content/tractors'
import { getAllCases } from '@/lib/content/cases'
import { getAllNews } from '@/lib/content/news'

const STATIC_ROUTES = [
  '',
  '/tractors',
  '/tractors/compare',
  '/attachments',
  '/parts',
  '/dealers',
  '/cases',
  '/news',
  '/about',
  '/faq',
  '/contacts',
] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []
  for (const locale of routing.locales) {
    for (const route of STATIC_ROUTES) {
      entries.push({
        url: `${SITE_URL}/${locale}${route}`,
        changeFrequency: 'weekly',
        priority: route === '' ? 1 : 0.7,
      })
    }

    const [tractors, cases, news] = await Promise.all([
      getAllTractors(locale),
      getAllCases(locale),
      getAllNews(locale),
    ])

    for (const tractor of tractors) {
      entries.push({
        url: `${SITE_URL}/${locale}/tractors/${tractor.frontmatter.slug}`,
        changeFrequency: 'monthly',
        priority: 0.9,
      })
    }
    for (const item of cases) {
      entries.push({
        url: `${SITE_URL}/${locale}/cases/${item.frontmatter.slug}`,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
    for (const article of news) {
      entries.push({
        url: `${SITE_URL}/${locale}/news/${article.frontmatter.slug}`,
        changeFrequency: 'monthly',
        priority: 0.7,
        lastModified: article.frontmatter.date,
      })
    }
  }
  return entries
}
