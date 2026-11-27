import { fetchCollection, type PublicEntry } from '@/lib/cms/client'
import type { Locale } from '@/lib/i18n/routing'
import { AttachmentFrontmatterSchema, type AttachmentFrontmatter } from '@/lib/types/attachment'
import { pickLocale, type AttachmentDoc } from '@/shared/content'

export interface AttachmentRecord {
  frontmatter: AttachmentFrontmatter
  body: string
}

function toRecord({ slug, data }: PublicEntry<AttachmentDoc>, locale: Locale): AttachmentRecord {
  const { name, description, specs, ...shared } = data
  const localizedSpecs = specs.flatMap(({ key, value }) => {
    const text = pickLocale(value, locale)
    return text ? [[key, text] as const] : []
  })
  const frontmatter = AttachmentFrontmatterSchema.parse({
    ...shared,
    slug,
    name: pickLocale(name, locale),
    specs: Object.fromEntries(localizedSpecs),
  })
  return { frontmatter, body: pickLocale(description, locale) ?? '' }
}

export async function getAllAttachments(locale: Locale): Promise<AttachmentRecord[]> {
  const entries = await fetchCollection('attachments')
  return entries.map((entry) => toRecord(entry, locale))
}
