'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { Locale } from '@/lib/i18n/routing'
import type { TractorFrontmatter } from '@/lib/types/tractor'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'

export interface CompareTableProps {
  tractors: readonly TractorFrontmatter[]
  locale: Locale
}

type BestDirection = 'higher' | 'lower' | 'none'

interface RowConfig {
  key: string
  labelKey:
    | 'rowPower'
    | 'rowEngineModel'
    | 'rowCylinders'
    | 'rowEco'
    | 'rowGears'
    | 'rowDrive'
    | 'rowPto'
    | 'rowMass'
    | 'rowLength'
    | 'rowTank'
    | 'rowWarranty'
  getRaw: (t: TractorFrontmatter) => string
  getFormatted?: (t: TractorFrontmatter, fmt: (key: string) => string) => string
  numeric?: (t: TractorFrontmatter) => number | null
  bestDirection: BestDirection
}

interface GroupConfig {
  titleKey: 'groupEngine' | 'groupTransmission' | 'groupDimensions' | 'groupService'
  rows: readonly RowConfig[]
}

const GROUPS: readonly GroupConfig[] = [
  {
    titleKey: 'groupEngine',
    rows: [
      {
        key: 'power',
        labelKey: 'rowPower',
        getRaw: (t) => String(t.power),
        getFormatted: (t, u) => `${t.power} ${u('hp')}`,
        numeric: (t) => t.power,
        bestDirection: 'higher',
      },
      {
        key: 'engine-model',
        labelKey: 'rowEngineModel',
        getRaw: (t) => t.engineModel,
        bestDirection: 'none',
      },
      {
        key: 'cylinders',
        labelKey: 'rowCylinders',
        getRaw: (t) => String(t.engineCylinders),
        numeric: (t) => t.engineCylinders,
        bestDirection: 'higher',
      },
      {
        key: 'eco',
        labelKey: 'rowEco',
        getRaw: (t) => t.engineEcoClass,
        bestDirection: 'none',
      },
    ],
  },
  {
    titleKey: 'groupTransmission',
    rows: [
      {
        key: 'gears',
        labelKey: 'rowGears',
        getRaw: (t) => t.transmission,
        bestDirection: 'none',
      },
      {
        key: 'drive',
        labelKey: 'rowDrive',
        getRaw: (t) => t.driveType,
        bestDirection: 'none',
      },
      {
        key: 'pto',
        labelKey: 'rowPto',
        getRaw: (t) => t.pto,
        bestDirection: 'none',
      },
    ],
  },
  {
    titleKey: 'groupDimensions',
    rows: [
      {
        key: 'mass',
        labelKey: 'rowMass',
        getRaw: (t) => String(t.weight),
        getFormatted: (t, u) => `${t.weight} ${u('kg')}`,
        numeric: (t) => t.weight,
        bestDirection: 'lower',
      },
      {
        key: 'length',
        labelKey: 'rowLength',
        getRaw: (t) => String(t.lengthMm),
        getFormatted: (t, u) => `${t.lengthMm} ${u('mm')}`,
        numeric: (t) => t.lengthMm,
        bestDirection: 'none',
      },
      {
        key: 'tank',
        labelKey: 'rowTank',
        getRaw: (t) => String(t.fuelTank),
        getFormatted: (t, u) => `${t.fuelTank} ${u('liters')}`,
        numeric: (t) => t.fuelTank,
        bestDirection: 'higher',
      },
    ],
  },
  {
    titleKey: 'groupService',
    rows: [
      {
        key: 'warranty',
        labelKey: 'rowWarranty',
        getRaw: (t) => `${t.warrantyYears} / ${t.warrantyHours}`,
        getFormatted: (t, u) => `${t.warrantyYears} ${u('years')} / ${t.warrantyHours} ${u('hours')}`,
        bestDirection: 'none',
      },
    ],
  },
]

function parseModelsParam(value: string | null): readonly string[] {
  if (!value) return []
  return value
    .split(',')
    .map((slug) => slug.trim())
    .filter((slug) => slug.length > 0)
}

export function CompareTable({ tractors, locale }: CompareTableProps) {
  const t = useTranslations('compare')
  const tForms = useTranslations('forms')
  const tUnits = useTranslations('units')
  const searchParams = useSearchParams()

  const initialSlugs = useMemo(() => {
    const fromQuery = parseModelsParam(searchParams.get('models'))
    const valid = fromQuery.filter((slug) => tractors.some((tractor) => tractor.slug === slug))
    if (valid.length > 0) return valid.slice(0, 3)
    return tractors.slice(0, 2).map((tractor) => tractor.slug)
  }, [searchParams, tractors])

  const [slots, setSlots] = useState<Array<string | null>>(() => {
    const padded: Array<string | null> = [...initialSlugs]
    while (padded.length < 3) padded.push(null)
    return padded.slice(0, 3)
  })

  function setSlot(index: number, slug: string) {
    setSlots((prev) => {
      const next = [...prev]
      next[index] = slug || null
      return next
    })
  }

  function clearSlot(index: number) {
    setSlots((prev) => {
      const next = [...prev]
      next[index] = null
      return next
    })
  }

  const selected: Array<TractorFrontmatter | null> = slots.map(
    (slug) => tractors.find((tractor) => tractor.slug === slug) ?? null,
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {selected.map((tractor, index) => (
          <SlotCard
            key={index}
            slotIndex={index}
            tractor={tractor}
            allTractors={tractors}
            locale={locale}
            onChange={setSlot}
            onClear={clearSlot}
            highlight={index === 1}
          />
        ))}
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-bg-default">
        <div className="min-w-[760px]">
          {GROUPS.map((group) => (
            <div key={group.titleKey}>
              <div className="grid grid-cols-[24ch_1fr_1fr_1fr] gap-4 border-t border-border bg-bg-soft px-5 py-4 font-mono text-mono-label uppercase tracking-widest text-text-muted first:border-t-0">
                <span>{t(group.titleKey)}</span>
                <span />
                <span />
                <span />
              </div>
              {group.rows.map((row) => {
                const cells = selected.map((tractor) =>
                  tractor
                    ? (row.getFormatted?.(tractor, tUnits) ?? row.getRaw(tractor))
                    : null,
                )
                const bestIndex = computeBest(row, selected)
                return (
                  <div
                    key={row.key}
                    className="grid grid-cols-[24ch_1fr_1fr_1fr] items-center gap-4 border-t border-dashed border-border px-5 py-3.5"
                  >
                    <span className="text-body-s text-text-muted">{t(row.labelKey)}</span>
                    {cells.map((value, idx) => (
                      <span
                        key={idx}
                        className={cn(
                          'font-heading text-body-l font-medium tracking-tight',
                          value === null
                            ? 'text-text-faint font-normal text-body-s'
                            : bestIndex === idx
                              ? 'rounded-sm bg-brand-red/10 px-2 py-1 text-brand-red'
                              : 'text-text-primary',
                        )}
                      >
                        {value ?? '—'}
                      </span>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}

          <div className="grid grid-cols-[24ch_1fr_1fr_1fr] items-center gap-4 bg-bg-soft px-5 py-6">
            <span />
            {selected.map((tractor, idx) => (
              <div key={idx}>
                {tractor ? (
                  <Button
                    asLink
                    href={`/${locale}/contacts?model=${tractor.slug}`}
                    variant={idx === 1 ? 'primary' : 'secondary'}
                    size="sm"
                  >
                    {t('ctaContactModel')}
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-body-s text-text-muted">
          <span className="mr-2 inline-block rounded-sm bg-brand-red/10 px-2 py-1 font-mono text-mono-label uppercase tracking-widest text-brand-red">
            {t('legendBest')}
          </span>
          {t('legendBestHint')}
        </p>
        <Button asLink href={`/${locale}/contacts`} variant="primary" size="lg">
          {tForms('submit')}
        </Button>
      </div>
    </div>
  )
}

function computeBest(
  row: RowConfig,
  selected: Array<TractorFrontmatter | null>,
): number | null {
  if (row.bestDirection === 'none' || !row.numeric) return null
  const numbers = selected.map((tractor) => (tractor ? (row.numeric?.(tractor) ?? null) : null))
  const defined = numbers.filter((value): value is number => value !== null)
  if (defined.length < 2) return null
  const target = row.bestDirection === 'higher' ? Math.max(...defined) : Math.min(...defined)
  return numbers.findIndex((value) => value === target)
}

interface SlotCardProps {
  slotIndex: number
  tractor: TractorFrontmatter | null
  allTractors: readonly TractorFrontmatter[]
  locale: Locale
  onChange: (index: number, slug: string) => void
  onClear: (index: number) => void
  highlight?: boolean
}

function SlotCard({ slotIndex, tractor, allTractors, locale, onChange, onClear, highlight }: SlotCardProps) {
  const t = useTranslations('compare')
  const tUnits = useTranslations('units')

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-md border bg-bg-default p-4',
        highlight ? 'border-brand-red shadow-card' : 'border-border',
        tractor === null && 'bg-bg-muted',
      )}
    >
      <div className="overflow-hidden rounded-sm bg-bg-muted" style={{ aspectRatio: '4 / 3' }}>
        {tractor ? (
          <img
            src={tractor.heroImage}
            alt={tractor.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono text-mono-label uppercase tracking-widest text-text-muted">
            {t('emptySlot')}
          </div>
        )}
      </div>
      <select
        value={tractor?.slug ?? ''}
        onChange={(event) => onChange(slotIndex, event.target.value)}
        className="rounded-sm border border-border-strong bg-transparent px-3 py-2 font-heading text-body-m font-semibold text-text-primary"
      >
        <option value="">{t('selectPlaceholder')}</option>
        {allTractors.map((option) => (
          <option key={option.slug} value={option.slug}>
            {option.name} · {option.power} {tUnits('hp')}
          </option>
        ))}
      </select>
      <div className="flex items-center justify-between gap-2">
        {tractor ? (
          <Link
            href={`/${locale}/tractors/${tractor.slug}`}
            className="font-mono text-mono-label uppercase tracking-widest text-text-primary hover:text-brand-red"
          >
            {t('detailsLink')} →
          </Link>
        ) : (
          <span />
        )}
        {tractor ? (
          <button
            type="button"
            onClick={() => onClear(slotIndex)}
            className="font-mono text-mono-label uppercase tracking-widest text-text-muted hover:text-text-primary"
          >
            {t('removeModel')}
          </button>
        ) : null}
      </div>
    </div>
  )
}
