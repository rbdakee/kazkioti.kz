'use client'

import { cn } from '@/lib/utils/cn'

export interface AccordionItem {
  question: string
  answer: string
}

export interface AccordionProps {
  items: readonly AccordionItem[]
  defaultOpenIndex?: number
  className?: string
}

export function Accordion({ items, defaultOpenIndex, className }: AccordionProps) {
  return (
    <div className={cn('flex flex-col divide-y divide-border', className)}>
      {items.map((item, index) => (
        <details
          key={item.question}
          className="group py-5"
          open={defaultOpenIndex === index || undefined}
        >
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-left">
            <span className="font-heading text-h3 text-text-primary">{item.question}</span>
            <span
              className="mt-1 inline-block h-6 w-6 shrink-0 text-text-muted transition-transform duration-fast ease-kk group-open:rotate-45"
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </span>
          </summary>
          <div className="mt-4 max-w-3xl text-body-l text-text-muted">{item.answer}</div>
        </details>
      ))}
    </div>
  )
}
