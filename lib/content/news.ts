import { fetchCollection, type PublicEntry } from '@/lib/cms/client'
import type { Locale } from '@/lib/i18n/routing'
import {
  NewsFrontmatterSchema,
  type NewsArticleBlock,
  type NewsFrontmatter,
} from '@/lib/types/news'
import { createHeadingIdAssigner } from '@/lib/utils/slugifyHeading'
import { pickLocale, type NewsBlock, type NewsDoc } from '@/shared/content'

export interface NewsRecord {
  frontmatter: NewsFrontmatter
  blocks: NewsArticleBlock[]
}

export type NewsTag = NewsFrontmatter['tag']

export interface NewsQueryOptions {
  tag?: NewsTag
  limit?: number
}

const WORDS_PER_MINUTE = 200

function localizeBlocks(blocks: NewsBlock[], locale: Locale): NewsArticleBlock[] {
  const assignId = createHeadingIdAssigner()
  const text = (value: Parameters<typeof pickLocale>[0]) => pickLocale(value, locale) ?? ''
  return blocks.map((block): NewsArticleBlock => {
    switch (block.type) {
      case 'text':
        return { type: 'text', text: text(block.text) }
      case 'heading': {
        const heading = text(block.text)
        return { type: 'heading', text: heading, id: assignId(heading) }
      }
      case 'stats':
        return {
          type: 'stats',
          items: block.items.map((item) => ({ value: text(item.value), label: text(item.label) })),
        }
      case 'quote':
        return { type: 'quote', text: text(block.text), cite: pickLocale(block.cite, locale) }
      case 'image':
        return { type: 'image', src: block.src, caption: pickLocale(block.caption, locale) }
    }
  })
}

function readingMinutes(blocks: NewsArticleBlock[]): number {
  const words = blocks
    .flatMap((block) => ('text' in block ? [block.text] : []))
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

function toRecord({ slug, data }: PublicEntry<NewsDoc>, locale: Locale): NewsRecord {
  const blocks = localizeBlocks(data.body, locale)
  const frontmatter = NewsFrontmatterSchema.parse({
    slug,
    title: pickLocale(data.title, locale),
    date: data.date,
    tag: data.tag,
    coverImage: data.coverImage,
    excerpt: pickLocale(data.excerpt, locale),
    readingMinutes: readingMinutes(blocks),
    relatedNews: data.relatedNews,
    metaTitle: pickLocale(data.metaTitle, locale),
    metaDescription: pickLocale(data.metaDescription, locale),
    ogImage: data.ogImage,
  })
  return { frontmatter, blocks }
}

export async function getAllNews(
  locale: Locale,
  options?: NewsQueryOptions | number,
): Promise<NewsRecord[]> {
  const opts: NewsQueryOptions = typeof options === 'number' ? { limit: options } : options ?? {}
  const records = (await fetchCollection('news'))
    .map((entry) => toRecord(entry, locale))
    .filter((record) => !opts.tag || record.frontmatter.tag === opts.tag)
    .sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date))
  return typeof opts.limit === 'number' ? records.slice(0, opts.limit) : records
}

/** Drafts never reach the site, so any entry here is published. */
export async function hasPublishedNews(): Promise<boolean> {
  return (await fetchCollection('news')).length > 0
}

export async function getNews(slug: string, locale: Locale): Promise<NewsRecord | null> {
  const entry = (await fetchCollection('news')).find((item) => item.slug === slug)
  return entry ? toRecord(entry, locale) : null
}
