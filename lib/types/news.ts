import { z } from 'zod'

export const NewsFrontmatterSchema = z.object({
  slug: z.string(),
  title: z.string(),
  date: z.string(),
  tag: z.enum(['production', 'delivery', 'partnership', 'lineup']),
  coverImage: z.string(),
  excerpt: z.string(),
  readingMinutes: z.number().optional(),
  relatedNews: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImage: z.string().optional(),
})

export type NewsFrontmatter = z.infer<typeof NewsFrontmatterSchema>
