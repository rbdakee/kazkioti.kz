import { fetchCollection } from '@/lib/cms/client'
import type { Locale } from '@/lib/i18n/routing'
import type { FAQGroupWithItems } from '@/lib/types/faq'
import { pickLocale } from '@/shared/content'

export async function getAllFAQGroups(locale: Locale): Promise<FAQGroupWithItems[]> {
  const entries = await fetchCollection('faq')
  return entries
    .map(({ data }) => ({
      group: { category: data.category, order: data.order, title: pickLocale(data.title, locale) ?? '' },
      items: data.items.map((item) => ({
        question: pickLocale(item.question, locale) ?? '',
        answer: pickLocale(item.answer, locale) ?? '',
      })),
    }))
    .sort((a, b) => a.group.order - b.group.order)
}
