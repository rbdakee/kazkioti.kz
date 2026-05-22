import { z } from 'zod'

export const TractorFrontmatterSchema = z.object({
  slug: z.string(),
  name: z.string(),
  subtitle: z.string(),
  powerClass: z.enum(['40', '90', '100', '120', '140', '210']),

  power: z.number(),
  driveType: z.string(),
  transmission: z.string(),
  fuelTank: z.number(),
  weight: z.number(),
  wheelbase: z.number().optional(),

  engineModel: z.string(),
  engineCylinders: z.number(),
  engineDisplacement: z.number(),
  engineEcoClass: z.string(),
  fuelType: z.string(),

  transmissionType: z.string(),
  pto: z.string(),
  clutch: z.string().optional(),

  lengthMm: z.number(),
  widthMm: z.number(),
  heightMm: z.number(),

  hydraulicPump: z.string().optional(),
  rearLinkage: z.string().optional(),
  brakes: z.string().optional(),

  warrantyYears: z.number().default(1),
  warrantyHours: z.number().default(1000),

  heroImage: z.string(),
  galleryImages: z.array(z.string()).optional(),
  videoUrl: z.string().optional(),
  // Optional per-tractor caption shown under the embedded review video
  // (e.g., "Снято в Караганде"). Falls back to the generic i18n caption.
  videoCaption: z.string().optional(),
  videoLoop: z.string().optional(),

  compatibleAttachments: z.array(z.string()),
  relatedCases: z.array(z.string()).optional(),

  // Pricing in KZT, без НДС. Subsidy is the absolute KZT deduction available
  // under government programmes (АПК); priceWithSubsidy = price - subsidy.
  // All three fields are optional so models without published prices still parse.
  price: z.number().optional(),
  subsidy: z.number().optional(),
  priceWithSubsidy: z.number().optional(),

  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImage: z.string().optional(),

  status: z.enum(['available', 'coming-soon']).default('available'),
})

export type TractorFrontmatter = z.infer<typeof TractorFrontmatterSchema>
