'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils/cn'

export type ToastType = 'success' | 'error'

export interface ToastProps {
  message: string
  type?: ToastType
  onDismiss: () => void
  durationMs?: number
}

export function Toast({ message, type = 'success', onDismiss, durationMs = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs)
    return () => clearTimeout(timer)
  }, [onDismiss, durationMs])

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed bottom-24 right-6 z-[70] max-w-sm rounded-md border bg-bg-default px-5 py-4 shadow-card',
        type === 'success' ? 'border-border' : 'border-brand-red',
      )}
    >
      <p className="text-body-m text-text-primary">{message}</p>
    </div>
  )
}
