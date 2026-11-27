import 'server-only'
import { z } from 'zod'
import {
  COLLECTIONS,
  SETTINGS,
  cacheTag,
  type CollectionDoc,
  type CollectionName,
  type SettingsKey,
  type SettingsValue,
} from '@/shared/content'

/** Pages are refreshed by the CMS on every edit; this is only a safety net. */
const FALLBACK_REVALIDATE_SECONDS = 3600

export function cmsUrl(): string {
  const url = process.env.CMS_URL
  if (!url) throw new Error('CMS_URL is not set: the site cannot load its content')
  return url.replace(/\/$/, '')
}

async function cmsGet(path: string, tag: string): Promise<unknown> {
  const response = await fetch(`${cmsUrl()}${path}`, {
    next: { tags: [tag], revalidate: FALLBACK_REVALIDATE_SECONDS },
  })
  if (!response.ok) throw new Error(`CMS ${path} answered ${response.status}`)
  return response.json()
}

export interface PublicEntry<T> {
  slug: string
  data: T
}

export async function fetchCollection<C extends CollectionName>(
  collection: C,
): Promise<PublicEntry<CollectionDoc<C>>[]> {
  const raw = await cmsGet(`/public/collections/${collection}`, cacheTag(collection))
  const entries = z.array(z.object({ slug: z.string(), data: z.unknown() })).parse(raw)
  const schema = COLLECTIONS[collection].schema
  return entries.map(({ slug, data }) => ({ slug, data: schema.parse(data) as CollectionDoc<C> }))
}

export async function fetchSettings<K extends SettingsKey>(key: K): Promise<SettingsValue<K>> {
  const raw = await cmsGet(`/public/settings/${key}`, cacheTag(key))
  const { data } = z.object({ data: z.unknown() }).parse(raw)
  return SETTINGS[key].parse(data) as SettingsValue<K>
}
