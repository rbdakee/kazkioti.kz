'use client'

import { useEffect, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'
import { AdminButton } from './ui'

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      className="w-[min(440px,calc(100vw-32px))] rounded-lg border border-border p-0 shadow-form backdrop:bg-black/40 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex gap-4 p-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-red/10 text-brand-red">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-[17px] font-semibold text-text-primary">{title}</h2>
          <p className="text-[14px] leading-relaxed text-text-muted">{description}</p>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-border bg-bg-soft px-6 py-4">
        <AdminButton onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </AdminButton>
        <AdminButton tone="primary" loading={busy} onClick={onConfirm}>
          {confirmLabel}
        </AdminButton>
      </div>
    </dialog>
  )
}
