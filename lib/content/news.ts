import { NewsFrontmatterSchema, type NewsFrontmatter } from '@/lib/types/news'
import type { Locale } from '@/lib/i18n/routing'
import { listMdx, readMdx } from './fs'

export interface NewsRecord {
  frontmatter: NewsFrontmatter
  body: string
}

export async function getAllNews(locale: Locale, limit?: number): Promise<NewsRecord[]> {
  const files = await listMdx('news', locale)
  const records = await Promise.all(
    files.map((file) => readMdx('news', file, (data) => NewsFrontmatterSchema.parse(data))),
  )
  const sorted = records
    .map(({ frontmatter, body }) => ({ frontmatter, body }))
    .sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date))
  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted
}

export async function getNews(slug: string, locale: Locale): Promise<NewsRecord | null> {
  const files = await listMdx('news', locale)
  const records = await Promise.all(
    files.map((file) => readMdx('news', file, (data) => NewsFrontmatterSchema.parse(data))),
  )
  const match = records.find((r) => r.frontmatter.slug === slug)
  if (!match) return null
  return { frontmatter: match.frontmatter, body: match.body }
}
