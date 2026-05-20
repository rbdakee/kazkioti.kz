'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'

export interface TractorLeadBarProps {
  modelName: string
  power: number
  kpHref: string
}

export function TractorLeadBar({ modelName, power, kpHref }: TractorLeadBarProps) {
  const t = useTranslations('tractorDetail')
  const tTractors = useTranslations('tractors')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        'fixed inset-x-0 bottom-0 z-[35] border-t border-white/10 bg-bg-invert text-white transition-transform duration-400 ease-kk lg:hidden',
        visible ? 'translate-y-0' : 'translate-y-full',
      )}
    >
      <div className="mx-auto flex max-w-container items-center gap-3 px-4 py-3 sm:px-6">
        <span className="font-heading text-body-m font-semibold">{modelName}</span>
        <span className="font-heading text-h3">
          {power}
          <span className="ml-1 font-mono text-mono-label text-white/60">{tTractors('powerLabel')}</span>
        </span>
        <a
          href={kpHref}
          className="ml-auto inline-flex h-10 items-center justify-center rounded-pill bg-brand-red px-4 font-mono text-mono-label uppercase tracking-widest text-white hover:bg-brand-red-hover"
        >
          {t('ctaKp')} →
        </a>
      </div>
    </div>
  )
}
