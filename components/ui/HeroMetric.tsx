'use client'

import { useCountUp } from '@/lib/utils/useCountUp'

export interface HeroMetricProps {
  value: number
  suffix?: string
  label: string
}

export function HeroMetric({ value, suffix, label }: HeroMetricProps) {
  const { ref, value: animated } = useCountUp({ target: value })

  return (
    <div>
      <p className="font-mono text-h2 text-text-primary">
        <span ref={ref}>{animated}</span>
        {suffix ? <span>{suffix}</span> : null}
      </p>
      <p className="mt-2 font-mono text-mono-label uppercase tracking-widest text-text-muted">
        {label}
      </p>
    </div>
  )
}
