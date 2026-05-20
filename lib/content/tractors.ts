import {
  TractorFrontmatterSchema,
  type TractorFrontmatter,
} from '@/lib/types/tractor'
import type { Locale } from '@/lib/i18n/routing'
import { listMdx, readMdx } from './fs'

export interface TractorRecord {
  frontmatter: TractorFrontmatter
  body: string
}

export async function getAllTractors(locale: Locale): Promise<TractorRecord[]> {
  const files = await listMdx('tractors', locale)
  const records = await Promise.all(
    files.map((file) =>
      readMdx('tractors', file, (data) => TractorFrontmatterSchema.parse(data)),
    ),
  )
  return records
    .map(({ frontmatter, body }) => ({ frontmatter, body }))
    .sort((a, b) => a.frontmatter.power - b.frontmatter.power)
}

export async function getTractor(slug: string, locale: Locale): Promise<TractorRecord | null> {
  const filename = `${slug}.${locale}.mdx`
  try {
    const { frontmatter, body } = await readMdx('tractors', filename, (data) =>
      TractorFrontmatterSchema.parse(data),
    )
    return { frontmatter, body }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
}
