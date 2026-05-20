import Link from 'next/link'
import type { NewsFrontmatter } from '@/lib/types/news'
import type { Locale } from '@/lib/i18n/routing'
import { cn } from '@/lib/utils/cn'

export interface CardNewsProps {
  article: NewsFrontmatter
  locale: Locale
  tagLabel: string
  className?: string
}

export function CardNews({ article, locale, tagLabel, className }: CardNewsProps) {
  const href = `/${locale}/news/${article.slug}`
  return (
    <article
      className={cn(
        'group flex flex-col gap-4 rounded-md border border-border bg-bg-default p-4 transition-all duration-250 ease-kk hover:-translate-y-1 hover:shadow-card',
        className,
      )}
    >
      <Link href={href} className="block overflow-hidden rounded-md bg-bg-muted">
        <div className="relative aspect-[16/10]">
          <img
            src={article.coverImage}
            alt={article.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-slow ease-kk group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="flex items-center gap-3 font-mono text-mono-label uppercase tracking-widest text-text-muted">
        <time dateTime={article.date}>{formatDate(article.date, locale)}</time>
        <span aria-hidden="true">·</span>
        <span>{tagLabel}</span>
      </div>
      <h3 className="font-heading text-h3 text-text-primary">
        <Link href={href} className="group-hover:text-brand-red">
          {article.title}
        </Link>
      </h3>
      <p className="text-body-m text-text-muted">{article.excerpt}</p>
    </article>
  )
}

function formatDate(iso: string, locale: Locale): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat(locale === 'kk' ? 'kk-KZ' : 'ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}
