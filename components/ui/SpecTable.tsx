import { cn } from '@/lib/utils/cn'

export interface SpecRow {
  label: string
  value: string
}

export interface SpecGroup {
  title: string
  rows: readonly SpecRow[]
}

export interface SpecTableProps {
  groups: readonly SpecGroup[]
  className?: string
}

export function SpecTable({ groups, className }: SpecTableProps) {
  return (
    <div className={cn('grid gap-6 md:grid-cols-2', className)}>
      {groups.map((group) => (
        <div
          key={group.title}
          className="rounded-md border border-border bg-bg-default p-6"
        >
          <h3 className="font-mono text-mono-label uppercase tracking-widest text-text-muted">
            {group.title}
          </h3>
          <dl className="mt-4 divide-y divide-dashed divide-border">
            {group.rows.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-4 py-3"
              >
                <dt className="text-body-m text-text-muted">{row.label}</dt>
                <dd className="font-mono text-body-m font-medium text-text-primary">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  )
}
