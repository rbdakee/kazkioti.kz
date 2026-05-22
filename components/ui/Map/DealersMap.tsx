'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { MapPin, type MapPinType } from './MapPin'
import { cn } from '@/lib/utils/cn'
import { KZ_PATH_LAKE, KZ_PATH_MAIN, KZ_PATH_TRANSFORM, KZ_VIEWBOX } from '@/lib/data/kz-map'

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
        viewBox={KZ_VIEWBOX}
        className="h-auto w-full"
        role="img"
        aria-label={t('mapAriaLabel')}
      >
        <g transform={KZ_PATH_TRANSFORM} fill="#f6f5f2" stroke="rgba(15,15,15,0.18)" strokeWidth={6}>
          <path d={KZ_PATH_MAIN} />
          <path d={KZ_PATH_LAKE} fill="#dfe9f4" />
        </g>
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
