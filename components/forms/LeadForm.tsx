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
import { whatsappUrl } from '@/lib/constants'
import type { Locale } from '@/lib/i18n/routing'

const REGIONS: Array<{ value: string; labels: Record<Locale, string> }> = [
  { value: 'Туркестанская', labels: { ru: 'Туркестанская', kk: 'Түркістан облысы' } },
  { value: 'Алматинская', labels: { ru: 'Алматинская', kk: 'Алматы облысы' } },
  { value: 'Жамбылская', labels: { ru: 'Жамбылская', kk: 'Жамбыл облысы' } },
  { value: 'Кызылординская', labels: { ru: 'Кызылординская', kk: 'Қызылорда облысы' } },
  { value: 'Актюбинская', labels: { ru: 'Актюбинская', kk: 'Ақтөбе облысы' } },
  { value: 'Костанайская', labels: { ru: 'Костанайская', kk: 'Қостанай облысы' } },
  { value: 'Карагандинская', labels: { ru: 'Карагандинская', kk: 'Қарағанды облысы' } },
  { value: 'Акмолинская', labels: { ru: 'Акмолинская', kk: 'Ақмола облысы' } },
  { value: 'Восточно-Казахстанская', labels: { ru: 'Восточно-Казахстанская', kk: 'Шығыс Қазақстан облысы' } },
  { value: 'Западно-Казахстанская', labels: { ru: 'Западно-Казахстанская', kk: 'Батыс Қазақстан облысы' } },
  { value: 'Атырауская', labels: { ru: 'Атырауская', kk: 'Атырау облысы' } },
  { value: 'Мангистауская', labels: { ru: 'Мангистауская', kk: 'Маңғыстау облысы' } },
  { value: 'Павлодарская', labels: { ru: 'Павлодарская', kk: 'Павлодар облысы' } },
  { value: 'Северо-Казахстанская', labels: { ru: 'Северо-Казахстанская', kk: 'Солтүстік Қазақстан облысы' } },
]

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
              options={REGIONS.map(({ value, labels }) => ({ value, label: labels[locale] }))}
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
            className="inline-flex items-center gap-2 rounded-pill border border-border-strong px-4 py-2 font-mono text-mono-label uppercase tracking-widest hover:border-text-primary"
          >
            <svg viewBox="0 0 24 24" fill="#25D366" className="h-4 w-4" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488" />
            </svg>
            {tMessenger('whatsapp')}
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
