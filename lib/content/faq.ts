import {
  FAQGroupSchema,
  type FAQGroupWithItems,
  type FAQItem,
} from '@/lib/types/faq'
import type { Locale } from '@/lib/i18n/routing'
import { listMdx, readMdx } from './fs'

export async function getAllFAQGroups(locale: Locale): Promise<FAQGroupWithItems[]> {
  const files = await listMdx('faq', locale)
  const records = await Promise.all(
    files.map((file) => readMdx('faq', file, (data) => FAQGroupSchema.parse(data))),
  )
  return records
    .map(({ frontmatter, body }) => ({ group: frontmatter, items: parseFAQBody(body) }))
    .sort((a, b) => a.group.order - b.group.order)
}

const HEADING_RE = /^##\s+(.+)$/

function parseFAQBody(body: string): FAQItem[] {
  const items: FAQItem[] = []
  const lines = body.split(/\r?\n/)
  let currentQuestion: string | null = null
  let buffer: string[] = []

  function flush() {
    if (currentQuestion !== null) {
      items.push({ question: currentQuestion, answer: buffer.join('\n').trim() })
    }
    currentQuestion = null
    buffer = []
  }

  for (const line of lines) {
    const heading = HEADING_RE.exec(line)
    if (heading && heading[1]) {
      flush()
      currentQuestion = heading[1].trim()
    } else if (currentQuestion !== null) {
      buffer.push(line)
    }
  }
  flush()
  return items
}
