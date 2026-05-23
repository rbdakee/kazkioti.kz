'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { DealersMap, type DealerPoint } from '@/components/ui/Map/DealersMap'
import { cn } from '@/lib/utils/cn'
import type { Dealer } from '@/lib/data/dealers'

export interface DealersDirectoryProps {
  dealers: readonly Dealer[]
  regions: readonly string[]
}

function dealerToPoint(dealer: Dealer): DealerPoint {
  return {
    id: dealer.id,
    city: dealer.name,
    type: dealer.id === 'badam' ? 'factory' : 'dealer',
    cx: dealer.cx,
    cy: dealer.cy,
    address: dealer.address,
    phone: dealer.phone,
    hours: dealer.hours,
    labelOffsetY: dealer.labelOffsetY,
  }
}

export function DealersDirectory({ dealers, regions }: DealersDirectoryProps) {
  const t = useTranslations('dealers')
  const tCommon = useTranslations('common')
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('')
  const [activeId, setActiveId] = useState<string | undefined>(dealers[0]?.id)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return dealers.filter((dealer) => {
      if (region && dealer.region !== region) return false
      if (!q) return true
      return (
        dealer.name.toLowerCase().includes(q) ||
        dealer.region.toLowerCase().includes(q) ||
        dealer.address.toLowerCase().includes(q)
      )
    })
  }, [dealers, query, region])

  const active = dealers.find((dealer) => dealer.id === activeId) ?? null
  const mapPoints = filtered.map(dealerToPoint)

  const regionOptions = regions.map((value) => ({ value, label: value }))

  function resetFilters() {
    setQuery('')
    setRegion('')
  }

  return (
    <div className="grid min-h-[70vh] grid-cols-1 border-y border-border lg:grid-cols-[380px_1fr]">
      <aside className="flex flex-col gap-4 bg-bg-soft p-6 lg:border-r lg:border-border">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-mono-label uppercase tracking-widest text-text-muted">
            <span className="text-brand-red">01</span> · {t('listHeading')}
          </span>
          <span className="font-mono text-mono-label uppercase tracking-widest text-text-faint">
            {filtered.length} / {dealers.length}
          </span>
        </div>
        <Input
          type="search"
          aria-label={t('searchPlaceholder')}
          placeholder={t('searchPlaceholder')}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Select
          aria-label={t('filterRegion')}
          placeholder={t('filterRegion')}
          value={region}
          onChange={(event) => setRegion(event.target.value)}
          options={regionOptions}
        />
        {filtered.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-4 text-body-s text-text-muted">
            <p>{t('listEmpty')}</p>
            <button
              type="button"
              className="mt-3 font-mono text-mono-label uppercase tracking-widest text-brand-red hover:underline"
              onClick={resetFilters}
            >
              {t('resetFilters')}
            </button>
          </div>
        ) : (
          <ul className="flex max-h-[600px] flex-col gap-1 overflow-y-auto pr-1">
            {filtered.map((dealer) => {
              const isActive = dealer.id === activeId
              const isFactory = dealer.id === 'badam'
              return (
                <li key={dealer.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(dealer.id)}
                    aria-pressed={isActive}
                    className={cn(
                      'flex w-full flex-col gap-1 rounded-md border-l-2 border-transparent px-4 py-3 text-left transition-colors',
                      isActive ? 'border-brand-red bg-bg-default' : 'hover:bg-bg-default',
                      isFactory && 'bg-gradient-to-r from-brand-red/10 to-transparent',
                    )}
                  >
                    <span className="font-heading text-body-l font-semibold uppercase text-text-primary">
                      {dealer.name}
                    </span>
                    <span className="text-body-s text-text-muted">{dealer.address}</span>
                    <span className="font-mono text-[11px] text-text-faint">
                      {dealer.phone} · {dealer.hours}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </aside>

      <div className="relative flex flex-col gap-6 bg-bg-muted p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-mono-label uppercase tracking-widest text-text-muted">
            <span className="mr-2 inline-block h-3 w-3 rounded-full bg-brand-red align-middle" aria-hidden="true" />
            {t('listHeading')}
          </span>
          <span className="font-mono text-mono-label uppercase tracking-widest text-text-faint">
            KZ · {regions.length} {tCommon('region')}
          </span>
        </div>
        <DealersMap dealers={mapPoints} activeId={activeId} onSelect={setActiveId} />
        {active ? <DealerCard dealer={active} onClose={() => setActiveId(undefined)} /> : null}
      </div>
    </div>
  )
}

interface DealerCardProps {
  dealer: Dealer
  onClose: () => void
}

function DealerCard({ dealer, onClose }: DealerCardProps) {
  const t = useTranslations('dealers')
  const tCommon = useTranslations('common')
  const label = dealer.id === 'badam' ? t('typeFactory') : t('listHeading')

  return (
    <article className="rounded-lg border border-border bg-bg-default p-5 shadow-card lg:absolute lg:bottom-6 lg:left-6 lg:w-[340px] lg:max-w-[calc(100%-3rem)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            {label}
          </span>
          <h3 className="mt-1 font-heading text-h3 text-text-primary">{dealer.name}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={tCommon('close')}
          className="text-2xl leading-none text-text-muted hover:text-text-primary"
        >
          ×
        </button>
      </div>
      <p className="mt-3 text-body-s text-text-muted">{dealer.address}</p>
      <dl className="mt-4 flex flex-col gap-3 border-t border-border pt-3 text-body-s">
        <div className="flex flex-col">
          <dt className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            {tCommon('phone')}
          </dt>
          <dd>
            <a className="font-medium text-text-primary hover:text-brand-red" href={dealer.phoneHref}>
              {dealer.phone}
            </a>
          </dd>
        </div>
        <div className="flex flex-col">
          <dt className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            {tCommon('hours')}
          </dt>
          <dd className="text-text-primary">{dealer.hours}</dd>
        </div>
        <div className="flex flex-col">
          <dt className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            {tCommon('region')}
          </dt>
          <dd className="text-text-primary">{dealer.region}</dd>
        </div>
      </dl>
      {dealer.placeholder ? (
        <p className="mt-3 rounded-md bg-bg-soft p-2 font-mono text-[10px] uppercase tracking-widest text-text-faint">
          {t('card.placeholderNote')}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asLink href={dealer.phoneHref} variant="primary" size="sm">
          {t('card.callButton')}
        </Button>
        <Button asLink href="#" variant="secondary" size="sm">
          {t('card.routeButton')}
        </Button>
      </div>
    </article>
  )
}
