import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'

export const CONTENT_DIR = path.join(process.cwd(), 'content')

export interface ParsedFile<T> {
  frontmatter: T
  body: string
  filename: string
}

export async function listMdx(subdir: string, locale: string): Promise<string[]> {
  const dir = path.join(CONTENT_DIR, subdir)
  try {
    const entries = await fs.readdir(dir)
    return entries.filter((entry) => entry.endsWith(`.${locale}.mdx`))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}

export async function readMdx<T>(
  subdir: string,
  filename: string,
  validate: (frontmatter: unknown) => T,
): Promise<ParsedFile<T>> {
  const file = path.join(CONTENT_DIR, subdir, filename)
  const raw = await fs.readFile(file, 'utf8')
  const parsed = matter(raw)
  const frontmatter = validate(parsed.data)
  return { frontmatter, body: parsed.content, filename }
}
