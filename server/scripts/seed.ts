// Loads the content that shipped with the site into an empty database.
// Usage: pnpm seed            (refuses if content already exists)
//        pnpm seed --force    (replaces existing entries with the same slugs)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  COLLECTIONS,
  COLLECTION_NAMES,
  SETTINGS,
  SETTINGS_KEYS,
  type CollectionName,
  type SettingsKey,
} from '../../shared/content'
import { config } from '../src/config'
import { nowIso, openDatabase } from '../src/db'
import { ValidationError, validate } from '../src/entries'

const SEED_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'seed')

interface SeedFile {
  collections: Record<CollectionName, Record<string, unknown>>
  settings: Record<SettingsKey, unknown>
}

const seed = JSON.parse(fs.readFileSync(path.join(SEED_DIR, 'content.json'), 'utf8')) as SeedFile
const force = process.argv.includes('--force')
const db = openDatabase(config.databaseFile)

const existing = (db.prepare('SELECT COUNT(*) AS count FROM entries').get() as { count: number }).count
if (existing > 0 && !force) {
  console.error(`Database already has ${existing} entries. Re-run with --force to overwrite seeded slugs.`)
  process.exit(1)
}

function check(label: string, run: () => unknown): unknown {
  try {
    return run()
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`${label} is invalid:`, error.issues)
      process.exit(1)
    }
    throw error
  }
}

const insertEntry = db.prepare(
  `INSERT INTO entries (collection, slug, data, updated_at) VALUES (?, ?, ?, ?)
   ON CONFLICT(collection, slug) DO UPDATE SET data = excluded.data, version = entries.version + 1, updated_at = excluded.updated_at`,
)
const insertSettings = db.prepare(
  `INSERT INTO settings (key, data, updated_at) VALUES (?, ?, ?)
   ON CONFLICT(key) DO UPDATE SET data = excluded.data, version = settings.version + 1, updated_at = excluded.updated_at`,
)

db.transaction(() => {
  for (const collection of COLLECTION_NAMES) {
    for (const [slug, input] of Object.entries(seed.collections[collection] ?? {})) {
      const data = check(`${collection}/${slug}`, () => validate(COLLECTIONS[collection].schema, input))
      insertEntry.run(collection, slug, JSON.stringify(data), nowIso())
    }
  }
  for (const key of SETTINGS_KEYS) {
    const data = check(`settings/${key}`, () => validate(SETTINGS[key], seed.settings[key]))
    insertSettings.run(key, JSON.stringify(data), nowIso())
  }
})()

const mediaTarget = path.join(config.uploadsDir, 'seed')
fs.mkdirSync(mediaTarget, { recursive: true })
for (const file of fs.readdirSync(path.join(SEED_DIR, 'media'))) {
  fs.copyFileSync(path.join(SEED_DIR, 'media', file), path.join(mediaTarget, file))
}

const counts = COLLECTION_NAMES.map((name) => `${name}: ${Object.keys(seed.collections[name] ?? {}).length}`)
console.log(`Seeded ${counts.join(', ')} and ${SETTINGS_KEYS.length} settings into ${config.databaseFile}`)
db.close()
