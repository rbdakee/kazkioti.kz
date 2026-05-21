'use client'

import { useMemo, useState } from 'react'
import type { NewsFrontmatter } from '@/lib/types/news'
import type { Locale } from '@/lib/i18n/routing'
import { Pill } from '@/components/ui/Pill'
import { CardNews } from '@/components/ui/Card/CardNews'
import { Pagination } from '@/components/ui/Pagination'

const PER_PAGE = 9

type Tag = NewsFrontmatter['tag']
type FilterKey = 'all' | Tag

export interface NewsFilterProps {
  articles: ReadonlyArray<NewsFrontmatter>
  locale: Locale
  basePath: string
  initialPage: number
  labels: {
    all: string
    production: string
    delivery: string
    partnership: string
    lineup: string
    empty: string
    filterLabel: string
  }
  tagLabels: Record<Tag, string>
}

const FILTERS: ReadonlyArray<FilterKey> = ['all', 'production', 'delivery', 'partnership', 'lineup']

export function NewsFilter({
  articles,
  locale,
  basePath,
  initialPage,
  labels,
  tagLabels,
}: NewsFilterProps) {
  const [active, setActive] = useState<FilterKey>('all')

  const filtered = useMemo(() => {
    if (active === 'all') return articles
    return articles.filter((article) => article.tag === active)
  }, [articles, active])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const currentPage = Math.min(initialPage, totalPages)
  const visible = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <span className="font-mono text-mono-label uppercase tracking-widest text-text-muted">
          {labels.filterLabel}
        </span>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((key) => (
            <Pill key={key} active={active === key} onClick={() => setActive(key)}>
              {labels[key]}
            </Pill>
          ))}
        </div>
      </div>
      {visible.length === 0 ? (
        <p className="text-body-m text-text-muted">{labels.empty}</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((article) => (
            <CardNews
              key={article.slug}
              article={article}
              locale={locale}
              tagLabel={tagLabels[article.tag]}
            />
          ))}
        </div>
      )}
      {active === 'all' && filtered.length > PER_PAGE ? (
        <Pagination
          total={filtered.length}
          perPage={PER_PAGE}
          currentPage={currentPage}
          basePath={basePath}
        />
      ) : null}
    </div>
  )
}
