'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, ImageOff, Plus, Search } from 'lucide-react'
import { formatAdminDate } from '@/lib/admin/formatDate'
import type { ListRow } from '@/lib/admin/listRows'
import { UI, type Label } from '@/lib/admin/i18n'
import { cn } from '@/lib/utils/cn'
import { useT } from './AdminLang'
import { Badge } from './ui'

export function EntryList({
  basePath,
  title,
  addLabel,
  rows,
  withThumbnails,
}: {
  basePath: string
  title: Label
  addLabel: Label
  rows: ListRow[]
  withThumbnails: boolean
}) {
  const t = useT()
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const visible = needle ? rows.filter((row) => `${row.title} ${row.slug}`.toLowerCase().includes(needle)) : rows
  const text = (value: string | Label) => (typeof value === 'string' ? value : t(value))

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-[26px] font-bold text-text-primary">{t(title)}</h1>
          <p className="mt-1 text-[14px] text-text-muted">{rows.length}</p>
        </div>
        <Link href={`${basePath}/new`} className="inline-flex h-10 items-center gap-2 rounded-md bg-brand-red px-4 text-body-s font-semibold text-white shadow-[0_1px_2px_rgba(224,0,27,0.25)] transition-colors hover:bg-brand-red-hover">
          <Plus className="h-4 w-4" />
          {t(addLabel)}
        </Link>
      </header>

      <div className="overflow-hidden rounded-lg border border-border bg-white shadow-[0_1px_2px_rgba(15,15,15,0.04)]">
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="h-4 w-4 text-text-faint" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t(UI.search)}
            aria-label={t(UI.search)}
            className="h-12 flex-1 bg-transparent text-[14px] focus:outline-none"
          />
        </div>
        {visible.length === 0 ? (
          <p className="px-6 py-16 text-center text-[14px] text-text-faint">{rows.length === 0 ? t(UI.empty) : t(UI.nothingFound)}</p>
        ) : (
          <ul className="divide-y divide-border">
            {visible.map((row) => (
              <li key={row.slug}>
                <Link href={`${basePath}/${row.slug}`} className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-bg-soft sm:px-5">
                  {withThumbnails ? (
                    <span className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-bg-muted">
                      {row.thumbnail ? <img src={row.thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" /> : <ImageOff className="h-4 w-4 text-text-faint" aria-label={t(UI.noPhoto)} />}
                    </span>
                  ) : null}
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate text-[15px] font-semibold text-text-primary group-hover:text-brand-red">{row.title}</span>
                    <span className="flex flex-wrap items-center gap-x-2 text-[13px] text-text-muted">
                      {row.details.map((detail, index) => (
                        <span key={index} className={cn(index > 0 && "before:mr-2 before:text-text-faint before:content-['·']")}>
                          {text(detail)}
                        </span>
                      ))}
                    </span>
                  </span>
                  {row.badge ? (
                    <span className="hidden sm:block">
                      <Badge tone={row.badge.tone}>{t(row.badge.label)}</Badge>
                    </span>
                  ) : null}
                  <span className="hidden w-36 shrink-0 text-right text-[12px] text-text-faint md:block">
                    {formatAdminDate(row.updatedAt)}
                    {row.updatedBy ? <span className="block truncate">{row.updatedBy}</span> : null}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-text-faint" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
