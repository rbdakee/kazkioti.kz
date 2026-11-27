import 'server-only'
import type { CollectionName, SettingsKey, StoredEntry } from '@/shared/content'
import { COLLECTION_FORMS } from './forms'
import type { Doc } from './forms/types'
import { adminFetch } from './api'
import type { RelationIndex } from '@/components/admin/FormContext'

export interface AdminUser {
  id: number
  login: string
  name: string
}

export function getMe(): Promise<AdminUser> {
  return adminFetch<AdminUser>('/me')
}

export function listCollection(collection: CollectionName): Promise<StoredEntry<Doc>[]> {
  return adminFetch<StoredEntry<Doc>[]>(`/collections/${collection}`)
}

export function getEntry(collection: CollectionName, slug: string): Promise<StoredEntry<Doc>> {
  return adminFetch<StoredEntry<Doc>>(`/collections/${collection}/${encodeURIComponent(slug)}`)
}

export function getSettings(key: SettingsKey): Promise<StoredEntry<Doc>> {
  return adminFetch<StoredEntry<Doc>>(`/settings/${key}`)
}

/** Names of entries other collections can link to, for relation pickers. */
export async function relationIndex(collections: readonly CollectionName[]): Promise<RelationIndex> {
  const lists = await Promise.all(collections.map((collection) => listCollection(collection)))
  return Object.fromEntries(
    collections.map((collection, index) => [
      collection,
      (lists[index] ?? [])
        .map((entry) => ({ slug: entry.slug, title: COLLECTION_FORMS[collection].titleOf(entry.data) || entry.slug }))
        .sort((a, b) => a.title.localeCompare(b.title, 'ru')),
    ]),
  )
}
