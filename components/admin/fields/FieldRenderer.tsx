'use client'

import { useState } from 'react'
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from 'lucide-react'
import type { FieldConfig } from '@/lib/admin/forms/types'
import { getIn, pathKey, type Path } from '@/lib/admin/forms/paths'
import { UI } from '@/lib/admin/i18n'
import { formatTenge } from '@/lib/utils/formatPrice'
import { cn } from '@/lib/utils/cn'
import { useT } from '../AdminLang'
import { hasErrorWithin, useForm } from '../FormContext'
import { AdminButton, FieldShell, IconButton, SelectInput, TextArea, TextInput, Toggle, controlClass } from '../ui'
import { BlocksInput } from './BlocksInput'
import { GalleryInput, ImageDrop } from './ImageField'
import { LocalizedInput, type LocalizedValue } from './LocalizedInput'
import { PdfInput } from './PdfInput'
import { RelationInput } from './RelationInput'
import { SpecsInput } from './SpecsInput'

const WIDTH_CLASS = { full: 'col-span-6', half: 'col-span-6 sm:col-span-3', third: 'col-span-6 sm:col-span-2' } as const

/** Lays out fields on a 6-column grid so short ones can share a row. */
export function FieldGrid({ fields, basePath = [] }: { fields: readonly FieldConfig[]; basePath?: Path }) {
  return (
    <div className="grid grid-cols-6 gap-x-4 gap-y-5">
      {fields.map((field) => (
        <div key={field.key} className={WIDTH_CLASS[field.width ?? 'full']}>
          <FieldRenderer field={field} path={[...basePath, field.key]} />
        </div>
      ))}
    </div>
  )
}

export function FieldRenderer({ field, path }: { field: FieldConfig; path: Path }) {
  const t = useT()
  const { doc, setValue, errors, relations, currentSlug } = useForm()
  const key = pathKey(path)
  const id = `field-${key.replace(/\./g, '-')}`
  const value = getIn(doc, path)
  const error = errors[key]
  const errorAt = (suffix: string) => errors[`${key}.${suffix}`]
  const label = t(field.label)
  const hint = field.hint ? t(field.hint) : undefined
  const set = (next: unknown) => setValue(path, next)

  switch (field.kind) {
    case 'text':
      return (
        <FieldShell label={label} htmlFor={id} required={field.required} hint={hint} error={error}>
          <TextInput id={id} value={typeof value === 'string' ? value : ''} placeholder={field.placeholder} invalid={Boolean(error)} onChange={(event) => set(event.target.value)} />
        </FieldShell>
      )
    case 'textarea':
      return (
        <FieldShell label={label} htmlFor={id} required={field.required} hint={hint} error={error}>
          <TextArea id={id} rows={field.rows} value={typeof value === 'string' ? value : ''} invalid={Boolean(error)} onChange={(event) => set(event.target.value)} />
        </FieldShell>
      )
    case 'number': {
      const numeric = typeof value === 'number' ? value : undefined
      const priceHint = field.unit === '₸' && numeric !== undefined ? formatTenge(numeric) : undefined
      return (
        <FieldShell label={label} htmlFor={id} required={field.required} hint={priceHint ?? hint} error={error}>
          <div className="relative">
            <input
              id={id}
              type="number"
              inputMode="decimal"
              step="any"
              value={numeric ?? ''}
              aria-invalid={Boolean(error) || undefined}
              onWheel={(event) => event.currentTarget.blur()}
              onChange={(event) => set(event.target.value === '' ? undefined : Number(event.target.value))}
              className={controlClass(Boolean(error), cn('h-10 tabular-nums', field.unit && 'pr-12'))}
            />
            {field.unit ? <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[13px] text-text-faint">{field.unit}</span> : null}
          </div>
        </FieldShell>
      )
    }
    case 'date':
      return (
        <FieldShell label={label} htmlFor={id} required={field.required} hint={hint} error={error}>
          <TextInput id={id} type="date" value={typeof value === 'string' ? value : ''} invalid={Boolean(error)} onChange={(event) => set(event.target.value)} />
        </FieldShell>
      )
    case 'select':
      return (
        <FieldShell label={label} htmlFor={id} required={field.required} hint={hint} error={error}>
          <SelectInput id={id} value={typeof value === 'string' ? value : ''} invalid={Boolean(error)} onChange={(event) => set(event.target.value)}>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.label)}
              </option>
            ))}
          </SelectInput>
        </FieldShell>
      )
    case 'toggle':
      return <Toggle checked={value === true} onChange={set} label={label} description={hint} />
    case 'localized':
      return (
        <FieldShell label={label} required={field.required} hint={hint}>
          <LocalizedInput
            id={id}
            value={value as LocalizedValue | undefined}
            onChange={set}
            multiline={field.multiline}
            rows={field.rows}
            required={field.required}
            kazakhOptional={field.kazakhOptional}
            errors={{ ru: errorAt('ru') ?? error, kk: errorAt('kk') ?? error }}
          />
        </FieldShell>
      )
    case 'image':
      return (
        <FieldShell label={label} required={field.required} hint={hint} error={error}>
          <ImageDrop value={typeof value === 'string' ? value : undefined} onChange={set} invalid={Boolean(error)} />
        </FieldShell>
      )
    case 'pdf':
      return (
        <FieldShell label={label} required={field.required} hint={hint} error={error}>
          <PdfInput value={typeof value === 'string' ? value : undefined} fallback={field.fallback} onChange={set} invalid={Boolean(error)} />
        </FieldShell>
      )
    case 'gallery':
      return (
        <FieldShell label={label} hint={hint} error={error}>
          <GalleryInput value={Array.isArray(value) ? (value as string[]) : []} onChange={set} />
        </FieldShell>
      )
    case 'relation': {
      const options = (relations[field.collection] ?? []).filter((option) => !(field.collection === 'news' && option.slug === currentSlug))
      return (
        <FieldShell hint={hint} error={error}>
          <RelationInput options={options} value={Array.isArray(value) ? (value as string[]) : []} onChange={set} />
        </FieldShell>
      )
    }
    case 'specs':
      return <SpecsInput id={id} value={Array.isArray(value) ? (value as never[]) : []} onChange={set} errorAt={errorAt} />
    case 'blocks':
      return <BlocksInput id={id} value={Array.isArray(value) ? (value as never[]) : []} onChange={set} errorAt={errorAt} />
    case 'repeater':
      return <RepeaterInput field={field} path={path} />
  }
}

function RepeaterInput({ field, path }: { field: Extract<FieldConfig, { kind: 'repeater' }>; path: Path }) {
  const t = useT()
  const { doc, setValue, errors } = useForm()
  const items = (getIn(doc, path) as Array<Record<string, unknown>> | undefined) ?? []
  const [open, setOpen] = useState<Set<number>>(() => new Set(field.collapsible ? [] : items.map((_, i) => i)))

  function move(index: number, delta: number) {
    const next = [...items]
    const [item] = next.splice(index, 1)
    if (!item) return
    next.splice(index + delta, 0, item)
    setValue(path, next)
    setOpen((current) => new Set([...current].map((i) => (i === index ? index + delta : i === index + delta ? index : i))))
  }

  function remove(index: number) {
    setValue(path, items.filter((_, i) => i !== index))
    setOpen((current) => new Set([...current].filter((i) => i !== index).map((i) => (i > index ? i - 1 : i))))
  }

  function add() {
    setValue(path, [...items, field.newItem()])
    setOpen((current) => new Set([...current, items.length]))
  }

  function toggle(index: number) {
    setOpen((current) => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 ? <p className="text-[13px] text-text-faint">{t(UI.empty)}</p> : null}
      {items.map((item, index) => {
        const itemPath = [...path, index]
        const invalid = hasErrorWithin(errors, pathKey(itemPath))
        const expanded = open.has(index) || invalid
        return (
          <div key={index} className={cn('rounded-lg border bg-white', invalid ? 'border-brand-red/50' : 'border-border')}>
            <div className="flex items-center gap-2 px-3 py-2">
              <button type="button" onClick={() => toggle(index)} className="flex min-w-0 flex-1 items-center gap-2 rounded px-1 py-1 text-left" aria-expanded={expanded}>
                <ChevronDown className={cn('h-4 w-4 shrink-0 text-text-faint transition-transform', !expanded && '-rotate-90')} />
                <span className="font-mono text-[11px] text-text-faint">{String(index + 1).padStart(2, '0')}</span>
                <span className="truncate text-[14px] font-semibold text-text-primary">{field.itemTitle(item, index)}</span>
              </button>
              <IconButton label={t(UI.moveUp)} disabled={index === 0} onClick={() => move(index, -1)}>
                <ArrowUp className="h-4 w-4" />
              </IconButton>
              <IconButton label={t(UI.moveDown)} disabled={index === items.length - 1} onClick={() => move(index, 1)}>
                <ArrowDown className="h-4 w-4" />
              </IconButton>
              <IconButton label={t(UI.remove)} onClick={() => remove(index)} className="hover:text-brand-red">
                <Trash2 className="h-4 w-4" />
              </IconButton>
            </div>
            {expanded ? (
              <div className="border-t border-border p-4">
                <FieldGrid fields={field.fields} basePath={itemPath} />
              </div>
            ) : null}
          </div>
        )
      })}
      <AdminButton className="self-start" icon={<Plus className="h-4 w-4" />} onClick={add}>
        {t(field.addLabel)}
      </AdminButton>
    </div>
  )
}
