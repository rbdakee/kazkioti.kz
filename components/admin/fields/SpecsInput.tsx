'use client'

import { Plus, Trash2 } from 'lucide-react'
import { ATTACHMENT_SPEC_KEYS, type AttachmentSpecKey } from '@/shared/content'
import { ATTACHMENT_SPEC_LABELS } from '@/lib/admin/forms/attachment'
import { UI } from '@/lib/admin/i18n'
import { useT } from '../AdminLang'
import { IconButton, SelectInput } from '../ui'
import { LocalizedInput, type LocalizedValue } from './LocalizedInput'

interface Spec {
  key: AttachmentSpecKey
  value: LocalizedValue
}

/** Characteristics of an attachment: pick a name from the list, fill RU and KZ values. */
export function SpecsInput({
  id,
  value,
  onChange,
  errorAt,
}: {
  id: string
  value: Spec[]
  onChange: (specs: Spec[]) => void
  errorAt: (path: string) => string | undefined
}) {
  const t = useT()
  const used = new Set(value.map((spec) => spec.key))
  const available = ATTACHMENT_SPEC_KEYS.filter((key) => !used.has(key))

  return (
    <div className="flex flex-col gap-3">
      {value.length === 0 ? <p className="text-[13px] text-text-faint">{t(UI.empty)}</p> : null}
      {value.map((spec, index) => (
        <div key={spec.key} className="rounded-md border border-border bg-bg-soft/60 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-[13px] font-semibold text-text-primary">{t(ATTACHMENT_SPEC_LABELS[spec.key])}</span>
            <IconButton label={t(UI.remove)} onClick={() => onChange(value.filter((_, i) => i !== index))} className="hover:text-brand-red">
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </div>
          <LocalizedInput
            id={`${id}-${spec.key}`}
            value={spec.value}
            kazakhOptional
            onChange={(next) => onChange(value.map((item, i) => (i === index ? { ...item, value: next } : item)))}
            errors={{ ru: errorAt(`${index}.value.ru`), kk: errorAt(`${index}.value.kk`) }}
          />
        </div>
      ))}
      {available.length > 0 ? (
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-text-muted" aria-hidden="true" />
          <SelectInput
            value=""
            className="max-w-xs"
            aria-label={t(UI.add)}
            onChange={(event) => {
              const key = event.target.value as AttachmentSpecKey
              if (key) onChange([...value, { key, value: {} }])
            }}
          >
            <option value="">{t(UI.add)}…</option>
            {available.map((key) => (
              <option key={key} value={key}>
                {t(ATTACHMENT_SPEC_LABELS[key])}
              </option>
            ))}
          </SelectInput>
        </div>
      ) : null}
    </div>
  )
}
