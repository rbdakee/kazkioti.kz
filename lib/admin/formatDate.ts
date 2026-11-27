// Numeric formats read the same in Russian and Kazakh (Intl's kk-KZ month names are
// inconsistent across runtimes), and a fixed time zone keeps server and browser output
// identical, so hydration never mismatches.
const TIME_ZONE = 'Asia/Almaty'

const DATE = new Intl.DateTimeFormat('ru-RU', { timeZone: TIME_ZONE, day: '2-digit', month: '2-digit', year: 'numeric' })
const TIME = new Intl.DateTimeFormat('ru-RU', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit' })

export function formatAdminDate(iso: string): string {
  return DATE.format(new Date(iso))
}

export function formatAdminDateTime(iso: string): string {
  const date = new Date(iso)
  return `${DATE.format(date)}, ${TIME.format(date)}`
}
