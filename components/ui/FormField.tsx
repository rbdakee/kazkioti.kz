import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

export interface FormFieldProps {
  id: string
  label: string
  error?: string
  optional?: boolean
  optionalLabel?: string
  className?: string
  children: ReactNode
}

export function FormField({ id, label, error, optional, optionalLabel, className, children }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label
        htmlFor={id}
        className="font-mono text-mono-label uppercase tracking-widest text-text-muted"
      >
        {label}
        {optional && optionalLabel ? <span className="ml-2 normal-case text-text-faint">{optionalLabel}</span> : null}
      </label>
      {children}
      {error ? (
        <span className="text-body-s text-brand-red" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
}
