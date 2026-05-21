import { NewsFrontmatterSchema, type NewsFrontmatter } from '@/lib/types/news'
import type { Locale } from '@/lib/i18n/routing'
import { listMdx, readMdx } from './fs'

export interface NewsRecord {
  frontmatter: NewsFrontmatter
  body: string
}

export type NewsTag = NewsFrontmatter['tag']

export interface NewsQueryOptions {
  tag?: NewsTag
  limit?: number
}

export async function getAllNews(
  locale: Locale,
  options?: NewsQueryOptions | number,
): Promise<NewsRecord[]> {
  const opts: NewsQueryOptions =
    typeof options === 'number' ? { limit: options } : options ?? {}
  const files = await listMdx('news', locale)
  const records = await Promise.all(
    files.map((file) => readMdx('news', file, (data) => NewsFrontmatterSchema.parse(data))),
  )
  const filtered = opts.tag
    ? records.filter((r) => r.frontmatter.tag === opts.tag)
    : records
  const sorted = filtered
    .map(({ frontmatter, body }) => ({ frontmatter, body }))
    .sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date))
  return typeof opts.limit === 'number' ? sorted.slice(0, opts.limit) : sorted
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
