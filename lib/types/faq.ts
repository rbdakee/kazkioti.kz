import type { FAQ_CATEGORIES } from '@/shared/content'

type FaqCategory = (typeof FAQ_CATEGORIES)[number]

export interface FAQGroup {
  category: FaqCategory
  title: string
  order: number
}

export interface FAQItem {
  question: string
  answer: string
}

export interface FAQGroupWithItems {
  group: FAQGroup
  items: FAQItem[]
}
