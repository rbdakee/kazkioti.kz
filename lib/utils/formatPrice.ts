import type { Locale } from '@/lib/i18n/routing'

// Manual thousands grouping so server (Node) and client (browser) produce the
// same string. `Intl.NumberFormat('kk-KZ')` differs between platforms (Node
// uses U+202F narrow no-break space, browsers may use ",") which triggers
// React hydration mismatches.
function groupThousands(value: number): string {
  const rounded = Math.round(value)
  const sign = rounded < 0 ? '-' : ''
  const digits = Math.abs(rounded).toString()
  let out = ''
  for (let i = 0; i < digits.length; i += 1) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += ' '
    out += digits[i]
  }
  return sign + out
}

export function formatTenge(value: number, _locale: Locale = 'ru'): string {
  return `${groupThousands(value)} ₸`
}
