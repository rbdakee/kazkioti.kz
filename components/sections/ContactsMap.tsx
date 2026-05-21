'use client'

import { useState } from 'react'
import { DealersMap, type DealerPoint } from '@/components/ui/Map/DealersMap'
import type { Dealer } from '@/lib/data/dealers'

function dealerToPoint(dealer: Dealer): DealerPoint {
  const type: DealerPoint['type'] =
    dealer.id === 'badam'
      ? 'factory'
      : dealer.dealer && dealer.service
        ? 'dealer'
        : dealer.dealer
          ? 'dealer'
          : 'service'
  return {
    id: dealer.id,
    city: dealer.name,
    type,
    cx: dealer.cx,
    cy: dealer.cy,
    address: dealer.address,
    phone: dealer.phone,
    hours: dealer.hours,
  }
}

export interface ContactsMapProps {
  dealers: readonly Dealer[]
}

export function ContactsMap({ dealers }: ContactsMapProps) {
  const [activeId, setActiveId] = useState<string | undefined>('badam')
  const activeDealer = dealers.find((d) => d.id === activeId) ?? null
  const points = dealers.map(dealerToPoint)

  return (
    <div className="relative">
      <DealersMap
        dealers={points}
        activeId={activeId}
        onSelect={setActiveId}
        variant="all"
        className="rounded"
      />
      {activeDealer ? (
        <div className="mt-3 rounded border border-border bg-bg-soft p-4">
          <p className="font-mono text-mono-label uppercase tracking-widest text-text-muted">
            {activeDealer.name}
          </p>
          {activeDealer.address ? (
            <p className="mt-1 text-body-s text-text-primary">{activeDealer.address}</p>
          ) : null}
          {activeDealer.phone ? (
            <a
              href={activeDealer.phoneHref}
              className="mt-1 block font-mono text-body-s text-text-primary hover:text-brand-red"
            >
              {activeDealer.phone}
            </a>
          ) : null}
          {activeDealer.hours ? (
            <p className="mt-1 text-body-s text-text-muted">{activeDealer.hours}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
