import { timingSafeEqual } from 'node:crypto'
import { revalidateTag } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

const BodySchema = z.object({ tags: z.array(z.string().regex(/^cms:[a-z]+$/)).min(1).max(20) })

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.REVALIDATE_SECRET
  const received = request.headers.get('x-revalidate-secret')
  if (!expected || !received) return false
  const a = Buffer.from(expected)
  const b = Buffer.from(received)
  return a.length === b.length && timingSafeEqual(a, b)
}

/** Called by the CMS after an edit so changed pages are rebuilt on the next visit. */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const parsed = BodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  for (const tag of parsed.data.tags) revalidateTag(tag)
  return NextResponse.json({ revalidated: parsed.data.tags })
}
