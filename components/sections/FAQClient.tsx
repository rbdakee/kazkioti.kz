'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Accordion } from '@/components/ui/Accordion'
import type { FAQGroupWithItems } from '@/lib/types/faq'

export interface FAQClientProps {
  groups: FAQGroupWithItems[]
  categoryLabels: Record<string, string>
}

export function FAQClient({ groups, categoryLabels }: FAQClientProps) {
  const t = useTranslations('faq')
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>(groups[0]?.group.category ?? '')
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map())

  const filteredGroups = groups
    .map((g) => ({
      ...g,
      items: query.trim()
        ? g.items.filter(
            (item) =>
              item.question.toLowerCase().includes(query.toLowerCase()) ||
              item.answer.toLowerCase().includes(query.toLowerCase()),
          )
        : g.items,
    }))
    .filter((g) => g.items.length > 0)

  const registerRef = useCallback((category: string, el: HTMLElement | null) => {
    if (el) {
      sectionRefs.current.set(category, el)
    } else {
      sectionRefs.current.delete(category)
    }
  }, [])

  useEffect(() => {
    if (query.trim()) return

    const observers: IntersectionObserver[] = []

    sectionRefs.current.forEach((el, category) => {
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0]
          if (entry?.isIntersecting) {
            setActiveCategory(category)
          }
        },
        { rootMargin: '-20% 0px -60% 0px', threshold: 0 },
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => {
      observers.forEach((o) => o.disconnect())
    }
  }, [query, groups])

  return (
    <div>
      <div className="mb-10 flex max-w-xl items-center gap-2 rounded-pill border border-border-strong bg-bg-default px-5 py-1.5 shadow-card">
        <label htmlFor="faq-search" className="sr-only">
          {t('searchPlaceholder')}
        </label>
        <input
          id="faq-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="flex-1 bg-transparent py-3 text-body-m text-text-primary placeholder:text-text-faint focus:outline-none"
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-5 w-5 shrink-0 text-text-muted"
        >
          <circle cx="8.5" cy="8.5" r="5.5" />
          <path d="M13 13l3 3" strokeLinecap="round" />
        </svg>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr] lg:gap-16">
        <nav
          aria-label="FAQ navigation"
          className="flex flex-row flex-wrap gap-2 lg:sticky lg:flex-col lg:gap-1 lg:self-start lg:border-l lg:border-border lg:pl-5 lg:transition-[top] lg:duration-250 lg:ease-out"
          style={{ top: 'calc(var(--header-offset, 58px) + 24px)' }}
        >
          {groups.map((g) => {
            const filtered = filteredGroups.find((fg) => fg.group.category === g.group.category)
            const isEmpty = !filtered
            return (
              <a
                key={g.group.category}
                href={`#${g.group.category}`}
                aria-current={activeCategory === g.group.category ? 'true' : undefined}
                aria-disabled={isEmpty ? 'true' : undefined}
                className={`rounded-pill border px-3 py-1.5 font-mono text-mono-label uppercase tracking-widest transition-colors duration-fast lg:rounded-none lg:border-0 lg:px-0 lg:py-1.5 ${
                  isEmpty
                    ? 'pointer-events-none border-border opacity-40'
                    : activeCategory === g.group.category
                      ? 'border-text-primary bg-bg-muted text-brand-red lg:bg-transparent'
                      : 'border-border text-text-muted hover:text-text-primary'
                }`}
                onClick={(e) => {
                  if (isEmpty) return
                  e.preventDefault()
                  const target = document.getElementById(g.group.category)
                  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  setActiveCategory(g.group.category)
                }}
              >
                {categoryLabels[g.group.category] ?? g.group.title}
              </a>
            )
          })}
        </nav>

        <div className="flex flex-col gap-14">
          {filteredGroups.length === 0 ? (
            <p className="text-body-m text-text-muted">{t('noAnswer')}</p>
          ) : (
            filteredGroups.map((g) => (
              <section
                key={g.group.category}
                id={g.group.category}
                ref={(el) => registerRef(g.group.category, el)}
              >
                <h2 className="mb-5 font-heading text-h2 text-text-primary">
                  {categoryLabels[g.group.category] ?? g.group.title}
                </h2>
                <Accordion items={g.items} defaultOpenIndex={0} />
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
