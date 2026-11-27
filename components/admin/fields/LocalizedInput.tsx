'use client'

import { UI } from '@/lib/admin/i18n'
import { useT } from '../AdminLang'
import { LanguageTag, TextArea, TextInput } from '../ui'

export interface LocalizedValue {
  ru?: string
  kk?: string
}

interface LocalizedInputProps {
  id: string
  value: LocalizedValue | undefined
  onChange: (value: LocalizedValue) => void
  multiline?: boolean
  rows?: number
  required?: boolean
  kazakhOptional?: boolean
  errors?: { ru?: string; kk?: string }
}

/** RU and KZ versions of one text, side by side. */
export function LocalizedInput({ id, value, onChange, multiline, rows, required, kazakhOptional, errors }: LocalizedInputProps) {
  const t = useT()
  const current = value ?? {}
  const languages = [
    { lang: 'ru' as const, required, error: errors?.ru },
    { lang: 'kk' as const, required: required && !kazakhOptional, error: errors?.kk },
  ]
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {languages.map(({ lang, required: isRequired, error }) => {
        const inputId = `${id}-${lang}`
        const common = {
          id: inputId,
          value: current[lang] ?? '',
          invalid: Boolean(error),
          lang: lang === 'kk' ? 'kk' : 'ru',
          'aria-label': `${t(lang === 'ru' ? UI.russian : UI.kazakh)}`,
          onChange: (event: { target: { value: string } }) => onChange({ ...current, [lang]: event.target.value }),
        }
        return (
          <div key={lang} className="flex min-w-0 flex-col gap-1.5" data-field-error={error ? 'true' : undefined}>
            <div className="flex items-center gap-2">
              <LanguageTag lang={lang} />
              {isRequired ? <span className="text-[11px] text-brand-red">*</span> : null}
            </div>
            {multiline ? <TextArea rows={rows ?? 4} {...common} /> : <TextInput {...common} />}
            {error ? (
              <p className="text-[12px] font-medium text-brand-red">{error}</p>
            ) : lang === 'kk' && kazakhOptional ? (
              <p className="text-[12px] text-text-faint">{t(UI.kazakhFallback)}</p>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
