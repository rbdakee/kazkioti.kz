'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { MapPin, type MapPinType } from './MapPin'
import { cn } from '@/lib/utils/cn'

export interface DealerPoint {
  id: string
  city: string
  type: MapPinType
  cx: number
  cy: number
  address?: string
  phone?: string
  hours?: string
}

export type DealersMapVariant = 'all' | 'dealer' | 'service'

export interface DealersMapProps {
  dealers: readonly DealerPoint[]
  activeId?: string
  onSelect?: (id: string) => void
  interactive?: boolean
  className?: string
  variant?: DealersMapVariant
}

const KZ_PATH =
  'M60 220 L120 150 L220 130 L320 110 L420 100 L520 110 L620 130 L700 160 L760 200 L800 250 L780 310 L720 350 L640 370 L540 380 L440 380 L340 370 L240 350 L160 320 L100 280 Z'

export function DealersMap({
  dealers,
  activeId,
  onSelect,
  interactive = true,
  className,
  variant = 'all',
}: DealersMapProps) {
  const t = useTranslations('dealers')
  const [internalActive, setInternalActive] = useState<string | undefined>(activeId)
  const current = activeId ?? internalActive

  function handleSelect(id: string) {
    if (!interactive) return
    setInternalActive(id)
    onSelect?.(id)
  }

  const visible = dealers.filter((dealer) => {
    if (variant === 'all') return true
    if (variant === 'dealer') return dealer.type === 'dealer' || dealer.type === 'factory'
    return dealer.type === 'service' || dealer.type === 'factory'
  })

  return (
    <div className={cn('relative w-full', className)}>
      <svg
        viewBox="0 0 860 460"
        className="h-auto w-full"
        role="img"
        aria-label={t('mapAriaLabel')}
      >
        <path
          d={KZ_PATH}
          fill="#f6f5f2"
          stroke="rgba(15,15,15,0.18)"
          strokeWidth={1.5}
        />
        {visible.map((dealer) => (
          <MapPin
            key={dealer.id}
            cx={dealer.cx}
            cy={dealer.cy}
            type={dealer.type}
            active={current === dealer.id}
            onClick={interactive ? () => handleSelect(dealer.id) : undefined}
            label={interactive ? dealer.city : undefined}
          />
        ))}
      </svg>
    </div>
  )
}
