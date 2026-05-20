'use client'

import { useEffect, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'

export interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
  closeLabel?: string
}

export function Sheet({ open, onClose, title, children, className, closeLabel }: SheetProps) {
  const t = useTranslations('common')
  useEffect(() => {
    if (!open) return
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'sheet-title' : undefined}
      className="fixed inset-0 z-[80] flex items-end"
    >
      <button
        type="button"
        aria-label={closeLabel ?? t('close')}
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div
        className={cn(
          'relative z-10 w-full rounded-t-lg border-t border-border bg-bg-default shadow-form',
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          {title ? (
            <h2 id="sheet-title" className="font-heading text-h3">
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel ?? t('close')}
            className="text-2xl leading-none text-text-muted hover:text-text-primary"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  )
}
