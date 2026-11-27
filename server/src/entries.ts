import {
  COLLECTIONS,
  SETTINGS,
  type CollectionName,
  type SettingsKey,
  type StoredEntry,
} from '../../shared/content'
import { slugify } from '../../shared/slugify'
import type { Db } from './db'
import { nowIso } from './db'

/** Fields in one collection that hold slugs of another; cleaned up on delete. */
const REFERENCES: Record<CollectionName, ReadonlyArray<{ from: CollectionName; field: string }>> = {
  tractors: [{ from: 'attachments', field: 'compatibleModels' }],
  attachments: [{ from: 'tractors', field: 'compatibleAttachments' }],
  news: [{ from: 'news', field: 'relatedNews' }],
  faq: [],
}

export class NotFoundError extends Error {}
export class ConflictError extends Error {}

export class ValidationError extends Error {
  constructor(readonly issues: ReadonlyArray<{ path: string; message: string }>) {
    super('Validation failed')
  }
}

interface EntryRow {
  slug: string
  data: string
  version: number
  updatedAt: string
  updatedBy: string | null
}

const SELECT_ENTRY = `
  SELECT entries.slug, entries.data, entries.version, entries.updated_at AS updatedAt, users.name AS updatedBy
  FROM entries LEFT JOIN users ON users.id = entries.updated_by`

function toEntry(row: EntryRow): StoredEntry<unknown> {
  return { slug: row.slug, data: JSON.parse(row.data), version: row.version, updatedAt: row.updatedAt, updatedBy: row.updatedBy }
}

export function validate(schema: (typeof COLLECTIONS)[CollectionName]['schema'] | (typeof SETTINGS)[SettingsKey], input: unknown): unknown {
  const result = schema.safeParse(input)
  if (!result.success) {
    throw new ValidationError(
      result.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
    )
  }
  return result.data
}

export function listEntries(db: Db, collection: CollectionName): StoredEntry<unknown>[] {
  const rows = db
    .prepare(`${SELECT_ENTRY} WHERE entries.collection = ? ORDER BY entries.slug`)
    .all(collection) as EntryRow[]
  return rows.map(toEntry)
}

export function listPublicEntries(db: Db, collection: CollectionName): StoredEntry<unknown>[] {
  const isPublic = COLLECTIONS[collection].isPublic as (doc: unknown) => boolean
  return listEntries(db, collection).filter((entry) => isPublic(entry.data))
}

export function getEntry(db: Db, collection: CollectionName, slug: string): StoredEntry<unknown> {
  const row = db
    .prepare(`${SELECT_ENTRY} WHERE entries.collection = ? AND entries.slug = ?`)
    .get(collection, slug) as EntryRow | undefined
  if (!row) throw new NotFoundError(`${collection}/${slug} not found`)
  return toEntry(row)
}

export function listRecentEntries(db: Db, limit: number): Array<StoredEntry<unknown> & { collection: CollectionName }> {
  const rows = db
    .prepare(
      `SELECT entries.collection, entries.slug, entries.data, entries.version, entries.updated_at AS updatedAt, users.name AS updatedBy
       FROM entries LEFT JOIN users ON users.id = entries.updated_by
       ORDER BY entries.updated_at DESC LIMIT ?`,
    )
    .all(limit) as Array<EntryRow & { collection: CollectionName }>
  return rows.map((row) => ({ ...toEntry(row), collection: row.collection }))
}

/** Path segments the admin uses for its own pages. */
const RESERVED_SLUGS = new Set(['new'])

function uniqueSlug(db: Db, collection: CollectionName, base: string): string {
  const stem = !base || RESERVED_SLUGS.has(base) ? `${collection.replace(/s$/, '')}${base ? `-${base}` : ''}` : base
  const exists = db.prepare('SELECT 1 FROM entries WHERE collection = ? AND slug = ?')
  for (let suffix = 1; ; suffix += 1) {
    const candidate = suffix === 1 ? stem : `${stem}-${suffix}`
    if (!exists.get(collection, candidate)) return candidate
  }
}

export function createEntry(
  db: Db,
  collection: CollectionName,
  input: unknown,
  userId: number | null,
): StoredEntry<unknown> {
  const definition = COLLECTIONS[collection]
  const data = validate(definition.schema, input)
  const slugSource = definition.slugSource as (doc: unknown) => string
  return db.transaction(() => {
    const slug = uniqueSlug(db, collection, slugify(slugSource(data)))
    db.prepare(
      'INSERT INTO entries (collection, slug, data, updated_at, updated_by) VALUES (?, ?, ?, ?, ?)',
    ).run(collection, slug, JSON.stringify(data), nowIso(), userId)
    return getEntry(db, collection, slug)
  })()
}

/**
 * Saves an entry. `expectedVersion` is the version the editor loaded; if
 * someone saved in between, the write is refused instead of silently lost.
 */
export function updateEntry(
  db: Db,
  collection: CollectionName,
  slug: string,
  input: unknown,
  expectedVersion: number | undefined,
  userId: number | null,
): StoredEntry<unknown> {
  const data = validate(COLLECTIONS[collection].schema, input)
  return db.transaction(() => {
    const current = getEntry(db, collection, slug)
    if (expectedVersion !== undefined && current.version !== expectedVersion) {
      throw new ConflictError(`${collection}/${slug} was changed by ${current.updatedBy ?? 'someone'}`)
    }
    db.prepare(
      'UPDATE entries SET data = ?, version = version + 1, updated_at = ?, updated_by = ? WHERE collection = ? AND slug = ?',
    ).run(JSON.stringify(data), nowIso(), userId, collection, slug)
    return getEntry(db, collection, slug)
  })()
}

/** Deletes an entry and removes its slug from entries that link to it. Returns touched collections. */
export function deleteEntry(db: Db, collection: CollectionName, slug: string): CollectionName[] {
  return db.transaction(() => {
    const result = db.prepare('DELETE FROM entries WHERE collection = ? AND slug = ?').run(collection, slug)
    if (result.changes === 0) throw new NotFoundError(`${collection}/${slug} not found`)
    const touched = new Set<CollectionName>([collection])
    for (const { from, field } of REFERENCES[collection]) {
      for (const entry of listEntries(db, from)) {
        const doc = entry.data as Record<string, unknown>
        const links = doc[field]
        if (!Array.isArray(links) || !links.includes(slug)) continue
        doc[field] = links.filter((link) => link !== slug)
        db.prepare('UPDATE entries SET data = ?, version = version + 1 WHERE collection = ? AND slug = ?').run(
          JSON.stringify(doc),
          from,
          entry.slug,
        )
        touched.add(from)
      }
    }
    return [...touched]
  })()
}

export function getSettings(db: Db, key: SettingsKey): StoredEntry<unknown> {
  const row = db
    .prepare(
      `SELECT settings.key AS slug, settings.data, settings.version, settings.updated_at AS updatedAt, users.name AS updatedBy
       FROM settings LEFT JOIN users ON users.id = settings.updated_by WHERE settings.key = ?`,
    )
    .get(key) as EntryRow | undefined
  if (!row) throw new NotFoundError(`settings/${key} not found`)
  return toEntry(row)
}

export function saveSettings(
  db: Db,
  key: SettingsKey,
  input: unknown,
  expectedVersion: number | undefined,
  userId: number | null,
): StoredEntry<unknown> {
  const data = validate(SETTINGS[key], input)
  return db.transaction(() => {
    const current = db.prepare('SELECT version FROM settings WHERE key = ?').get(key) as
      | { version: number }
      | undefined
    if (current && expectedVersion !== undefined && current.version !== expectedVersion) {
      throw new ConflictError(`settings/${key} was changed by someone else`)
    }
    db.prepare(
      `INSERT INTO settings (key, data, updated_at, updated_by) VALUES (?, ?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET data = excluded.data, version = settings.version + 1,
         updated_at = excluded.updated_at, updated_by = excluded.updated_by`,
    ).run(key, JSON.stringify(data), nowIso(), userId)
    return getSettings(db, key)
  })()
}
