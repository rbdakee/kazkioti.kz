'use client'

import { useCountUp } from '@/lib/utils/useCountUp'
import { cn } from '@/lib/utils/cn'

export interface HeroMetricProps {
  value: number
  suffix?: string
  label: string
  variant?: 'default' | 'onDark'
}

export function HeroMetric({ value, suffix, label, variant = 'default' }: HeroMetricProps) {
  const { ref, value: animated } = useCountUp({ target: value })
  const numberColor = variant === 'onDark' ? 'text-white' : 'text-text-primary'
  const labelColor = variant === 'onDark' ? 'text-white/70' : 'text-text-muted'

  return (
    <div>
      <p className={cn('font-mono text-h2', numberColor)}>
        <span ref={ref}>{animated}</span>
        {suffix ? <span>{suffix}</span> : null}
      </p>
      <p className={cn('mt-2 font-mono text-mono-label uppercase tracking-widest', labelColor)}>
        {label}
      </p>
    </div>
  )
}
