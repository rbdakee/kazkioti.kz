import { z } from 'zod'
import { requiredLocalizedText, requiredNumber } from './fields'

export const FAQ_CATEGORIES = ['warranty', 'leasing', 'delivery', 'docs', 'service'] as const

export const FaqDocSchema = z.object({
  title: requiredLocalizedText,
  category: z.enum(FAQ_CATEGORIES),
  order: requiredNumber,
  items: z
    .array(z.object({ question: requiredLocalizedText, answer: requiredLocalizedText }))
    .default([]),
})

export type FaqDoc = z.infer<typeof FaqDocSchema>
