'use client'

import { forwardRef, useState, type ChangeEvent, type InputHTMLAttributes } from 'react'
import { Input } from './Input'
import { formatPhone } from '@/lib/utils/formatPhone'

export interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  hasError?: boolean
  onValueChange?: (value: string) => void
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  { value, defaultValue, onValueChange, ...rest },
  ref,
) {
  const initial =
    typeof value === 'string' ? value : typeof defaultValue === 'string' ? defaultValue : ''
  const [internal, setInternal] = useState(initial)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const formatted = formatPhone(event.target.value)
    setInternal(formatted)
    onValueChange?.(formatted)
  }

  return (
    <Input
      ref={ref}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      placeholder="+7 (___) ___-__-__"
      value={value !== undefined ? value : internal}
      onChange={handleChange}
      {...rest}
    />
  )
})
