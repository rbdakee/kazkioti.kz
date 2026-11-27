import { UI, type AdminLang, type Label } from '../i18n'

export interface Issue {
  path: string
  message: string
}

const INVALID_FORMAT: Label = { ru: 'Неверный формат', kk: 'Пішімі қате' }
const DUPLICATE: Label = { ru: 'Повторяется', kk: 'Қайталанады' }

/** Turns validation messages (from zod, on either side) into short editor-facing text. */
export function issuesToErrors(issues: readonly Issue[], lang: AdminLang): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const { path, message } of issues) {
    if (errors[path]) continue
    if (/required|at least 1|expected .*, received undefined/i.test(message)) errors[path] = UI.required[lang]
    else if (/invalid|expected/i.test(message)) errors[path] = INVALID_FORMAT[lang]
    else if (/once/i.test(message)) errors[path] = DUPLICATE[lang]
    else errors[path] = message
  }
  return errors
}
