export function formatPhone(input: string): string {
  const digits = input.replace(/\D/g, '').replace(/^8/, '7').slice(0, 11)
  if (digits.length === 0) return ''

  const country = digits.startsWith('7') ? '7' : digits.slice(0, 1)
  const rest = digits.slice(1)

  const area = rest.slice(0, 3)
  const block1 = rest.slice(3, 6)
  const block2 = rest.slice(6, 8)
  const block3 = rest.slice(8, 10)

  let out = `+${country}`
  if (area) out += ` (${area}`
  if (area.length === 3) out += ')'
  if (block1) out += ` ${block1}`
  if (block2) out += `-${block2}`
  if (block3) out += `-${block3}`

  return out
}

export const PHONE_REGEX = /^\+7\s?\(?\d{3}\)?\s?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/
