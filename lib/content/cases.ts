import { CaseFrontmatterSchema, type CaseFrontmatter } from '@/lib/types/case'
import type { Locale } from '@/lib/i18n/routing'
import { listMdx, readMdx } from './fs'

export interface CaseRecord {
  frontmatter: CaseFrontmatter
  body: string
}

export async function getAllCases(locale: Locale, limit?: number): Promise<CaseRecord[]> {
  const files = await listMdx('cases', locale)
  const records = await Promise.all(
    files.map((file) => readMdx('cases', file, (data) => CaseFrontmatterSchema.parse(data))),
  )
  const sorted = records
    .map(({ frontmatter, body }) => ({ frontmatter, body }))
    .sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date))
  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted
}

export async function getCase(slug: string, locale: Locale): Promise<CaseRecord | null> {
  try {
    const { frontmatter, body } = await readMdx('cases', `${slug}.${locale}.mdx`, (data) =>
      CaseFrontmatterSchema.parse(data),
    )
    return { frontmatter, body }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
}
