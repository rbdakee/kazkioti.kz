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
      const elapsed = timestamp - startTime
      const progress = Math.min(1, elapsed / durationMs)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) raf = requestAnimationFrame(start)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true
            startTime = performance.now()
            raf = requestAnimationFrame(start)
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.3 },
    )

    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [target, durationMs])

  return { ref, value }
}
