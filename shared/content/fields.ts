import { z } from 'zod'

/** Site languages. Kept here so the API and the site agree on them. */
export const LANGUAGES = ['ru', 'kk'] as const
export type Language = (typeof LANGUAGES)[number]

/** Empty form inputs arrive as '' — store them as absent. */
export const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))

export const requiredText = z.string().trim().min(1)

export const optionalNumber = z.number().finite().nonnegative().optional()

export const requiredNumber = z.number().finite().nonnegative()

/** One text in both languages, edited side by side in the admin. */
export const localizedText = z
  .object({ ru: optionalText, kk: optionalText })
  .default({})

export const requiredLocalizedText = z.object({ ru: requiredText, kk: requiredText })

/** Russian is mandatory, Kazakh falls back to Russian on the site when empty. */
export const russianRequiredText = z.object({ ru: requiredText, kk: optionalText })

export type LocalizedText = z.infer<typeof localizedText>

/** Path of an uploaded file (`/uploads/...`) or a bundled site asset (`/images/...`). */
export const mediaPath = z
  .string()
  .trim()
  .regex(/^\/(uploads|images)\/[\w\-./]+$/, 'Invalid media path')
  .refine((value) => !value.includes('..'), 'Invalid media path')

export const optionalMediaPath = z
  .union([mediaPath, z.literal('')])
  .optional()
  .transform((value) => (value ? value : undefined))

/** Path of an uploaded PDF (`/uploads/...pdf`) or one bundled with the site (`/docs/...pdf`). */
export const optionalPdfPath = z
  .union([
    z
      .string()
      .trim()
      .regex(/^\/(uploads|docs)\/[\w\-./]+\.pdf$/, 'Expected a PDF file')
      .refine((value) => !value.includes('..'), 'Invalid file path'),
    z.literal(''),
  ])
  .optional()
  .transform((value) => (value ? value : undefined))

export const slugList = z.array(z.string().regex(/^[a-z0-9-]+$/)).default([])

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')
