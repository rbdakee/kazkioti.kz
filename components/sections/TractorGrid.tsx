'use client'

import { useMemo, useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import type { Locale } from '@/lib/i18n/routing'
import type { TractorFrontmatter } from '@/lib/types/tractor'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Pill } from '@/components/ui/Pill'
import { CardTractor } from '@/components/ui/Card/CardTractor'
import { CompareTray } from './CompareTray'

const COMPARE_KEY = 'kk_compare_models'

export interface TractorGridProps {
  tractors: readonly TractorFrontmatter[]
  locale: Locale
  showFilter?: boolean
  showCompareTray?: boolean
  viewAllHref?: string
}

type FilterKey = 'all' | '40' | '90' | '120' | '210'

const FILTERS: Array<{ key: FilterKey; label: string; predicate: (t: TractorFrontmatter) => boolean }> = [
  { key: 'all', label: 'filterAll', predicate: () => true },
  { key: '40', label: 'filter40', predicate: (t) => t.power < 50 },
  { key: '90', label: 'filter90', predicate: (t) => t.power >= 50 && t.power < 100 },
  { key: '120', label: 'filter120', predicate: (t) => t.power >= 100 && t.power < 150 },
  { key: '210', label: 'filter210', predicate: (t) => t.power >= 150 },
]

export function TractorGrid({
  tractors,
  locale,
  showFilter = true,
  showCompareTray = true,
  viewAllHref,
}: TractorGridProps) {
  const t = useTranslations('tractors')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [compareSlugs, setCompareSlugs] = useState<string[]>([])

  useEffect(() => {
    if (!showCompareTray) return
    try {
      const stored = sessionStorage.getItem(COMPARE_KEY)
      if (stored) {
        const parsed: unknown = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.every((s) => typeof s === 'string')) {
          setCompareSlugs(parsed)
        }
      }
    } catch {
      // ignore parsing errors
    }
  }, [showCompareTray])

  useEffect(() => {
    if (!showCompareTray) return
    try {
      sessionStorage.setItem(COMPARE_KEY, JSON.stringify(compareSlugs))
    } catch {
      // ignore storage errors
    }
  }, [compareSlugs, showCompareTray])

  const filtered = useMemo(() => {
    const predicate = FILTERS.find((f) => f.key === filter)?.predicate ?? (() => true)
    return tractors.filter(predicate)
  }, [filter, tractors])

  function toggleCompare(slug: string) {
    setCompareSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((value) => value !== slug)
      if (prev.length >= 3) return prev
      return [...prev, slug]
    })
  }

  function clearCompare() {
    setCompareSlugs([])
  }

  return (
    <section className="bg-bg-default">
      <div className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-10">
        <SectionHeader
          eyebrow={t('catalogHeader')}
          h2={t('catalogHeader')}
          lede={t('catalogLede')}
          link={viewAllHref ? { label: t('viewAll'), href: viewAllHref } : undefined}
        />
        {showFilter ? (
          <div className="mt-8 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <Pill key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
                {t(f.label as 'filterAll')}
              </Pill>
            ))}
          </div>
        ) : null}
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((tractor) => (
            <CardTractor
              key={tractor.slug}
              tractor={tractor}
              locale={locale}
              selectedForCompare={compareSlugs.includes(tractor.slug)}
              onToggleCompare={showCompareTray ? toggleCompare : undefined}
            />
          ))}
        </div>
      </div>
      {showCompareTray && compareSlugs.length > 0 ? (
        <CompareTray
          slugs={compareSlugs}
          locale={locale}
          onRemove={toggleCompare}
          onClear={clearCompare}
        />
      ) : null}
    </section>
  )
}
