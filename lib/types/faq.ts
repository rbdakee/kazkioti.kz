import { z } from 'zod'

export const FAQGroupSchema = z.object({
  category: z.enum(['warranty', 'leasing', 'delivery', 'docs', 'service']),
  title: z.string(),
  order: z.number(),
})

export type FAQGroup = z.infer<typeof FAQGroupSchema>

export interface FAQItem {
  question: string
  answer: string
}

export interface FAQGroupWithItems {
  group: FAQGroup
  items: FAQItem[]
}
