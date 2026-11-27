'use client'

import { useMemo, useState } from 'react'
import { Check, Search, X } from 'lucide-react'
import { UI } from '@/lib/admin/i18n'
import { cn } from '@/lib/utils/cn'
import { useT } from '../AdminLang'
import type { RelationOption } from '../FormContext'

/** Pick several entries by name: chips for the chosen ones, a searchable checklist for the rest. */
export function RelationInput({
  options,
  value,
  onChange,
}: {
  options: readonly RelationOption[]
  value: string[]
  onChange: (slugs: string[]) => void
}) {
  const t = useT()
  const [query, setQuery] = useState('')
  const titleBySlug = useMemo(() => new Map(options.map((option) => [option.slug, option.title])), [options])
  const filtered = options.filter((option) => option.title.toLowerCase().includes(query.trim().toLowerCase()))

  function toggle(slug: string) {
    onChange(value.includes(slug) ? value.filter((item) => item !== slug) : [...value, slug])
  }

  return (
    <div className="flex flex-col gap-3">
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.map((slug) => (
            <span key={slug} className="inline-flex items-center gap-1 rounded-pill border border-border bg-bg-soft py-1 pl-3 pr-1 text-[13px] font-medium">
              {titleBySlug.get(slug) ?? slug}
              <button type="button" onClick={() => toggle(slug)} className="rounded-full p-0.5 text-text-faint hover:bg-black/[0.06] hover:text-text-primary" aria-label={t(UI.remove)}>
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <div className="overflow-hidden rounded-md border border-black/[0.14]">
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="h-4 w-4 text-text-faint" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t(UI.search)}
            className="h-9 flex-1 bg-transparent text-[14px] focus:outline-none"
          />
        </div>
        <ul className="max-h-60 overflow-y-auto py-1">
          {filtered.length === 0 ? <li className="px-3 py-2 text-[13px] text-text-faint">{t(UI.nothingFound)}</li> : null}
          {filtered.map((option) => {
            const selected = value.includes(option.slug)
            return (
              <li key={option.slug}>
                <button
                  type="button"
                  onClick={() => toggle(option.slug)}
                  className={cn('flex w-full items-center gap-3 px-3 py-2 text-left text-[14px] hover:bg-bg-soft', selected && 'font-semibold')}
                >
                  <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded border', selected ? 'border-brand-red bg-brand-red text-white' : 'border-black/25')}>
                    {selected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                  </span>
                  {option.title}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
