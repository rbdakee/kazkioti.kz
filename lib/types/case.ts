import { z } from 'zod'

export const CaseFrontmatterSchema = z.object({
  slug: z.string(),
  title: z.string(),
  farmName: z.string(),
  region: z.string(),
  tractorModel: z.string(),
  coverImage: z.string(),
  date: z.string(),
  hectares: z.number().optional(),
  motorHours: z.number().optional(),
  years: z.number().optional(),
  machineCount: z.number().optional(),
  quote: z.string().optional(),
  quoteAuthor: z.string().optional(),
  galleryImages: z.array(z.string()).optional(),
  videoUrl: z.string().optional(),
  relatedTractors: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

export type CaseFrontmatter = z.infer<typeof CaseFrontmatterSchema>
