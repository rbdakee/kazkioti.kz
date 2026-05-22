import { NextResponse, type NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { Resend } from 'resend'
import { z } from 'zod'
import { createBitrixLead } from '@/lib/integrations/bitrix'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const LeadSchema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().regex(/^\+7\s?\(?\d{3}\)?\s?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/),
  model: z.string().max(60).optional(),
  region: z.string().max(120).optional(),
  comment: z.string().max(500).optional(),
  vin: z.string().max(60).optional(),
  attachment: z.string().max(120).optional(),
  source: z.string().max(60).optional(),
  locale: z.enum(['ru', 'kk']),
  website: z.string().max(0).optional().default(''),
})

type Lead = z.infer<typeof LeadSchema>

let ratelimit: Ratelimit | null = null
function getRateLimiter(): Ratelimit | null {
  if (ratelimit) return ratelimit
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  const redis = new Redis({ url, token })
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: false,
  })
  return ratelimit
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]
    if (first) return first.trim()
  }
  return request.headers.get('x-real-ip') ?? 'anonymous'
}

const emailSubject: Record<'ru' | 'kk', string> = {
  ru: 'Новая заявка — KAZKIOTI',
  kk: '[kk] Новая заявка — KAZKIOTI',
}

function formatLead(lead: Lead): string {
  const lines = [
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    `Модель: ${lead.model ?? '—'}`,
    `Регион: ${lead.region ?? '—'}`,
    `VIN/серийник: ${lead.vin ?? '—'}`,
    `Навесное: ${lead.attachment ?? '—'}`,
    `Источник: ${lead.source ?? '—'}`,
    `Язык: ${lead.locale}`,
    '',
    `Комментарий: ${lead.comment ?? '—'}`,
  ]
  return lines.join('\n')
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = LeadSchema.safeParse(body)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    if (firstIssue?.path[0] === 'website') {
      return NextResponse.json({ success: false, error: 'Spam detected' }, { status: 400 })
    }
    return NextResponse.json(
      { success: false, error: firstIssue?.message ?? 'Validation failed' },
      { status: 422 },
    )
  }

  const lead = parsed.data
  if (lead.website.length > 0) {
    return NextResponse.json({ success: false, error: 'Spam detected' }, { status: 400 })
  }

  const limiter = getRateLimiter()
  if (limiter) {
    const ip = clientIp(request)
    const result = await limiter.limit(`lead:${ip}`)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429 },
      )
    }
  }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM
  const to = process.env.RESEND_TO
  const bitrixUrl = process.env.BITRIX_WEBHOOK_URL

  const resendConfigured = Boolean(apiKey && from && to)
  const bitrixConfigured = Boolean(bitrixUrl)

  if (!resendConfigured && !bitrixConfigured) {
    console.warn('[lead] no delivery channel configured — logging only', formatLead(lead))
    return NextResponse.json({ success: true }, { status: 200 })
  }

  const tasks: Promise<{ channel: 'resend' | 'bitrix'; ok: boolean; error?: string }>[] = []

  if (resendConfigured) {
    const resend = new Resend(apiKey!)
    tasks.push(
      resend.emails
        .send({
          from: from!,
          to: to!,
          subject: `${emailSubject[lead.locale]} · ${lead.source ?? 'site'} · ${lead.model ?? '—'}`,
          text: formatLead(lead),
        })
        .then(({ error }) =>
          error
            ? { channel: 'resend' as const, ok: false, error: error.message }
            : { channel: 'resend' as const, ok: true },
        )
        .catch((error: unknown) => ({
          channel: 'resend' as const,
          ok: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })),
    )
  }

  if (bitrixConfigured) {
    tasks.push(
      createBitrixLead(lead).then((result) => ({
        channel: 'bitrix' as const,
        ok: result.ok,
        error: result.error,
      })),
    )
  }

  const results = await Promise.all(tasks)
  const failures = results.filter((r) => !r.ok)
  for (const failure of failures) {
    console.error(`[lead] ${failure.channel} failed`, failure.error)
  }

  const anyDelivered = results.some((r) => r.ok)
  if (!anyDelivered) {
    return NextResponse.json(
      { success: false, error: 'Lead delivery failed' },
      { status: 502 },
    )
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
