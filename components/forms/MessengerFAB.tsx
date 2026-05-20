'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { Locale } from '@/lib/i18n/routing'
import { telegramUrl, whatsappUrl } from '@/lib/constants'
import { cn } from '@/lib/utils/cn'

export interface MessengerFABProps {
  locale: Locale
}

export function MessengerFAB({ locale }: MessengerFABProps) {
  const t = useTranslations('messenger')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open ? (
        <div className="flex flex-col gap-2">
          <a
            href={whatsappUrl(locale)}
            target="_blank"
            rel="noreferrer"
            className="rounded-pill bg-bg-default px-5 py-3 font-mono text-mono-label uppercase tracking-widest text-text-primary shadow-card hover:bg-bg-muted"
          >
            {t('whatsapp')}
          </a>
          <a
            href={telegramUrl()}
            target="_blank"
            rel="noreferrer"
            className="rounded-pill bg-bg-default px-5 py-3 font-mono text-mono-label uppercase tracking-widest text-text-primary shadow-card hover:bg-bg-muted"
          >
            {t('telegram')}
          </a>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? t('close') : t('open')}
        aria-expanded={open}
        className={cn(
          'inline-flex h-14 w-14 items-center justify-center rounded-pill bg-brand-red text-white shadow-fab transition-transform duration-fast ease-kk',
          'hover:scale-105 active:scale-95',
          !open && 'fab-pulse',
        )}
      >
        {open ? (
          <span aria-hidden="true" className="text-2xl leading-none">
            ×
          </span>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
            <path
              d="M21 11.5a8.38 8.38 0 0 1-12.6 7.2L3 21l2.3-5.4A8.5 8.5 0 1 1 21 11.5z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  )
}
