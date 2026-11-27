import { z } from 'zod'
import {
  isoDate,
  localizedText,
  mediaPath,
  optionalMediaPath,
  requiredLocalizedText,
  slugList,
} from './fields'

export const NEWS_TAGS = ['production', 'delivery', 'partnership', 'lineup'] as const
export const NEWS_STATUSES = ['draft', 'published'] as const

/**
 * An article body is a list of blocks so editors never deal with markup.
 * `text` blocks accept light Markdown: blank line = new paragraph, **bold**,
 * [link](https://…) and "- " list items.
 */
export const NewsBlockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), text: requiredLocalizedText }),
  z.object({ type: z.literal('heading'), text: requiredLocalizedText }),
  z.object({
    type: z.literal('stats'),
    items: z
      .array(z.object({ value: requiredLocalizedText, label: requiredLocalizedText }))
      .min(1)
      .max(4),
  }),
  z.object({ type: z.literal('quote'), text: requiredLocalizedText, cite: localizedText }),
  z.object({ type: z.literal('image'), src: mediaPath, caption: localizedText }),
])

export type NewsBlock = z.infer<typeof NewsBlockSchema>
export type NewsBlockType = NewsBlock['type']

export const NewsDocSchema = z.object({
  title: requiredLocalizedText,
  status: z.enum(NEWS_STATUSES).default('draft'),
  date: isoDate,
  tag: z.enum(NEWS_TAGS),
  coverImage: optionalMediaPath,
  excerpt: requiredLocalizedText,
  body: z.array(NewsBlockSchema).default([]),
  relatedNews: slugList,
  metaTitle: localizedText,
  metaDescription: localizedText,
  ogImage: optionalMediaPath,
})

export type NewsDoc = z.infer<typeof NewsDocSchema>
