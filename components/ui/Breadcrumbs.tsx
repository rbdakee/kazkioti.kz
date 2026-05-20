import Link from 'next/link'
import { Fragment } from 'react'
import { cn } from '@/lib/utils/cn'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbsProps {
  items: readonly BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumbs"
      className={cn(
        'flex flex-wrap items-center gap-2 font-mono text-mono-label uppercase tracking-widest text-text-muted',
        className,
      )}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <Fragment key={`${item.label}-${index}`}>
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-text-primary">
                {item.label}
              </Link>
            ) : (
              <span className={cn(isLast && 'text-text-primary')} aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            )}
            {!isLast ? <span className="text-text-faint">/</span> : null}
          </Fragment>
        )
      })}
    </nav>
  )
}
