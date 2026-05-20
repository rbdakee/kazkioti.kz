'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
  closeLabel?: string
}

export function Modal({ open, onClose, title, children, className, closeLabel }: ModalProps) {
  const t = useTranslations('common')
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby={title ? 'modal-title' : undefined}
      className={cn(
        'rounded-lg border border-border bg-bg-default p-0 shadow-form backdrop:bg-black/40',
        'm-auto w-full max-w-lg open:flex open:flex-col',
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        {title ? (
          <h2 id="modal-title" className="font-heading text-h3">
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
    </dialog>
  )
}
