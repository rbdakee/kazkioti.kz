'use client'

import { useEffect, useRef, type RefObject } from 'react'

export function useReveal<T extends HTMLElement>(): RefObject<T> {
  const ref = useRef<T>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      node.classList.add('in')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            observer.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return ref
}
