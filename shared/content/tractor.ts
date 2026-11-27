import { z } from 'zod'
import {
  localizedText,
  mediaPath,
  optionalMediaPath,
  optionalNumber,
  optionalText,
  requiredLocalizedText,
  requiredNumber,
  requiredText,
  slugList,
} from './fields'

export const TRACTOR_POWER_CLASSES = ['40', '90', '100', '120', '140', '210'] as const
export const TRACTOR_STATUSES = ['available', 'coming-soon'] as const

export const TractorDocSchema = z.object({
  name: requiredText,
  status: z.enum(TRACTOR_STATUSES).default('available'),
  powerClass: z.enum(TRACTOR_POWER_CLASSES),
  price: optionalNumber,
  subsidy: optionalNumber,
  priceWithSubsidy: optionalNumber,

  heroImage: mediaPath,
  galleryImages: z.array(mediaPath).default([]),
  subtitle: requiredLocalizedText,
  description: localizedText,

  power: requiredNumber,
  driveType: requiredText,
  transmission: requiredText,
  transmissionType: requiredLocalizedText,
  fuelTank: requiredNumber,
  weight: requiredNumber,
  wheelbase: optionalNumber,

  engineModel: requiredText,
  engineCylinders: requiredNumber,
  engineDisplacement: requiredNumber,
  engineEcoClass: requiredText,
  fuelType: requiredText,
  pto: requiredLocalizedText,
  clutch: localizedText,

  lengthMm: requiredNumber,
  widthMm: requiredNumber,
  heightMm: requiredNumber,
  hydraulicPump: optionalText,
  rearLinkage: localizedText,
  brakes: localizedText,

  warrantyYears: requiredNumber.default(1),
  warrantyHours: requiredNumber.default(1000),

  videoUrl: optionalText,
  videoCaption: localizedText,
  videoLoop: optionalText,
  compatibleAttachments: slugList,
  relatedCases: slugList,

  metaTitle: localizedText,
  metaDescription: localizedText,
  ogImage: optionalMediaPath,
})

export type TractorDoc = z.infer<typeof TractorDocSchema>
