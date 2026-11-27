'use client'

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// ---- Buttons -----------------------------------------------------------------

type ButtonTone = 'primary' | 'secondary' | 'ghost' | 'danger'

const BUTTON_TONE: Record<ButtonTone, string> = {
  primary: 'bg-brand-red text-white hover:bg-brand-red-hover shadow-[0_1px_2px_rgba(224,0,27,0.25)]',
  secondary: 'border border-border-strong bg-white text-text-primary hover:border-text-primary/40 hover:bg-bg-soft',
  ghost: 'text-text-muted hover:bg-black/[0.04] hover:text-text-primary',
  danger: 'text-brand-red hover:bg-brand-red/[0.06]',
}

export interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: ButtonTone
  size?: 'sm' | 'md'
  loading?: boolean
  icon?: ReactNode
}

export const AdminButton = forwardRef<HTMLButtonElement, AdminButtonProps>(function AdminButton(
  { tone = 'secondary', size = 'md', loading, icon, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'h-8 px-3 text-[13px]' : 'h-10 px-4 text-body-s',
        BUTTON_TONE[tone],
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : icon}
      {children}
    </button>
  )
})

export function IconButton({
  label,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-black/[0.05] hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 disabled:pointer-events-none disabled:opacity-30',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

// ---- Surfaces ----------------------------------------------------------------

export function Card({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-lg border border-border bg-white shadow-[0_1px_2px_rgba(15,15,15,0.04)]', className)}>
      {title ? (
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-[15px] font-semibold text-text-primary">{title}</h2>
            {description ? <p className="text-[13px] leading-snug text-text-muted">{description}</p> : null}
          </div>
          {actions}
        </header>
      ) : null}
      <div className="p-6">{children}</div>
    </section>
  )
}

const BADGE_TONE = {
  neutral: 'bg-black/[0.05] text-text-muted',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-brand-red/[0.08] text-brand-red',
  blue: 'bg-brand-blue-soft text-brand-blue',
} as const

export function Badge({ tone = 'neutral', children }: { tone?: keyof typeof BADGE_TONE; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 text-[12px] font-semibold', BADGE_TONE[tone])}>
      {children}
    </span>
  )
}

// ---- Inputs ------------------------------------------------------------------

const CONTROL =
  'w-full rounded-md border bg-white px-3 text-[14px] text-text-primary placeholder:text-text-faint transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 disabled:bg-bg-soft disabled:text-text-muted'

export function controlClass(invalid?: boolean, extra?: string): string {
  return cn(CONTROL, invalid ? 'border-brand-red focus:border-brand-red focus:ring-brand-red/10' : 'border-black/[0.14] hover:border-black/25', extra)
}

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function TextInput({ invalid, className, ...rest }, ref) {
    return <input ref={ref} className={controlClass(invalid, cn('h-10', className))} aria-invalid={invalid || undefined} {...rest} />
  },
)

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  function TextArea({ invalid, className, rows = 4, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={controlClass(invalid, cn('min-h-[88px] resize-y py-2.5 leading-relaxed', className))}
        aria-invalid={invalid || undefined}
        {...rest}
      />
    )
  },
)

export function SelectInput({ invalid, className, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      className={controlClass(
        invalid,
        cn("h-10 appearance-none bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%236b6b6b' stroke-width='2'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E\")] bg-[length:16px] bg-[right_10px_center] bg-no-repeat pr-9", className),
      )}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  )
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-pill transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40',
          checked ? 'bg-emerald-500' : 'bg-black/20',
        )}
      >
        <span className={cn('inline-block h-4 w-4 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-[18px]' : 'translate-x-0.5')} />
      </button>
      <span className="flex flex-col gap-0.5">
        <span className="text-[14px] font-medium text-text-primary">{label}</span>
        {description ? <span className="text-[13px] text-text-muted">{description}</span> : null}
      </span>
    </label>
  )
}

/** Label, hint and error around a control. */
export function FieldShell({
  label,
  htmlFor,
  required,
  hint,
  error,
  aside,
  children,
  className,
}: {
  label?: string
  htmlFor?: string
  required?: boolean
  hint?: string
  error?: string
  aside?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)} data-field-error={error ? 'true' : undefined}>
      {label ? (
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor={htmlFor} className="text-[13px] font-semibold text-text-primary">
            {label}
            {required ? <span className="ml-0.5 text-brand-red">*</span> : null}
          </label>
          {aside}
        </div>
      ) : null}
      {children}
      {error ? <p className="text-[12px] font-medium text-brand-red">{error}</p> : hint ? <p className="text-[12px] leading-snug text-text-faint">{hint}</p> : null}
    </div>
  )
}

export function LanguageTag({ lang }: { lang: 'ru' | 'kk' }) {
  return (
    <span className="inline-flex h-[18px] items-center rounded bg-black/[0.06] px-1.5 font-mono text-[10px] font-semibold tracking-wider text-text-muted">
      {lang === 'ru' ? 'RU' : 'KZ'}
    </span>
  )
}
