'use client'

import { useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { Select } from '@/components/ui/Select'
import { FormField } from '@/components/ui/FormField'
import { Toast } from '@/components/ui/Toast'
import { PHONE_REGEX } from '@/lib/utils/formatPhone'
import { telegramUrl, whatsappUrl } from '@/lib/constants'
import type { Locale } from '@/lib/i18n/routing'

const REGIONS = [
  'Туркестанская',
  'Алматинская',
  'Жамбылская',
  'Кызылординская',
  'Актюбинская',
  'Костанайская',
  'Карагандинская',
  'Акмолинская',
  'Восточно-Казахстанская',
  'Западно-Казахстанская',
  'Атырауская',
  'Мангистауская',
  'Павлодарская',
  'Северо-Казахстанская',
] as const

export interface LeadFormProps {
  locale: Locale
  defaultModel?: string
  source?: string
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function LeadForm({ locale, defaultModel, source = 'lead-form' }: LeadFormProps) {
  const t = useTranslations('forms')
  const tMessenger = useTranslations('messenger')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [region, setRegion] = useState('')
  const [website, setWebsite] = useState('')
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})
  const [status, setStatus] = useState<Status>('idle')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: typeof errors = {}
    if (!name.trim()) nextErrors.name = t('name')
    if (!PHONE_REGEX.test(phone)) nextErrors.phone = t('phone')
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setStatus('submitting')
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          region: region || undefined,
          model: defaultModel || undefined,
          website,
          source,
          locale,
        }),
      })
      const payload = (await response.json()) as { success: boolean; error?: string }
      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? 'Request failed')
      }
      setStatus('success')
      setToast({ type: 'success', message: t('successBody') })
      setName('')
      setPhone('')
    } catch {
      setStatus('error')
      setToast({ type: 'error', message: t('errorBody') })
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FormField id="lead-name" label={t('name')} error={errors.name}>
          <Input
            id="lead-name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('namePlaceholder')}
            hasError={Boolean(errors.name)}
            autoComplete="name"
            required
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="lead-phone" label={t('phone')} error={errors.phone}>
            <PhoneInput
              id="lead-phone"
              name="phone"
              value={phone}
              onValueChange={setPhone}
              hasError={Boolean(errors.phone)}
              required
            />
          </FormField>
          <FormField id="lead-region" label={t('region')} optional>
            <Select
              id="lead-region"
              name="region"
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              placeholder={t('regionPlaceholder')}
              options={REGIONS.map((value) => ({ value, label: value }))}
            />
          </FormField>
        </div>
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          className="honeypot"
          aria-label={t('honeypotLabel')}
        />
        <Button type="submit" variant="primary" size="lg" loading={status === 'submitting'}>
          {status === 'submitting' ? t('sending') : t('submit')}
        </Button>
        <p className="text-body-s text-text-faint">{t('consent')}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="font-mono text-mono-label uppercase tracking-widest text-text-muted">
            {t('orMessenger')}
          </span>
          <a
            href={whatsappUrl(locale)}
            target="_blank"
            rel="noreferrer"
            className="rounded-pill border border-border-strong px-4 py-2 font-mono text-mono-label uppercase tracking-widest hover:border-text-primary"
          >
            {tMessenger('whatsapp')}
          </a>
          <a
            href={telegramUrl()}
            target="_blank"
            rel="noreferrer"
            className="rounded-pill border border-border-strong px-4 py-2 font-mono text-mono-label uppercase tracking-widest hover:border-text-primary"
          >
            {tMessenger('telegram')}
          </a>
        </div>
      </form>
      {toast ? (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      ) : null}
    </>
  )
}
