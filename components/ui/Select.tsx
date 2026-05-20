'use client'

import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: readonly SelectOption[]
  placeholder?: string
  hasError?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, options, placeholder, hasError, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        'w-full appearance-none rounded-md border bg-bg-default px-4 py-3 text-body-m text-text-primary',
        'bg-[length:16px_16px] bg-[right_1rem_center] bg-no-repeat pr-10',
        "bg-[url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none' stroke='%236b6b6b' stroke-width='1.5'><path d='M4 6l4 4 4-4'/></svg>\")]",
        'transition-all duration-fast ease-kk focus:outline-none focus:ring-4 focus:ring-brand-red/10',
        hasError
          ? 'border-brand-red focus:border-brand-red'
          : 'border-border focus:border-brand-red',
        className,
      )}
      {...rest}
    >
      {placeholder ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
})
