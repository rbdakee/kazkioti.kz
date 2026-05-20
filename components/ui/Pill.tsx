'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

export interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  children: ReactNode
}

export function Pill({ active, className, children, type = 'button', ...rest }: PillProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center gap-2 rounded-pill border px-4 py-2 font-mono text-[11px] uppercase tracking-widest transition-all duration-fast ease-kk',
        active
          ? 'border-text-primary bg-text-primary text-white'
          : 'border-border-strong bg-transparent text-text-primary hover:border-text-primary hover:bg-bg-muted',
        className,
      )}
      aria-pressed={active}
      {...rest}
    >
      {children}
    </button>
  )
}
