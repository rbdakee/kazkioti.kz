'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/cn'
import type { TocEntry } from '@/lib/utils/mdxToc'

export interface ArticleTocProps {
  entries: ReadonlyArray<TocEntry>
  title: string
  ariaLabel: string
  className?: string
}

export function ArticleToc({ entries, title, ariaLabel, className }: ArticleTocProps) {
  const [activeId, setActiveId] = useState<string | null>(entries[0]?.id ?? null)

  useEffect(() => {
    if (entries.length === 0) return
    if (typeof IntersectionObserver === 'undefined') return
    const targets = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((node): node is HTMLElement => node !== null)
    if (targets.length === 0) return
    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          if (record.isIntersecting) {
            setActiveId(record.target.id)
          }
        }
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: 0 },
    )
    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [entries])

  if (entries.length === 0) return null

  return (
    <nav
      aria-label={ariaLabel}
      className={cn('flex flex-col gap-3 rounded-md border border-border bg-bg-default p-5', className)}
    >
      <p className="font-mono text-mono-label uppercase tracking-widest text-text-muted">{title}</p>
      <ol className="flex flex-col gap-2">
        {entries.map((entry, index) => {
          const isActive = entry.id === activeId
          return (
            <li key={entry.id} className="flex gap-2">
              <span className="font-mono text-mono-label uppercase tracking-widest text-text-faint">
                {String(index + 1).padStart(2, '0')}
              </span>
              <a
                href={`#${entry.id}`}
                className={cn(
                  'flex-1 text-body-s transition-colors',
                  isActive
                    ? 'text-brand-red'
                    : 'text-text-muted hover:text-text-primary',
                )}
              >
                {entry.text}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
