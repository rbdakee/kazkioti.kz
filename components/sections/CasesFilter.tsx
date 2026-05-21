'use client'

import { useMemo, useState } from 'react'
import type { CaseFrontmatter } from '@/lib/types/case'
import type { Locale } from '@/lib/i18n/routing'
import { Pill } from '@/components/ui/Pill'
import { CardCase } from '@/components/ui/Card/CardCase'

export interface CasesFilterProps {
  cases: ReadonlyArray<CaseFrontmatter>
  locale: Locale
  filterNote: string
  filterAllLabel: string
  emptyState: string
  cardLabels: {
    hectares: string
    motorHours: string
    years: string
  }
}

export function CasesFilter({
  cases,
  locale,
  filterNote,
  filterAllLabel,
  emptyState,
  cardLabels,
}: CasesFilterProps) {
  const regions = useMemo(() => {
    const set = new Set<string>()
    for (const item of cases) set.add(item.region)
    return Array.from(set)
  }, [cases])

  const [activeRegion, setActiveRegion] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!activeRegion) return cases
    return cases.filter((item) => item.region === activeRegion)
  }, [cases, activeRegion])

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <span className="font-mono text-mono-label uppercase tracking-widest text-text-muted">
          {filterNote}
        </span>
        <div className="flex flex-wrap gap-2">
          <Pill active={activeRegion === null} onClick={() => setActiveRegion(null)}>
            {filterAllLabel}
          </Pill>
          {regions.map((region) => (
            <Pill
              key={region}
              active={activeRegion === region}
              onClick={() => setActiveRegion(region)}
            >
              {region}
            </Pill>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="text-body-m text-text-muted">{emptyState}</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <CardCase
              key={item.slug}
              caseItem={item}
              locale={locale}
              labels={cardLabels}
            />
          ))}
        </div>
      )}
    </div>
  )
}
