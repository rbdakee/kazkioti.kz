import {
  AttachmentFrontmatterSchema,
  type AttachmentFrontmatter,
} from '@/lib/types/attachment'
import type { Locale } from '@/lib/i18n/routing'
import { listMdx, readMdx } from './fs'

export interface AttachmentRecord {
  frontmatter: AttachmentFrontmatter
  body: string
}

export async function getAllAttachments(locale: Locale): Promise<AttachmentRecord[]> {
  const files = await listMdx('attachments', locale)
  const records = await Promise.all(
    files.map((file) =>
      readMdx('attachments', file, (data) => AttachmentFrontmatterSchema.parse(data)),
    ),
  )
  return records.map(({ frontmatter, body }) => ({ frontmatter, body }))
}

export async function getAttachment(
  slug: string,
  locale: Locale,
): Promise<AttachmentRecord | null> {
  try {
    const { frontmatter, body } = await readMdx(
      'attachments',
      `${slug}.${locale}.mdx`,
      (data) => AttachmentFrontmatterSchema.parse(data),
    )
    return { frontmatter, body }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
}
