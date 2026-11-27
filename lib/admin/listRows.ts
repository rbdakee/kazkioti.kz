import type { CollectionName, StoredEntry } from '@/shared/content'
import { formatTenge } from '@/lib/utils/formatPrice'
import { ATTACHMENT_CATEGORY_LABELS } from './forms/attachment'
import { FAQ_CATEGORY_LABELS } from './forms/faq'
import { COLLECTION_FORMS } from './forms'
import { NEWS_TAG_LABELS } from './forms/news'
import type { Doc } from './forms/types'
import type { Label } from './i18n'

export type BadgeTone = 'neutral' | 'green' | 'amber' | 'red' | 'blue'

/** Plain data for one row of an admin list; safe to pass to client components. */
export interface ListRow {
  slug: string
  title: string
  thumbnail?: string
  details: Array<string | Label>
  badge?: { tone: BadgeTone; label: Label }
  updatedAt: string
  updatedBy: string | null
}

const l = (ru: string, kk: string): Label => ({ ru, kk })

function price(doc: Doc): string | undefined {
  return typeof doc.price === 'number' ? formatTenge(doc.price) : undefined
}

const ROW_DETAILS: Record<CollectionName, (doc: Doc) => Pick<ListRow, 'thumbnail' | 'details' | 'badge'>> = {
  tractors: (doc) => ({
    thumbnail: doc.heroImage as string | undefined,
    details: [`${String(doc.power ?? '—')} л.с.`, price(doc) ?? l('Цена не указана', 'Баға көрсетілмеген')],
    badge:
      doc.status === 'coming-soon'
        ? { tone: 'amber', label: l('Скоро', 'Жақында') }
        : { tone: 'green', label: l('В продаже', 'Сатылымда') },
  }),
  attachments: (doc) => ({
    thumbnail: doc.heroImage as string | undefined,
    details: [
      ATTACHMENT_CATEGORY_LABELS[doc.category as keyof typeof ATTACHMENT_CATEGORY_LABELS] ?? String(doc.category),
      price(doc) ?? l('Цена не указана', 'Баға көрсетілмеген'),
    ],
  }),
  news: (doc) => ({
    thumbnail: doc.coverImage as string | undefined,
    details: [String(doc.date ?? ''), NEWS_TAG_LABELS[doc.tag as keyof typeof NEWS_TAG_LABELS] ?? String(doc.tag)],
    badge:
      doc.status === 'published'
        ? { tone: 'green', label: l('Опубликовано', 'Жарияланды') }
        : { tone: 'neutral', label: l('Черновик', 'Жоба') },
  }),
  faq: (doc) => ({
    details: [
      FAQ_CATEGORY_LABELS[doc.category as keyof typeof FAQ_CATEGORY_LABELS] ?? String(doc.category),
      l(`Вопросов: ${Array.isArray(doc.items) ? doc.items.length : 0}`, `Сұрақтар: ${Array.isArray(doc.items) ? doc.items.length : 0}`),
    ],
  }),
}

/** Sort order inside each list, matching how the site shows entries. */
const ROW_SORT: Record<CollectionName, (a: Doc, b: Doc) => number> = {
  tractors: (a, b) => Number(a.power ?? 0) - Number(b.power ?? 0),
  attachments: (a, b) => COLLECTION_FORMS.attachments.titleOf(a).localeCompare(COLLECTION_FORMS.attachments.titleOf(b), 'ru'),
  news: (a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')),
  faq: (a, b) => Number(a.order ?? 0) - Number(b.order ?? 0),
}

export function toListRows(collection: CollectionName, entries: StoredEntry<Doc>[]): ListRow[] {
  return [...entries]
    .sort((a, b) => ROW_SORT[collection](a.data, b.data))
    .map((entry) => ({
      slug: entry.slug,
      title: COLLECTION_FORMS[collection].titleOf(entry.data) || entry.slug,
      ...ROW_DETAILS[collection](entry.data),
      updatedAt: entry.updatedAt,
      updatedBy: entry.updatedBy,
    }))
}
