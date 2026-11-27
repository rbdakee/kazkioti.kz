import { notFound } from 'next/navigation'
import { COLLECTION_NAMES, type CollectionName } from '@/shared/content'

export function collectionFromParam(value: string): CollectionName {
  if (!COLLECTION_NAMES.includes(value as CollectionName)) notFound()
  return value as CollectionName
}

/** Collections each editor links to, for its relation pickers. */
export const RELATED_COLLECTIONS: Record<CollectionName, CollectionName[]> = {
  tractors: ['attachments'],
  attachments: ['tractors'],
  news: ['news'],
  faq: [],
}
