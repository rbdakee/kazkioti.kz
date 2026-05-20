import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

export interface EyebrowProps {
  children: ReactNode
  className?: string
}

export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-3 font-mono text-eyebrow uppercase tracking-widest text-text-muted',
        'before:inline-block before:h-px before:w-6 before:bg-brand-red',
        className,
      )}
    >
      {children}
    </span>
  )
}
