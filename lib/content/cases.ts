import { CaseFrontmatterSchema, type CaseFrontmatter } from '@/lib/types/case'
import type { Locale } from '@/lib/i18n/routing'
import { listMdx, readMdx } from './fs'

export interface CaseRecord {
  frontmatter: CaseFrontmatter
  body: string
}

export interface CaseQueryOptions {
  region?: string
  limit?: number
}

export async function getAllCases(
  locale: Locale,
  options?: CaseQueryOptions | number,
): Promise<CaseRecord[]> {
  const opts: CaseQueryOptions =
    typeof options === 'number' ? { limit: options } : options ?? {}
  const files = await listMdx('cases', locale)
  const records = await Promise.all(
    files.map((file) => readMdx('cases', file, (data) => CaseFrontmatterSchema.parse(data))),
  )
  const filtered = opts.region
    ? records.filter((r) => r.frontmatter.region === opts.region)
    : records
  const sorted = filtered
    .map(({ frontmatter, body }) => ({ frontmatter, body }))
    .sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date))
  return typeof opts.limit === 'number' ? sorted.slice(0, opts.limit) : sorted
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
