import { z } from 'zod'
import {
  localizedText,
  optionalMediaPath,
  optionalNumber,
  russianRequiredText,
  slugList,
} from './fields'

export const ATTACHMENT_CATEGORIES = ['seeding', 'tillage', 'mowing', 'extra'] as const

/** Characteristics the site knows how to label; the admin offers them as a picklist. */
export const ATTACHMENT_SPEC_KEYS = [
  'compatibility', 'workingWidth', 'workingDepth', 'driveType', 'type', 'weight', 'width', 'rows',
  'rowSpacing', 'discs', 'bodies', 'blades', 'rotorSpeed', 'hopperCapacity', 'tankCapacity',
  'bodyVolume', 'boomWidth', 'bucketWidth', 'capacity', 'liftCapacity', 'liftHeight', 'pickupWidth',
  'baleSize', 'baleType', 'pump', 'guidance', 'accuracy', 'tipping',
] as const

export type AttachmentSpecKey = (typeof ATTACHMENT_SPEC_KEYS)[number]

export const AttachmentDocSchema = z.object({
  name: russianRequiredText,
  category: z.enum(ATTACHMENT_CATEGORIES),
  price: optionalNumber,
  subsidy: optionalNumber,
  priceWithSubsidy: optionalNumber,
  heroImage: optionalMediaPath,
  compatibleModels: slugList,
  description: localizedText,
  specs: z
    .array(z.object({ key: z.enum(ATTACHMENT_SPEC_KEYS), value: localizedText }))
    .default([])
    .refine(
      (specs) => new Set(specs.map((spec) => spec.key)).size === specs.length,
      'Each characteristic can be listed once',
    ),
})

export type AttachmentDoc = z.infer<typeof AttachmentDocSchema>
