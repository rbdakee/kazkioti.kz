'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { Locale } from '@/lib/i18n/routing'

export interface CompareTrayProps {
  slugs: readonly string[]
  locale: Locale
  onRemove: (slug: string) => void
  onClear: () => void
}

export function CompareTray({ slugs, locale, onRemove, onClear }: CompareTrayProps) {
  const t = useTranslations('tractors')
  const compareHref = `/${locale}/tractors/compare?models=${slugs.join(',')}`

  return (
    <div className="fixed inset-x-4 bottom-6 z-40 mx-auto max-w-3xl rounded-lg border border-border bg-bg-default p-4 shadow-form">
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <span className="font-mono text-mono-label uppercase tracking-widest text-text-muted">
            {t('compareTrayTitle')}
          </span>
          {slugs.map((slug) => (
            <button
              key={slug}
              type="button"
              onClick={() => onRemove(slug)}
              className="inline-flex items-center gap-2 rounded-pill border border-border-strong px-3 py-1 font-mono text-mono-label uppercase tracking-widest"
              aria-label={`${t('compareTrayRemove')} ${slug}`}
            >
              {slug.toUpperCase()}
              <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClear}
            className="font-mono text-mono-label uppercase tracking-widest text-text-muted hover:text-text-primary"
          >
            ×
          </button>
          <Link
            href={compareHref}
            className="inline-flex h-11 items-center justify-center rounded-pill bg-brand-red px-5 font-medium text-white hover:bg-brand-red-hover"
          >
            {t('compareTrayCta')}
          </Link>
        </div>
      </div>
    </div>
  )
}
