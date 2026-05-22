export interface BitrixLeadInput {
  name: string
  phone: string
  region?: string
  model?: string
  comment?: string
  vin?: string
  attachment?: string
  source?: string
  locale: 'ru' | 'kk'
}

export interface BitrixResult {
  ok: boolean
  leadId?: number
  error?: string
}

const REQUEST_TIMEOUT_MS = 8000

function buildTitle(lead: BitrixLeadInput): string {
  const parts = ['Заявка с сайта KAZKIOTI']
  if (lead.model) parts.push(lead.model)
  if (lead.region) parts.push(lead.region)
  return parts.join(' · ')
}

function buildComment(lead: BitrixLeadInput): string {
  return [
    `Источник: ${lead.source ?? '—'}`,
    `Язык: ${lead.locale}`,
    `Регион: ${lead.region ?? '—'}`,
    `Модель: ${lead.model ?? '—'}`,
    `VIN/серийник: ${lead.vin ?? '—'}`,
    `Навесное: ${lead.attachment ?? '—'}`,
    '',
    `Комментарий: ${lead.comment ?? '—'}`,
  ].join('\n')
}

export async function createBitrixLead(lead: BitrixLeadInput): Promise<BitrixResult> {
  const rawUrl = process.env.BITRIX_WEBHOOK_URL
  if (!rawUrl) {
    return { ok: false, error: 'BITRIX_WEBHOOK_URL not configured' }
  }
  const base = rawUrl.endsWith('/') ? rawUrl : `${rawUrl}/`
  const endpoint = `${base}crm.lead.add.json`

  const fields: Record<string, unknown> = {
    TITLE: buildTitle(lead),
    NAME: lead.name,
    SOURCE_ID: 'WEB',
    SOURCE_DESCRIPTION: lead.source ?? 'site',
    COMMENTS: buildComment(lead),
    PHONE: [{ VALUE: lead.phone, VALUE_TYPE: 'WORK' }],
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ fields, params: { REGISTER_SONET_EVENT: 'Y' } }),
      signal: controller.signal,
    })

    const payload = (await response.json().catch(() => null)) as
      | { result?: number; error?: string; error_description?: string }
      | null

    if (!response.ok || !payload || payload.error) {
      const message =
        payload?.error_description ?? payload?.error ?? `HTTP ${response.status}`
      return { ok: false, error: message }
    }

    if (typeof payload.result !== 'number') {
      return { ok: false, error: 'Bitrix did not return a lead id' }
    }

    return { ok: true, leadId: payload.result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { ok: false, error: message }
  } finally {
    clearTimeout(timeout)
  }
}
