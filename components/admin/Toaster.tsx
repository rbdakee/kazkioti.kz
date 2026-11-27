'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, X, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type ToastTone = 'success' | 'warning' | 'error'

interface Toast {
  id: number
  tone: ToastTone
  message: string
  action?: { label: string; onClick: () => void }
}

type ShowToast = (toast: Omit<Toast, 'id'>) => void

const ToastContext = createContext<ShowToast | null>(null)

const TONE_ICON = { success: CheckCircle2, warning: AlertTriangle, error: XCircle } as const
const TONE_CLASS: Record<ToastTone, string> = {
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  error: 'text-brand-red',
}
const AUTO_DISMISS_MS: Record<ToastTone, number> = { success: 5000, warning: 8000, error: 8000 }

export function Toaster({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((toast) => toast.id !== id)), [])

  const show = useCallback<ShowToast>(
    (toast) => {
      const id = Date.now() + Math.random()
      // A success makes earlier errors stale, so it replaces them.
      setToasts((all) => [...all.filter((item) => toast.tone !== 'success' || item.tone === 'success').slice(-2), { ...toast, id }])
      // Toasts with an action (e.g. "reload" after a conflict) stay until dismissed.
      if (!toast.action) setTimeout(() => dismiss(id), AUTO_DISMISS_MS[toast.tone])
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[60] flex w-[min(420px,calc(100vw-48px))] flex-col gap-3" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = TONE_ICON[toast.tone]
          return (
            <div
              key={toast.id}
              role={toast.tone === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto flex items-start gap-3 rounded-lg border border-border bg-white p-4 shadow-form animate-[admin-toast-in_200ms_ease-out]"
            >
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', TONE_CLASS[toast.tone])} aria-hidden="true" />
              <div className="flex flex-1 flex-col gap-2">
                <p className="text-body-s text-text-primary">{toast.message}</p>
                {toast.action ? (
                  <button
                    type="button"
                    onClick={toast.action.onClick}
                    className="self-start text-body-s font-semibold text-brand-red hover:underline"
                  >
                    {toast.action.label}
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="rounded p-0.5 text-text-faint hover:bg-bg-muted hover:text-text-primary"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ShowToast {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside Toaster')
  return context
}
