import { cn } from '@/lib/utils/cn'

// Pin type still flags the factory (so it gets the pulse ring) but every pin
// now uses the same brand colour — the previous Dealer/Service/Factory split
// is hidden from the map UI.
export type MapPinType = 'factory' | 'dealer' | 'service'

export interface MapPinProps {
  cx: number
  cy: number
  type: MapPinType
  active?: boolean
  onClick?: () => void
  label?: string
  showLabel?: boolean
}

const PIN_FILL = '#e0001b'

export function MapPin({ cx, cy, type, active, onClick, label, showLabel = false }: MapPinProps) {
  const isInteractive = Boolean(onClick)
  return (
    <g
      transform={`translate(${cx} ${cy})${active ? ' scale(1.15)' : ''}`}
      className={cn(isInteractive && 'cursor-pointer')}
      onClick={onClick}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={label}
    >
      {type === 'factory' ? (
        <circle r={14} fill={PIN_FILL} opacity={0.18}>
          <animate attributeName="r" values="10;18;10" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.35;0;0.35" dur="2.4s" repeatCount="indefinite" />
        </circle>
      ) : null}
      {/* Larger transparent hit area so taps on mobile reliably land. */}
      {isInteractive ? (
        <circle r={18} fill="transparent" />
      ) : null}
      <circle r={active ? 8 : 6} fill={PIN_FILL} stroke="#ffffff" strokeWidth={2} />
      {showLabel && label ? (
        <text
          x={0}
          y={-12}
          textAnchor="middle"
          className="pointer-events-none select-none"
          style={{
            fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.4,
            fill: '#0a0a0a',
            paintOrder: 'stroke',
            stroke: '#ffffff',
            strokeWidth: 3,
            strokeLinejoin: 'round',
          }}
        >
          {label}
        </text>
      ) : null}
    </g>
  )
}
