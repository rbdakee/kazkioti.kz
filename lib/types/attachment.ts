import { z } from 'zod'

export const AttachmentFrontmatterSchema = z.object({
  slug: z.string(),
  name: z.string(),
  category: z.enum(['seeding', 'tillage', 'mowing', 'extra']),
  compatibleModels: z.array(z.string()),
  heroImage: z.string(),
  specs: z.record(z.string()).optional(),
  // KZT pricing from the official 2026 price list (без НДС). Subsidy is the
  // absolute deduction under АПК programmes when applicable.
  price: z.number().optional(),
  subsidy: z.number().optional(),
  priceWithSubsidy: z.number().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImage: z.string().optional(),
})

export type AttachmentFrontmatter = z.infer<typeof AttachmentFrontmatterSchema>
