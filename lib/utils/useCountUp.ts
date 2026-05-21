'use client'

import { useEffect, useRef, useState } from 'react'

export interface CountUpOptions {
  target: number
  durationMs?: number
}

export function useCountUp({ target, durationMs = 1200 }: CountUpOptions): {
  ref: React.RefObject<HTMLSpanElement>
  value: number
} {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      setValue(target)
      return
    }

    let raf = 0
    let started = false
    let startTime = 0
    const start = (timestamp: number) => {
      if (startTime === 0) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(1, elapsed / durationMs)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) raf = requestAnimationFrame(start)
    }

    const begin = () => {
      if (started) return
      started = true
      startTime = 0
      raf = requestAnimationFrame(start)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            begin()
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(node)

    // Fallback: if IO never fires within 800ms, start the animation anyway
    const fallback = window.setTimeout(begin, 800)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
      window.clearTimeout(fallback)
    }
  }, [target, durationMs])

  return { ref, value }
}
