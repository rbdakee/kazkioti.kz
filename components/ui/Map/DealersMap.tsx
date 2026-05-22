'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
} from 'react'
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
  phoneHref?: string
  hours?: string
}

// Kept for backwards-compatible call sites — variant filtering is no longer
// rendered, every pin is shown as a single category.
export type DealersMapVariant = 'all' | 'dealer' | 'service'

export interface DealersMapProps {
  dealers: readonly DealerPoint[]
  activeId?: string
  onSelect?: (id: string) => void
  interactive?: boolean
  className?: string
  variant?: DealersMapVariant
  showZoomControls?: boolean
  showLabels?: boolean
  /**
   * Render a compact selected-pin card inside the map container.
   * Use this on pages that don't have an external list/sidebar
   * (home preview, /parts service map, etc.).
   */
  embedSelectedCard?: boolean
}

const BASE_VIEWBOX = KZ_VIEWBOX.split(' ').map(Number) as [number, number, number, number]
const MIN_ZOOM = 1
const MAX_ZOOM = 6
const WHEEL_ZOOM_STEP = 1.12
const PINCH_DEAD_ZONE_PX = 4

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function DealersMap({
  dealers,
  activeId,
  onSelect,
  interactive = true,
  className,
  showZoomControls = true,
  showLabels = true,
  embedSelectedCard = false,
}: DealersMapProps) {
  const t = useTranslations('dealers')
  const [internalActive, setInternalActive] = useState<string | undefined>(activeId)
  const [zoom, setZoom] = useState(1)
  // pan is expressed in SVG user units, applied on top of the focus center
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    pointerId: number
    startClientX: number
    startClientY: number
    startPanX: number
    startPanY: number
    moved: boolean
  } | null>(null)
  const pinchRef = useRef<{ startDistance: number; startZoom: number } | null>(null)
  const userInteractedRef = useRef(false)

  const current = activeId ?? internalActive

  // Reset user pan whenever the selection changes from outside (sidebar click,
  // direct prop update). This keeps the active pin centred on selection,
  // without fighting user-driven pans.
  useEffect(() => {
    if (!userInteractedRef.current) return
    setPan({ x: 0, y: 0 })
    userInteractedRef.current = false
  }, [current])

  const handleSelect = useCallback(
    (id: string) => {
      if (!interactive) return
      setInternalActive(id)
      onSelect?.(id)
    },
    [interactive, onSelect],
  )

  const viewBox = useMemo(() => {
    const [bx, by, bw, bh] = BASE_VIEWBOX
    const focus = dealers.find((dealer) => dealer.id === current)
    const newW = bw / zoom
    const newH = bh / zoom
    const centerX = (focus ? focus.cx : bx + bw / 2) + pan.x
    const centerY = (focus ? focus.cy : by + bh / 2) + pan.y
    const minX = clamp(centerX - newW / 2, bx, bx + bw - newW)
    const minY = clamp(centerY - newH / 2, by, by + bh - newH)
    return { value: `${minX} ${minY} ${newW} ${newH}`, w: newW, h: newH, minX, minY }
  }, [dealers, current, zoom, pan])

  const clampZoom = useCallback((next: number) => clamp(next, MIN_ZOOM, MAX_ZOOM), [])

  // Capture wheel events on the container with passive:false so we can
  // preventDefault and own page-scrolling while the cursor sits on the map.
  useEffect(() => {
    if (!interactive) return
    const el = containerRef.current
    if (!el) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      userInteractedRef.current = true
      const factor = event.deltaY < 0 ? WHEEL_ZOOM_STEP : 1 / WHEEL_ZOOM_STEP
      setZoom((value) => clampZoom(value * factor))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [interactive, clampZoom])

  // Convert client-pixel delta into SVG-unit delta so drag feels 1:1.
  const clientToSvgDelta = useCallback(
    (deltaClientX: number, deltaClientY: number) => {
      const el = containerRef.current
      if (!el) return { dx: 0, dy: 0 }
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return { dx: 0, dy: 0 }
      return {
        dx: (deltaClientX * viewBox.w) / rect.width,
        dy: (deltaClientY * viewBox.h) / rect.height,
      }
    },
    [viewBox.w, viewBox.h],
  )

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive) return
    // Pinch is handled via touch events; ignore secondary pointers here.
    if (event.pointerType === 'touch' && !event.isPrimary) return
    if (event.button !== 0 && event.button !== undefined && event.pointerType === 'mouse') return
    dragRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
      moved: false,
    }
    // Note: we don't setPointerCapture here. Capturing on every press would
    // re-target the follow-up click event away from the SVG pin and break
    // tap-to-select. Capture is acquired lazily on first real drag motion.
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    // While we're in a pinch, the touch handler owns the gesture.
    if (pinchRef.current) return
    const deltaClientX = event.clientX - drag.startClientX
    const deltaClientY = event.clientY - drag.startClientY
    if (
      !drag.moved &&
      Math.hypot(deltaClientX, deltaClientY) < 4
    ) {
      return
    }
    if (!drag.moved) {
      drag.moved = true
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        /* setPointerCapture can throw on transient pointer states */
      }
    }
    userInteractedRef.current = true
    // Drag moves the content under the viewport — viewBox center shifts the
    // opposite direction.
    const { dx, dy } = clientToSvgDelta(-deltaClientX, -deltaClientY)
    setPan({ x: drag.startPanX + dx, y: drag.startPanY + dy })
  }

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId)
      } catch {
        /* ignore */
      }
    }
  }

  // Two-finger pinch zoom.
  const onTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (!interactive) return
    const a = event.touches[0]
    const b = event.touches[1]
    if (event.touches.length >= 2 && a && b) {
      const dx = a.clientX - b.clientX
      const dy = a.clientY - b.clientY
      pinchRef.current = { startDistance: Math.hypot(dx, dy), startZoom: zoom }
      // Cancel any in-flight pan from the first finger.
      dragRef.current = null
    }
  }

  const onTouchMove = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (!interactive) return
    const a = event.touches[0]
    const b = event.touches[1]
    if (!pinchRef.current || !a || !b) return
    const dx = a.clientX - b.clientX
    const dy = a.clientY - b.clientY
    const distance = Math.hypot(dx, dy)
    if (Math.abs(distance - pinchRef.current.startDistance) < PINCH_DEAD_ZONE_PX) return
    userInteractedRef.current = true
    const ratio = distance / pinchRef.current.startDistance
    setZoom(clampZoom(pinchRef.current.startZoom * ratio))
  }

  const onTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (!interactive) return
    if (event.touches.length < 2) {
      pinchRef.current = null
    }
  }

  // Pin click handler: skip the click if the user actually dragged.
  const handlePinClick = useCallback(
    (id: string) => {
      const drag = dragRef.current
      if (drag?.moved) return
      handleSelect(id)
    },
    [handleSelect],
  )

  const activeDealer = embedSelectedCard
    ? dealers.find((dealer) => dealer.id === current)
    : null

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full select-none',
        interactive && zoom > 1 && 'cursor-grab active:cursor-grabbing',
        className,
      )}
      style={{ touchAction: interactive ? 'none' : 'auto' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <svg
        viewBox={viewBox.value}
        className="h-auto w-full"
        role="img"
        aria-label={t('mapAriaLabel')}
      >
        <g transform={KZ_PATH_TRANSFORM} fill="#f6f5f2" stroke="rgba(15,15,15,0.18)" strokeWidth={6}>
          <path d={KZ_PATH_MAIN} />
          <path d={KZ_PATH_LAKE} fill="#dfe9f4" />
        </g>
        {dealers.map((dealer) => (
          <MapPin
            key={dealer.id}
            cx={dealer.cx}
            cy={dealer.cy}
            type={dealer.type}
            active={current === dealer.id}
            onClick={interactive ? () => handlePinClick(dealer.id) : undefined}
            label={dealer.city}
            showLabel={showLabels}
          />
        ))}
      </svg>

      {showZoomControls && interactive ? (
        <div className="pointer-events-none absolute right-3 top-3 flex flex-col gap-2">
          <ZoomButton
            label="+"
            ariaLabel="Zoom in"
            onClick={() => {
              userInteractedRef.current = true
              setZoom((value) => clampZoom(value + 0.5))
            }}
            disabled={zoom >= MAX_ZOOM}
          />
          <ZoomButton
            label="−"
            ariaLabel="Zoom out"
            onClick={() => {
              userInteractedRef.current = true
              setZoom((value) => clampZoom(value - 0.5))
            }}
            disabled={zoom <= MIN_ZOOM}
          />
          <ZoomButton
            label="⤾"
            ariaLabel="Reset zoom"
            onClick={() => {
              userInteractedRef.current = false
              setZoom(1)
              setPan({ x: 0, y: 0 })
            }}
            disabled={zoom === 1 && pan.x === 0 && pan.y === 0}
          />
        </div>
      ) : null}

      {activeDealer ? (
        <EmbeddedDealerCard
          dealer={activeDealer}
          onClose={() => {
            setInternalActive(undefined)
            onSelect?.('')
          }}
        />
      ) : null}
    </div>
  )
}

interface ZoomButtonProps {
  label: string
  ariaLabel: string
  onClick: () => void
  disabled?: boolean
}

function ZoomButton({ label, ariaLabel, onClick, disabled }: ZoomButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={cn(
        'pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-bg-default text-text-primary shadow-card transition-colors',
        'hover:border-text-primary hover:bg-bg-muted',
        disabled && 'cursor-not-allowed opacity-40 hover:border-border hover:bg-bg-default',
      )}
    >
      <span aria-hidden="true" className="font-mono text-base leading-none">
        {label}
      </span>
    </button>
  )
}

interface EmbeddedDealerCardProps {
  dealer: DealerPoint
  onClose: () => void
}

function EmbeddedDealerCard({ dealer, onClose }: EmbeddedDealerCardProps) {
  const t = useTranslations('dealers')
  const tCommon = useTranslations('common')
  const label = dealer.type === 'factory' ? t('typeFactory') : t('listHeading')
  const phoneHref =
    dealer.phoneHref ?? (dealer.phone ? `tel:${dealer.phone.replace(/[^\d+]/g, '')}` : undefined)

  return (
    <article
      className="pointer-events-auto absolute bottom-3 left-3 right-3 max-w-[340px] rounded-lg border border-border bg-bg-default p-4 shadow-card sm:right-auto"
      onPointerDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            {label}
          </span>
          <h3 className="mt-1 font-heading text-body-l font-semibold text-text-primary">
            {dealer.city}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={tCommon('close')}
          className="text-xl leading-none text-text-muted hover:text-text-primary"
        >
          ×
        </button>
      </div>
      {dealer.address ? (
        <p className="mt-2 text-body-s text-text-muted">{dealer.address}</p>
      ) : null}
      <dl className="mt-3 flex flex-col gap-2 border-t border-border pt-3 text-body-s">
        {phoneHref ? (
          <div className="flex items-center justify-between gap-3">
            <dt className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              {tCommon('phone')}
            </dt>
            <dd>
              <a
                className="font-medium text-text-primary hover:text-brand-red"
                href={phoneHref}
              >
                {dealer.phone}
              </a>
            </dd>
          </div>
        ) : null}
        {dealer.hours ? (
          <div className="flex items-center justify-between gap-3">
            <dt className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              {tCommon('hours')}
            </dt>
            <dd className="text-text-primary">{dealer.hours}</dd>
          </div>
        ) : null}
      </dl>
    </article>
  )
}
