import { createHeadingIdAssigner } from './slugifyHeading'

export interface TocEntry {
  id: string
  text: string
}

export function extractToc(body: string): TocEntry[] {
  const assignId = createHeadingIdAssigner()
  const lines = body.split(/\r?\n/)
  const entries: TocEntry[] = []
  let inFence = false
  for (const raw of lines) {
    if (raw.startsWith('```')) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const match = /^##\s+(.+?)\s*#*$/.exec(raw)
    if (!match || !match[1]) continue
    const text = match[1].trim()
    entries.push({ id: assignId(text), text })
  }
  return entries
}
