import type { CollectionName } from '@/shared/content'
import { attachmentForm } from './attachment'
import { faqForm } from './faq'
import { newsForm } from './news'
import { tractorForm } from './tractor'
import type { CollectionFormConfig } from './types'

export const COLLECTION_FORMS: Record<CollectionName, CollectionFormConfig> = {
  tractors: tractorForm,
  attachments: attachmentForm,
  news: newsForm,
  faq: faqForm,
}
