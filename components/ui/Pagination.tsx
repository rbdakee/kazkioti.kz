import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

export interface PaginationProps {
  total: number
  perPage: number
  currentPage: number
  basePath: string
  className?: string
}

export function Pagination({ total, perPage, currentPage, basePath, className }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
  const pageHref = (page: number) => (page === 1 ? basePath : `${basePath}?page=${page}`)

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-2', className)}
    >
      {currentPage > 1 ? (
        <Link
          href={pageHref(currentPage - 1)}
          className="rounded-pill border border-border-strong px-4 py-2 font-mono text-mono-label uppercase tracking-widest hover:border-text-primary"
        >
          ←
        </Link>
      ) : null}
      {pages.map((page) => (
        <Link
          key={page}
          href={pageHref(page)}
          aria-current={page === currentPage ? 'page' : undefined}
          className={cn(
            'rounded-pill border px-4 py-2 font-mono text-mono-label uppercase tracking-widest transition-colors',
            page === currentPage
              ? 'border-text-primary bg-text-primary text-white'
              : 'border-border-strong hover:border-text-primary',
          )}
        >
          {page}
        </Link>
      ))}
      {currentPage < totalPages ? (
        <Link
          href={pageHref(currentPage + 1)}
          className="rounded-pill border border-border-strong px-4 py-2 font-mono text-mono-label uppercase tracking-widest hover:border-text-primary"
        >
          →
        </Link>
      ) : null}
    </nav>
  )
}
