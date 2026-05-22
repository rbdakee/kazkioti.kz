'use client'

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from 'react'
import { Input } from './Input'
import { formatPhone } from '@/lib/utils/formatPhone'

export interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  hasError?: boolean
  onValueChange?: (value: string) => void
}

const DIGIT = /\d/

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  { value, defaultValue, onValueChange, onKeyDown: parentOnKeyDown, ...rest },
  ref,
) {
  const innerRef = useRef<HTMLInputElement | null>(null)
  const initial =
    typeof value === 'string' ? value : typeof defaultValue === 'string' ? defaultValue : ''
  const [internal, setInternal] = useState(initial)
  const pendingCursorRef = useRef<number | null>(null)

  // After React commits a new value, restore the caret to the position we
  // recorded when we synthesised the edit. Without this, the caret jumps to
  // the end every time we re-format on Backspace/Delete.
  useEffect(() => {
    if (pendingCursorRef.current === null) return
    const el = innerRef.current
    if (!el) return
    const pos = Math.max(0, Math.min(pendingCursorRef.current, el.value.length))
    el.setSelectionRange(pos, pos)
    pendingCursorRef.current = null
  })

  function setMergedRef(node: HTMLInputElement | null) {
    innerRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref)
      (ref as React.MutableRefObject<HTMLInputElement | null>).current = node
  }

  function commit(formatted: string, cursor?: number) {
    if (cursor !== undefined) pendingCursorRef.current = cursor
    setInternal(formatted)
    onValueChange?.(formatted)
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    commit(formatPhone(event.target.value))
  }

  // Backspace / Delete on a formatting character (space, parens, hyphen) would
  // normally remove only that character; formatPhone then re-inserts it on the
  // next render, so the caret looks "stuck". We intercept those keys, jump
  // past the formatting to the real digit, and delete that instead.
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    parentOnKeyDown?.(event)
    if (event.defaultPrevented) return
    if (event.key !== 'Backspace' && event.key !== 'Delete') return

    const input = event.currentTarget
    const { selectionStart, selectionEnd, value: raw } = input
    if (selectionStart === null || selectionEnd === null) return
    if (selectionStart !== selectionEnd) return // range selection — let default handle it

    if (event.key === 'Backspace') {
      if (selectionStart === 0) return
      const charBefore = raw[selectionStart - 1] ?? ''
      if (DIGIT.test(charBefore)) return // default Backspace is correct
      // Walk left until we find a digit, then drop it.
      let digitIndex = selectionStart - 1
      while (digitIndex >= 0 && !DIGIT.test(raw[digitIndex] ?? '')) digitIndex -= 1
      if (digitIndex < 0) return
      event.preventDefault()
      const newRaw = raw.slice(0, digitIndex) + raw.slice(digitIndex + 1)
      const formatted = formatPhone(newRaw)
      commit(formatted, Math.min(digitIndex, formatted.length))
      return
    }

    // Delete (forward)
    if (selectionStart >= raw.length) return
    const charAt = raw[selectionStart] ?? ''
    if (DIGIT.test(charAt)) return // default forward delete is correct
    let digitIndex = selectionStart
    while (digitIndex < raw.length && !DIGIT.test(raw[digitIndex] ?? '')) digitIndex += 1
    if (digitIndex >= raw.length) return
    event.preventDefault()
    const newRaw = raw.slice(0, digitIndex) + raw.slice(digitIndex + 1)
    const formatted = formatPhone(newRaw)
    commit(formatted, Math.min(selectionStart, formatted.length))
  }

  return (
    <Input
      {...rest}
      ref={setMergedRef}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      placeholder="+7 (___) ___-__-__"
      value={value !== undefined ? value : internal}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  )
})
