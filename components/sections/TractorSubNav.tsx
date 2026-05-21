'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'

interface SubNavItem {
  id: string
  labelKey:
    | 'subNavReview'
    | 'subNavSpecs'
    | 'subNavCabin'
    | 'subNavAttachments'
    | 'subNavWarranty'
    | 'subNavCases'
}

const SECTIONS: readonly SubNavItem[] = [
  { id: 'review', labelKey: 'subNavReview' },
  { id: 'specs', labelKey: 'subNavSpecs' },
  { id: 'cabin', labelKey: 'subNavCabin' },
  { id: 'attachments', labelKey: 'subNavAttachments' },
  { id: 'warranty', labelKey: 'subNavWarranty' },
  { id: 'cases', labelKey: 'subNavCases' },
]

export interface TractorSubNavProps {
  showReview: boolean
  showAttachments: boolean
  showCases: boolean
  kpHref: string
}

export function TractorSubNav({ showReview, showAttachments, showCases, kpHref }: TractorSubNavProps) {
  const t = useTranslations('tractorDetail')
  const [activeId, setActiveId] = useState<string | null>(null)

  const items = useMemo(
    () =>
      SECTIONS.filter((item) => {
        if (item.id === 'review' && !showReview) return false
        if (item.id === 'attachments' && !showAttachments) return false
        if (item.id === 'cases' && !showCases) return false
        return true
      }),
    [showReview, showAttachments, showCases],
  )

  useEffect(() => {
    const nodes = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => node !== null)
    if (nodes.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        const first = visible[0]
        if (first) {
          setActiveId(first.target.id)
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [items])

  return (
    <nav
      aria-label={t('subNavAriaLabel')}
      className="sticky z-30 border-b border-border bg-bg-default/90 backdrop-blur transition-[top] duration-250 ease-out"
      style={{ top: 'var(--header-offset, 58px)' }}
    >
      <div className="mx-auto flex max-w-container items-center gap-1 overflow-x-auto px-4 py-3 sm:px-6 lg:px-10">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={activeId === item.id ? 'true' : undefined}
            className={cn(
              'flex-none rounded-pill px-3.5 py-2 font-mono text-mono-label uppercase tracking-widest transition-colors',
              activeId === item.id
                ? 'bg-text-primary text-white'
                : 'text-text-muted hover:text-text-primary',
            )}
          >
            {t(item.labelKey)}
          </a>
        ))}
        <a
          href={kpHref}
          className="ml-auto flex-none rounded-pill bg-brand-red px-3.5 py-2 font-mono text-mono-label uppercase tracking-widest text-white hover:bg-brand-red-hover"
        >
          {t('ctaKp')}
        </a>
      </div>
    </nav>
  )
}
