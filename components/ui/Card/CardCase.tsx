import Link from 'next/link'
import type { CaseFrontmatter } from '@/lib/types/case'
import type { Locale } from '@/lib/i18n/routing'
import { cn } from '@/lib/utils/cn'

export interface CardCaseProps {
  caseItem: CaseFrontmatter
  locale: Locale
  className?: string
  labels: {
    hectares: string
    motorHours: string
    years: string
  }
}

export function CardCase({ caseItem, locale, className, labels }: CardCaseProps) {
  const href = `/${locale}/cases/${caseItem.slug}`
  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-md border border-border bg-bg-default transition-all duration-250 ease-kk hover:-translate-y-1 hover:shadow-card',
        className,
      )}
    >
      <Link href={href} className="block overflow-hidden bg-bg-muted">
        <div className="relative aspect-[4/3]">
          <img
            src={caseItem.coverImage}
            alt={caseItem.farmName}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-slow ease-kk group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-3 font-mono text-mono-label uppercase tracking-widest text-text-muted">
          <span>{caseItem.region}</span>
          <span aria-hidden="true">·</span>
          <span>{caseItem.tractorModel.toUpperCase()}</span>
        </div>
        <h3 className="font-heading text-h3 text-text-primary">
          <Link href={href} className="group-hover:text-brand-red">
            {caseItem.title}
          </Link>
        </h3>
        <p className="text-body-s text-text-muted">{caseItem.farmName}</p>
        {(caseItem.hectares || caseItem.motorHours || caseItem.years) && (
          <dl className="mt-2 grid grid-cols-3 gap-3 border-t border-dashed border-border pt-4">
            {caseItem.hectares !== undefined ? (
              <Metric value={formatNumber(caseItem.hectares, locale)} label={labels.hectares} />
            ) : null}
            {caseItem.motorHours !== undefined ? (
              <Metric value={formatNumber(caseItem.motorHours, locale)} label={labels.motorHours} />
            ) : null}
            {caseItem.years !== undefined ? (
              <Metric value={String(caseItem.years)} label={labels.years} />
            ) : null}
          </dl>
        )}
      </div>
    </article>
  )
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className="font-mono text-h3 text-text-primary">{value}</dd>
      <p className="mt-1 font-mono text-mono-label uppercase tracking-widest text-text-muted">
        {label}
      </p>
    </div>
  )
}

function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'kk' ? 'kk-KZ' : 'ru-RU').format(value)
}
