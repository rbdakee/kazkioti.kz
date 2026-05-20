'use client'

import type { ReactNode } from 'react'
import { useReveal } from '@/lib/utils/useReveal'
import { cn } from '@/lib/utils/cn'

export interface RevealProps {
  children: ReactNode
  stagger?: boolean
  className?: string
  as?: 'div' | 'section' | 'article' | 'ul'
}

export function Reveal({ children, stagger, className, as = 'div' }: RevealProps) {
  const ref = useReveal<HTMLDivElement>()
  const Tag = as as 'div'
  return (
    <Tag ref={ref} className={cn(stagger ? 'reveal-stagger' : 'reveal', className)}>
      {children}
    </Tag>
  )
}
