import { z } from 'zod'

export const AttachmentFrontmatterSchema = z.object({
  slug: z.string(),
  name: z.string(),
  category: z.enum(['seeding', 'tillage', 'mowing', 'extra']),
  compatibleModels: z.array(z.string()),
  heroImage: z.string(),
  specs: z.record(z.string()).optional(),
  metaTitle: z.string().optional(),
})

export type AttachmentFrontmatter = z.infer<typeof AttachmentFrontmatterSchema>
