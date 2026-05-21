import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

export interface NewsQuoteProps {
  children: ReactNode
  cite?: string
  className?: string
}

export function NewsQuote({ children, cite, className }: NewsQuoteProps) {
  return (
    <blockquote
      className={cn(
        'my-6 border-l-2 border-brand-red pl-6 py-1',
        className,
      )}
    >
      <p className="font-heading text-h3 font-medium leading-snug text-text-primary">{children}</p>
      {cite ? (
        <cite className="mt-3 block font-mono text-mono-label uppercase tracking-widest text-text-muted not-italic">
          {cite}
        </cite>
      ) : null}
    </blockquote>
  )
}
