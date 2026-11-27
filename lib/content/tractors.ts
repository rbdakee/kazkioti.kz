import { fetchCollection, type PublicEntry } from '@/lib/cms/client'
import type { Locale } from '@/lib/i18n/routing'
import { TractorFrontmatterSchema, type TractorFrontmatter } from '@/lib/types/tractor'
import { pickLocale, type TractorDoc } from '@/shared/content'

export interface TractorRecord {
  frontmatter: TractorFrontmatter
  body: string
}

function toRecord({ slug, data }: PublicEntry<TractorDoc>, locale: Locale): TractorRecord {
  const { description, subtitle, transmissionType, pto, clutch, rearLinkage, brakes, videoCaption, metaTitle, metaDescription, ...shared } = data
  const frontmatter = TractorFrontmatterSchema.parse({
    ...shared,
    slug,
    subtitle: pickLocale(subtitle, locale),
    transmissionType: pickLocale(transmissionType, locale),
    pto: pickLocale(pto, locale),
    clutch: pickLocale(clutch, locale),
    rearLinkage: pickLocale(rearLinkage, locale),
    brakes: pickLocale(brakes, locale),
    videoCaption: pickLocale(videoCaption, locale),
    metaTitle: pickLocale(metaTitle, locale),
    metaDescription: pickLocale(metaDescription, locale),
  })
  return { frontmatter, body: pickLocale(description, locale) ?? '' }
}

export async function getAllTractors(locale: Locale): Promise<TractorRecord[]> {
  const entries = await fetchCollection('tractors')
  return entries
    .map((entry) => toRecord(entry, locale))
    .sort((a, b) => a.frontmatter.power - b.frontmatter.power)
}

export async function getTractor(slug: string, locale: Locale): Promise<TractorRecord | null> {
  const entry = (await fetchCollection('tractors')).find((item) => item.slug === slug)
  return entry ? toRecord(entry, locale) : null
}
