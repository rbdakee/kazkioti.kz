'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, hasError, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-md border bg-bg-default px-4 py-3 text-body-m text-text-primary placeholder:text-text-faint',
        'transition-all duration-fast ease-kk',
        'focus:outline-none focus:ring-4 focus:ring-brand-red/10',
        hasError
          ? 'border-brand-red focus:border-brand-red'
          : 'border-border focus:border-brand-red',
        className,
      )}
      {...rest}
    />
  )
})
