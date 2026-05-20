'use client'

import { useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { FormField } from '@/components/ui/FormField'
import { Toast } from '@/components/ui/Toast'
import { PHONE_REGEX } from '@/lib/utils/formatPhone'
import { TRACTOR_SLUGS, telegramUrl, whatsappUrl } from '@/lib/constants'
import type { Locale } from '@/lib/i18n/routing'

export interface PartsRequestFormProps {
  locale: Locale
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function PartsRequestForm({ locale }: PartsRequestFormProps) {
  const t = useTranslations('forms')
  const tParts = useTranslations('parts')
  const tMessenger = useTranslations('messenger')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [model, setModel] = useState('')
  const [vin, setVin] = useState('')
  const [description, setDescription] = useState('')
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
          model: model || undefined,
          vin: vin || undefined,
          comment: description || undefined,
          website,
          source: 'parts-request',
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
      setVin('')
      setDescription('')
    } catch {
      setStatus('error')
      setToast({ type: 'error', message: t('errorBody') })
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="parts-model" label={t('model')}>
            <Select
              id="parts-model"
              name="model"
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder={t('modelPlaceholder')}
              options={TRACTOR_SLUGS.map((slug) => ({ value: slug, label: slug.toUpperCase() }))}
            />
          </FormField>
          <FormField
            id="parts-vin"
            label={tParts('formVinLabel')}
            optional
            optionalLabel={t('optional')}
          >
            <Input
              id="parts-vin"
              name="vin"
              value={vin}
              onChange={(event) => setVin(event.target.value)}
              placeholder={tParts('formVinPlaceholder')}
            />
          </FormField>
        </div>
        <FormField id="parts-description" label={tParts('formDescriptionLabel')}>
          <Textarea
            id="parts-description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={tParts('formDescriptionPlaceholder')}
            rows={3}
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="parts-name" label={t('name')} error={errors.name}>
            <Input
              id="parts-name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t('namePlaceholder')}
              hasError={Boolean(errors.name)}
              autoComplete="name"
              required
            />
          </FormField>
          <FormField id="parts-phone" label={t('phone')} error={errors.phone}>
            <PhoneInput
              id="parts-phone"
              name="phone"
              value={phone}
              onValueChange={setPhone}
              hasError={Boolean(errors.phone)}
              required
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
          {status === 'submitting' ? t('sending') : tParts('formSubmit')}
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
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      ) : null}
    </>
  )
}
