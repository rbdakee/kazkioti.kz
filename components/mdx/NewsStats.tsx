import { cn } from '@/lib/utils/cn'

export interface NewsStatsItem {
  value: string
  label: string
}

export interface NewsStatsProps {
  items: ReadonlyArray<NewsStatsItem>
  className?: string
}

export function NewsStats({ items, className }: NewsStatsProps) {
  if (items.length === 0) return null
  return (
    <dl
      className={cn(
        'my-6 grid grid-cols-1 overflow-hidden rounded-md border border-border bg-bg-default sm:grid-cols-3',
        className,
      )}
    >
      {items.map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          className="flex flex-col gap-2 border-border p-5 [&:not(:last-child)]:border-b sm:[&:not(:last-child)]:border-b-0 sm:[&:not(:last-child)]:border-r"
        >
          <dt className="font-mono text-mono-label uppercase tracking-widest text-text-muted">
            {item.label}
          </dt>
          <dd className="font-mono text-h3 leading-none text-text-primary">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
