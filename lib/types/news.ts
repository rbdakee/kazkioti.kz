import { z } from 'zod'
import { NEWS_TAGS } from '@/shared/content'

export const NewsFrontmatterSchema = z.object({
  slug: z.string(),
  title: z.string(),
  date: z.string(),
  tag: z.enum(NEWS_TAGS),
  coverImage: z.string().optional(),
  excerpt: z.string(),
  readingMinutes: z.number().optional(),
  relatedNews: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImage: z.string().optional(),
})

export type NewsFrontmatter = z.infer<typeof NewsFrontmatterSchema>

/** An article block with texts already resolved to one language. */
export type NewsArticleBlock =
  | { type: 'text'; text: string }
  | { type: 'heading'; text: string; id: string }
  | { type: 'stats'; items: Array<{ value: string; label: string }> }
  | { type: 'quote'; text: string; cite?: string }
  | { type: 'image'; src: string; caption?: string }
