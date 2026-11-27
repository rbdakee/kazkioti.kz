import type { z } from 'zod'
import { AttachmentDocSchema } from './attachment'
import { FaqDocSchema } from './faq'
import { NewsDocSchema } from './news'
import { CompanySchema, DealersSchema } from './settings'
import { TractorDocSchema } from './tractor'

/**
 * Every editable list on the site. `slugSource` names the text the URL is
 * generated from when an entry is created; the slug never changes afterwards.
 */
export const COLLECTIONS = {
  tractors: {
    schema: TractorDocSchema,
    slugSource: (doc: z.infer<typeof TractorDocSchema>) => doc.name,
    isPublic: () => true,
  },
  attachments: {
    schema: AttachmentDocSchema,
    slugSource: (doc: z.infer<typeof AttachmentDocSchema>) => doc.name.ru,
    isPublic: () => true,
  },
  news: {
    schema: NewsDocSchema,
    slugSource: (doc: z.infer<typeof NewsDocSchema>) => doc.title.ru,
    isPublic: (doc: z.infer<typeof NewsDocSchema>) => doc.status === 'published',
  },
  faq: {
    schema: FaqDocSchema,
    slugSource: (doc: z.infer<typeof FaqDocSchema>) => doc.category,
    isPublic: () => true,
  },
} as const

export type CollectionName = keyof typeof COLLECTIONS
export const COLLECTION_NAMES = Object.keys(COLLECTIONS) as CollectionName[]

export type CollectionDoc<C extends CollectionName> = z.infer<(typeof COLLECTIONS)[C]['schema']>

/** Single-record settings edited as one form. */
export const SETTINGS = {
  company: CompanySchema,
  dealers: DealersSchema,
} as const

export type SettingsKey = keyof typeof SETTINGS
export const SETTINGS_KEYS = Object.keys(SETTINGS) as SettingsKey[]
export type SettingsValue<K extends SettingsKey> = z.infer<(typeof SETTINGS)[K]>

/** Cache tag used by the site for a collection or settings record. */
export function cacheTag(name: CollectionName | SettingsKey): string {
  return `cms:${name}`
}

/** A stored entry as returned by the API. */
export interface StoredEntry<T> {
  slug: string
  data: T
  /** Increases on every save; sent back to detect concurrent edits. */
  version: number
  updatedAt: string
  updatedBy: string | null
}

export * from './attachment'
export * from './faq'
export * from './fields'
export * from './news'
export * from './settings'
export * from './tractor'
export * from './localize'
