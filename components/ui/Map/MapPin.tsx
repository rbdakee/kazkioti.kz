import { cn } from '@/lib/utils/cn'

export type MapPinType = 'factory' | 'dealer' | 'service'

export interface MapPinProps {
  cx: number
  cy: number
  type: MapPinType
  active?: boolean
  onClick?: () => void
  label?: string
}

const fillByType: Record<MapPinType, string> = {
  factory: '#e0001b',
  dealer: '#0a0a0a',
  service: '#1853d6',
}

export function MapPin({ cx, cy, type, active, onClick, label }: MapPinProps) {
  const fill = fillByType[type]
  const isInteractive = Boolean(onClick)
  return (
    <g
      transform={`translate(${cx} ${cy})`}
      className={cn('cursor-pointer transition-transform', active && 'scale-110')}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={label}
    >
      {type === 'factory' ? (
        <circle r={14} fill={fill} opacity={0.18}>
          <animate attributeName="r" values="10;18;10" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.35;0;0.35" dur="2.4s" repeatCount="indefinite" />
        </circle>
      ) : null}
      <circle r={active ? 8 : 6} fill={fill} stroke="#ffffff" strokeWidth={2} />
    </g>
  )
}
