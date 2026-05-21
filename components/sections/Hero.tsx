'use client'

import { useEffect, useRef, useState } from 'react'
import { useMessages, useTranslations } from 'next-intl'
import type { Locale } from '@/lib/i18n/routing'
import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import { HeroMetric } from '@/components/ui/HeroMetric'
import { cn } from '@/lib/utils/cn'

export interface HeroProps {
  locale: Locale
}

interface Slide {
  eyebrow: string
  h1: string
  lede: string
}

const SLIDE_COUNT = 4
const INTERVAL_MS = 6000

export function Hero({ locale }: HeroProps) {
  const t = useTranslations('hero')
  const messages = useMessages() as { hero?: { slides?: Slide[] } }

  const slides: Slide[] = messages.hero?.slides ?? []

  const [slideIndex, setSlideIndex] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const reducedMotion = useRef(false)

  useEffect(() => {
    reducedMotion.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const startTimer = () => {
    if (reducedMotion.current) return
    intervalRef.current = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % SLIDE_COUNT)
    }, INTERVAL_MS)
  }

  const clearTimer = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    startTimer()
    return clearTimer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goTo = (index: number) => {
    clearTimer()
    setSlideIndex(index)
    startTimer()
  }

  const pause = () => clearTimer()

  const resume = () => {
    if (intervalRef.current === null) startTimer()
  }

  const slide = slides[slideIndex] ?? {
    eyebrow: t('eyebrow'),
    h1: t('h1'),
    lede: t('lede'),
  }

  return (
    <section className="relative isolate overflow-hidden bg-bg-invert">
      {/* Video background */}
      <div className="absolute inset-0 -z-10">
        <VideoPlayer
          type="loop"
          src="/videos/hero-loop.mp4"
          poster="/posters/hero-loop.jpg"
          alt="KAZKIOTI tractor at work"
          fill
        />
        {/* Dark gradient overlay for text readability */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/55 to-black/70"
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="relative mx-auto flex min-h-[88vh] max-w-container flex-col px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        {/* Location strip */}
        <div className="flex items-center justify-between font-mono text-mono-label uppercase tracking-widest text-white/60">
          <span>{t('location')}</span>
        </div>

        {/* Slides */}
        <div
          className="mt-10 flex max-w-4xl flex-col gap-6"
          onMouseEnter={pause}
          onMouseLeave={resume}
          onFocus={pause}
          onBlur={resume}
        >
          <div key={slideIndex} className="hero-slide-enter flex flex-col gap-4">
            <Eyebrow className="text-white/70">{slide.eyebrow}</Eyebrow>
            <h1 className="font-heading text-display text-white">{slide.h1}</h1>
            <p className="max-w-2xl text-lede text-white/80">{slide.lede}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <Button asLink href={`/${locale}/tractors`} variant="primary" size="lg" className="font-semibold text-white">
              {t('ctaCatalog')}
            </Button>
            <Button asLink href={`/${locale}/contacts`} variant="onDark" size="lg" className="font-semibold text-white">
              {t('ctaContact')}
            </Button>
          </div>

          {/* Dot navigation */}
          <div className="mt-2 flex items-center gap-2" role="tablist" aria-label="Hero slides">
            {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                onClick={() => goTo(i)}
                aria-label={`Слайд ${i + 1} из ${SLIDE_COUNT}`}
                aria-selected={i === slideIndex}
                className={cn(
                  'h-2 rounded-full transition-all duration-250',
                  i === slideIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70',
                )}
              />
            ))}
          </div>
        </div>

        {/* Metrics — pushed to bottom with mt-auto */}
        <div className="mt-auto grid grid-cols-2 gap-6 border-t border-white/15 pt-8 sm:grid-cols-3">
          <HeroMetric value={10} label={t('metricYears')} variant="onDark" />
          <HeroMetric value={6} label={t('metricModels')} variant="onDark" />
          <HeroMetric value={30} suffix="%" label={t('metricSubsidy')} variant="onDark" />
        </div>
      </div>
    </section>
  )
}
