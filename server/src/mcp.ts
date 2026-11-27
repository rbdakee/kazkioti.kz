import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'
import {
  COLLECTIONS,
  COLLECTION_NAMES,
  SETTINGS,
  SETTINGS_KEYS,
  type CollectionName,
  type SettingsKey,
  type StoredEntry,
} from '../../shared/content'
import { MIN_PASSWORD_LENGTH, createUser, deleteUser, findUserWithHash, hashPassword, listUsers, type User } from './auth'
import type { Db } from './db'
import {
  ConflictError,
  NotFoundError,
  ValidationError,
  createEntry,
  deleteEntry,
  getEntry,
  getSettings,
  listEntries,
  saveSettings,
  updateEntry,
} from './entries'
import { downloadImage } from './remoteImage'
import { revalidateSite, type RevalidateTarget } from './revalidate'
import { UploadError, saveImage } from './uploads'

export interface McpOptions {
  db: Db
  uploadsDir: string
  maxUploadBytes: number
  revalidate: RevalidateTarget
}

const INSTRUCTIONS = `Content admin of kazkioti.kz, the site of a Kazakhstan tractor manufacturer.
- Every text is bilingual: { "ru": "...", "kk": "..." } (Russian and Kazakh). Fill both; Kazakh falls back to Russian only where it is optional.
- Kazakh terms used on the site: attachments = "Агрегаттар", one attachment = "Агрегат", compatible attachments = "Үйлесімді тіркелмелі агрегаттар".
- Prices are whole tenge (KZT) without spaces, e.g. 23000000.
- Slugs are generated from the name/title on create and never change. Use list_entries to find them.
- Photos: upload with upload_image first, then put the returned path (/uploads/...) into an image field.
- News are created as drafts unless status is "published"; the news section appears on the site only when at least one article is published.
- News body is a list of blocks; text blocks accept light Markdown (blank line = paragraph, **bold**, [link](https://...), "- " list items).
- To edit, send only the fields that change in "changes"; they replace those top-level fields, the rest stays. Nested objects and lists are replaced whole, so send the full value of any field you change.
- Every save refreshes the live site. Pass expectedVersion from get_entry to avoid overwriting someone else's edit.`

/** Tool names and wording per collection. */
const COLLECTION_TOOLS: Record<CollectionName, { tool: string; label: string }> = {
  tractors: { tool: 'tractor', label: 'tractor model' },
  attachments: { tool: 'attachment', label: 'attachment (implement)' },
  news: { tool: 'news', label: 'news article' },
  faq: { tool: 'faq_section', label: 'FAQ section (category with questions)' },
}

const SUMMARY_FIELDS = ['status', 'date', 'tag', 'category', 'powerClass', 'price', 'order'] as const

const collectionSchema = z.enum(COLLECTION_NAMES as [CollectionName, ...CollectionName[]])
const settingsSchema = z.enum(SETTINGS_KEYS as [SettingsKey, ...SettingsKey[]])
const slugSchema = z.string().regex(/^[a-z0-9-]+$/).describe('Entry slug, see list_entries')
const expectedVersionSchema = z
  .number()
  .int()
  .positive()
  .optional()
  .describe('Version from get_entry; the save is refused if someone changed the entry since')

function textResult(value: unknown): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] }
}

function errorResult(message: string, issues?: unknown): CallToolResult {
  return { isError: true, content: [{ type: 'text', text: JSON.stringify({ error: message, issues }, null, 2) }] }
}

/** Runs a tool body and turns expected failures into tool errors the model can act on. */
async function attempt(body: () => unknown): Promise<CallToolResult> {
  try {
    return textResult(await body())
  } catch (error) {
    if (error instanceof ValidationError) return errorResult('Validation failed', error.issues)
    if (error instanceof NotFoundError || error instanceof ConflictError || error instanceof UploadError) {
      return errorResult(error.message)
    }
    throw error
  }
}

function titleOf(data: unknown): string {
  const doc = data as { name?: unknown; title?: unknown }
  const value = doc.name ?? doc.title
  if (typeof value === 'string') return value
  return (value as { ru?: string } | undefined)?.ru ?? ''
}

function summarize(entry: StoredEntry<unknown>) {
  const doc = entry.data as Record<string, unknown>
  const extra = Object.fromEntries(SUMMARY_FIELDS.filter((field) => doc[field] !== undefined).map((field) => [field, doc[field]]))
  return { slug: entry.slug, title: titleOf(entry.data), ...extra, version: entry.version, updatedAt: entry.updatedAt, updatedBy: entry.updatedBy }
}

function registerTools(server: McpServer, options: McpOptions, user: User): void {
  const { db } = options
  const refresh = (names: ReadonlyArray<CollectionName | SettingsKey>) => revalidateSite(options.revalidate, names)

  server.registerTool(
    'list_entries',
    {
      title: 'List entries',
      description: 'Lists tractors, attachments, news or FAQ sections with slug, title, status and version.',
      inputSchema: { collection: collectionSchema },
      annotations: { readOnlyHint: true },
    },
    ({ collection }) => attempt(() => listEntries(db, collection).map(summarize)),
  )

  server.registerTool(
    'get_entry',
    {
      title: 'Get entry',
      description: 'Returns the full data and version of one entry.',
      inputSchema: { collection: collectionSchema, slug: slugSchema },
      annotations: { readOnlyHint: true },
    },
    ({ collection, slug }) => attempt(() => getEntry(db, collection, slug)),
  )

  for (const collection of COLLECTION_NAMES) {
    const { tool, label } = COLLECTION_TOOLS[collection]
    const schema = COLLECTIONS[collection].schema

    server.registerTool(
      `create_${tool}`,
      {
        title: `Create ${label}`,
        description: `Creates a ${label}. The slug is generated from the name/title. Returns the stored entry.`,
        inputSchema: { data: schema },
      },
      ({ data }) =>
        attempt(async () => {
          const entry = createEntry(db, collection, data, user.id)
          return { entry, siteRefreshed: await refresh([collection]) }
        }),
    )

    server.registerTool(
      `update_${tool}`,
      {
        title: `Update ${label}`,
        description: `Changes a ${label}. Send only the top-level fields that change; the rest is kept.`,
        inputSchema: { slug: slugSchema, changes: schema.partial(), expectedVersion: expectedVersionSchema },
      },
      ({ slug, changes, expectedVersion }) =>
        attempt(async () => {
          const current = getEntry(db, collection, slug)
          const merged = { ...(current.data as Record<string, unknown>), ...changes }
          const entry = updateEntry(db, collection, slug, merged, expectedVersion ?? current.version, user.id)
          return { entry, siteRefreshed: await refresh([collection]) }
        }),
    )
  }

  server.registerTool(
    'delete_entry',
    {
      title: 'Delete entry',
      description: 'Permanently deletes an entry and removes links to it from other entries. Cannot be undone.',
      inputSchema: { collection: collectionSchema, slug: slugSchema },
      annotations: { destructiveHint: true },
    },
    ({ collection, slug }) =>
      attempt(async () => {
        const touched = deleteEntry(db, collection, slug)
        return { deleted: `${collection}/${slug}`, siteRefreshed: await refresh(touched) }
      }),
  )

  server.registerTool(
    'get_settings',
    {
      title: 'Get settings',
      description: 'Returns company contacts ("company") or the dealer list ("dealers") with its version.',
      inputSchema: { key: settingsSchema },
      annotations: { readOnlyHint: true },
    },
    ({ key }) => attempt(() => getSettings(db, key)),
  )

  for (const key of SETTINGS_KEYS) {
    server.registerTool(
      `update_${key}`,
      {
        title: `Update ${key}`,
        description:
          key === 'company'
            ? 'Changes company contacts (phone, email, address). Send only the fields that change.'
            : 'Replaces the dealer list. Send the whole "dealers" array (get_settings first).',
        inputSchema: { changes: SETTINGS[key].partial(), expectedVersion: expectedVersionSchema },
      },
      ({ changes, expectedVersion }) =>
        attempt(async () => {
          const current = getSettings(db, key)
          const merged = { ...(current.data as Record<string, unknown>), ...changes }
          const entry = saveSettings(db, key, merged, expectedVersion ?? current.version, user.id)
          return { entry, siteRefreshed: await refresh([key]) }
        }),
    )
  }

  server.registerTool(
    'upload_image',
    {
      title: 'Upload image',
      description: `Stores a JPEG, PNG, WebP or AVIF image (up to ${Math.round(options.maxUploadBytes / 1024 / 1024)} MB) and returns its path for image fields. Give either a public link or base64 data.`,
      inputSchema: {
        url: z.string().url().optional().describe('Public http(s) link to the image'),
        base64: z.string().optional().describe('Image bytes as base64 (a data: URL prefix is allowed)'),
      },
    },
    ({ url, base64 }) =>
      attempt(async () => {
        if (Boolean(url) === Boolean(base64)) throw new UploadError('Give exactly one of url or base64')
        const bytes = url
          ? await downloadImage(url, options.maxUploadBytes)
          : Buffer.from((base64 ?? '').replace(/^data:[^,]*,/, ''), 'base64')
        return { path: await saveImage(options.uploadsDir, bytes, options.maxUploadBytes) }
      }),
  )

  server.registerTool(
    'list_users',
    {
      title: 'List admin users',
      description: 'Lists people who can sign in to the admin.',
      annotations: { readOnlyHint: true },
    },
    () => attempt(() => listUsers(db)),
  )

  server.registerTool(
    'create_user',
    {
      title: 'Create admin user',
      description: 'Adds a person who can sign in to the admin.',
      inputSchema: {
        login: z.string().trim().min(3).max(64).regex(/^[\w.@-]+$/),
        name: z.string().trim().min(1).max(100),
        password: z.string().min(MIN_PASSWORD_LENGTH),
      },
    },
    ({ login, name, password }) =>
      attempt(async () => {
        if (findUserWithHash(db, login)) throw new ConflictError(`Login ${login} is taken`)
        return createUser(db, login, name, await hashPassword(password))
      }),
  )

  server.registerTool(
    'delete_user',
    {
      title: 'Delete admin user',
      description: 'Removes an admin user and their tokens. You cannot delete yourself.',
      inputSchema: { id: z.number().int().positive() },
      annotations: { destructiveHint: true },
    },
    ({ id }) =>
      attempt(() => {
        if (id === user.id) throw new ConflictError('You cannot delete yourself')
        if (!deleteUser(db, id)) throw new NotFoundError('User not found')
        return { deleted: id }
      }),
  )
}

/** Answers one MCP request. Stateless: every request gets a fresh server bound to the token's user. */
export async function handleMcpRequest(request: Request, options: McpOptions, user: User): Promise<Response> {
  const server = new McpServer({ name: 'kazkioti-admin', version: '1.0.0' }, { instructions: INSTRUCTIONS })
  registerTools(server, options, user)
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true })
  await server.connect(transport)
  try {
    return await transport.handleRequest(request)
  } finally {
    await server.close()
  }
}
