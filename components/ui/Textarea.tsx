'use client'

import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, hasError, rows = 4, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'w-full resize-y rounded-md border bg-bg-default px-4 py-3 text-body-m text-text-primary placeholder:text-text-faint',
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
