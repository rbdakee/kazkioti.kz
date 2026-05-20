'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { TractorFrontmatter } from '@/lib/types/tractor'
import type { Locale } from '@/lib/i18n/routing'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'

export interface CardTractorProps {
  tractor: TractorFrontmatter
  locale: Locale
  selectedForCompare?: boolean
  onToggleCompare?: (slug: string) => void
  className?: string
}

export function CardTractor({
  tractor,
  locale,
  selectedForCompare,
  onToggleCompare,
  className,
}: CardTractorProps) {
  const t = useTranslations('tractors')
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hovering, setHovering] = useState(false)
  const [reduced, setReduced] = useState(false)
  const detailHref = `/${locale}/tractors/${tractor.slug}`
  const hasVideoLoop = Boolean(tractor.videoLoop)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const match = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(match.matches)
    const listener = (event: MediaQueryListEvent) => setReduced(event.matches)
    match.addEventListener('change', listener)
    return () => match.removeEventListener('change', listener)
  }, [])

  function handleEnter() {
    if (!hasVideoLoop || reduced) return
    setHovering(true)
    const video = videoRef.current
    if (video) {
      video.currentTime = 0
      video.play().catch(() => {})
    }
  }

  function handleLeave() {
    if (!hasVideoLoop || reduced) return
    setHovering(false)
    const video = videoRef.current
    if (video) {
      video.pause()
      video.currentTime = 0
    }
  }

  return (
    <article
      className={cn(
        'group flex flex-col gap-5 rounded-md border border-border bg-bg-default p-6 transition-all duration-250 ease-kk hover:-translate-y-1 hover:shadow-card',
        className,
      )}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-bg-muted">
        <img
          src={tractor.heroImage}
          alt={tractor.name}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-250 ease-kk',
            hovering && hasVideoLoop ? 'opacity-0' : 'opacity-100',
          )}
          loading="lazy"
        />
        {hasVideoLoop ? (
          <video
            ref={videoRef}
            src={tractor.videoLoop}
            poster={tractor.heroImage}
            muted
            loop
            playsInline
            preload="none"
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-opacity duration-250 ease-kk',
              hovering ? 'opacity-100' : 'opacity-0',
            )}
            aria-hidden="true"
          />
        ) : null}
        {tractor.status === 'coming-soon' ? (
          <span className="absolute left-3 top-3 rounded-pill bg-text-primary px-3 py-1 font-mono text-mono-label uppercase tracking-widest text-white">
            {t('comingSoon')}
          </span>
        ) : null}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="font-heading text-h3 text-text-primary">{tractor.name}</h3>
          <p className="text-body-s text-text-muted">{tractor.subtitle}</p>
        </div>
        <div className="font-mono text-3xl text-text-primary">
          {tractor.power}
          <span className="ml-1 text-body-s text-text-muted">{t('powerLabel')}</span>
        </div>
      </div>
      <ul className="flex flex-wrap gap-2 font-mono text-mono-label uppercase tracking-widest text-text-muted">
        <li className="rounded-pill border border-border px-3 py-1">{tractor.driveType}</li>
        <li className="rounded-pill border border-border px-3 py-1">{tractor.transmission}</li>
        <li className="rounded-pill border border-border px-3 py-1">{tractor.fuelTank} л</li>
      </ul>
      <div className="mt-auto flex items-center justify-between gap-3">
        <Link
          href={detailHref}
          className="font-mono text-mono-label uppercase tracking-widest text-text-primary hover:text-brand-red"
        >
          {t('details')}
        </Link>
        {onToggleCompare ? (
          <button
            type="button"
            onClick={() => onToggleCompare(tractor.slug)}
            aria-pressed={selectedForCompare}
            className={cn(
              'rounded-pill border px-3 py-1 font-mono text-mono-label uppercase tracking-widest transition-colors',
              selectedForCompare
                ? 'border-text-primary bg-text-primary text-white'
                : 'border-border-strong text-text-primary hover:border-text-primary',
            )}
          >
            {t('compare')}
          </button>
        ) : null}
      </div>
    </article>
  )
}
