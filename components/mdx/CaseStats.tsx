import { getLocale, getTranslations } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import { cn } from '@/lib/utils/cn'

export interface CaseStatsProps {
  hectares?: number
  hours?: number
  years?: number
  tractors?: number
  className?: string
}

interface Cell {
  key: string
  value: string
  label: string
}

export async function CaseStats({ hectares, hours, years, tractors, className }: CaseStatsProps) {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations({ locale, namespace: 'cases' })
  const formatter = new Intl.NumberFormat(locale === 'kk' ? 'kk-KZ' : 'ru-RU')

  const cells: Cell[] = []
  if (typeof hectares === 'number') {
    cells.push({ key: 'hectares', value: formatter.format(hectares), label: t('metricHectares') })
  }
  if (typeof hours === 'number') {
    cells.push({ key: 'hours', value: formatter.format(hours), label: t('metricMotorHours') })
  }
  if (typeof years === 'number') {
    cells.push({ key: 'years', value: String(years), label: t('metricYears') })
  }
  if (typeof tractors === 'number') {
    cells.push({ key: 'tractors', value: String(tractors), label: t('metricMachines') })
  }

  if (cells.length === 0) return null

  const columns =
    cells.length >= 4
      ? 'sm:grid-cols-2 lg:grid-cols-4'
      : cells.length === 3
        ? 'sm:grid-cols-3'
        : cells.length === 2
          ? 'sm:grid-cols-2'
          : 'sm:grid-cols-1'

  return (
    <dl
      className={cn(
        'my-6 grid grid-cols-1 overflow-hidden rounded-md border border-border bg-bg-default',
        columns,
        className,
      )}
    >
      {cells.map((cell, index) => (
        <div
          key={cell.key}
          className={cn(
            'flex flex-col gap-2 border-border p-5',
            index < cells.length - 1 && 'border-b sm:border-b-0 sm:border-r',
          )}
        >
          <dt className="font-mono text-mono-label uppercase tracking-widest text-text-muted">
            {cell.label}
          </dt>
          <dd className="font-mono text-h3 leading-none text-text-primary">{cell.value}</dd>
        </div>
      ))}
    </dl>
  )
}
