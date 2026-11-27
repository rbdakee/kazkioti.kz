import type { Language, LocalizedText } from './fields'

/** Picks the requested language, falling back to Russian when the translation is empty. */
export function pickLocale(text: LocalizedText | undefined, language: Language): string | undefined {
  if (!text) return undefined
  return text[language] || text.ru || undefined
}
