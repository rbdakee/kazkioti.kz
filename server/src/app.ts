import { Hono, type Context } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { HTTPException } from 'hono/http-exception'
import { secureHeaders } from 'hono/secure-headers'
import { serveStatic } from '@hono/node-server/serve-static'
import { z } from 'zod'
import {
  COLLECTION_NAMES,
  SETTINGS_KEYS,
  type CollectionName,
  type SettingsKey,
} from '../../shared/content'
import {
  LoginThrottle,
  MIN_PASSWORD_LENGTH,
  createSession,
  createUser,
  deleteSession,
  deleteUser,
  findSessionUser,
  findUserWithHash,
  hashPassword,
  listUsers,
  setPassword,
  verifyPassword,
  type User,
} from './auth'
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
  listPublicEntries,
  listRecentEntries,
  saveSettings,
  updateEntry,
} from './entries'
import { handleMcpRequest } from './mcp'
import { revalidateSite, type RevalidateTarget } from './revalidate'
import { createApiToken, deleteApiToken, findApiTokenUser, isApiToken, listApiTokens } from './tokens'
import { UploadError, saveUpload } from './uploads'

export interface AppOptions {
  db: Db
  uploadsDir: string
  /** Directory that contains `uploads/`, served as static files. */
  staticRoot: string
  sessionTtlMs: number
  maxUploadBytes: number
  revalidate: RevalidateTarget
}

type Env = { Variables: { user: User; token: string } }

const LoginSchema = z.object({ login: z.string().trim().min(1), password: z.string().min(1) })
const PasswordSchema = z.string().min(MIN_PASSWORD_LENGTH)
const NewUserSchema = z.object({
  login: z.string().trim().min(3).max(64).regex(/^[\w.@-]+$/),
  name: z.string().trim().min(1).max(100),
  password: PasswordSchema,
})
const TokenNameSchema = z.object({ name: z.string().trim().min(1).max(100) })
const SaveSchema = z.object({ data: z.unknown(), expectedVersion: z.number().int().positive().optional() })

function collectionParam(c: Context): CollectionName {
  const name = c.req.param('collection')
  if (!COLLECTION_NAMES.includes(name as CollectionName)) throw new HTTPException(404)
  return name as CollectionName
}

function settingsParam(c: Context): SettingsKey {
  const key = c.req.param('key')
  if (!SETTINGS_KEYS.includes(key as SettingsKey)) throw new HTTPException(404)
  return key as SettingsKey
}

async function jsonBody<T>(c: Context, schema: z.ZodType<T>): Promise<T> {
  const body: unknown = await c.req.json().catch(() => {
    throw new HTTPException(400, { message: 'Expected JSON body' })
  })
  const result = schema.safeParse(body)
  if (!result.success) {
    throw new ValidationError(
      result.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
    )
  }
  return result.data
}

function bearerToken(c: Context): string | undefined {
  const header = c.req.header('authorization')
  return header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined
}

export function createApp(options: AppOptions) {
  const { db } = options
  const throttle = new LoginThrottle()
  const app = new Hono<Env>()

  app.use('*', secureHeaders({ crossOriginResourcePolicy: 'cross-origin' }))

  app.onError((error, c) => {
    if (error instanceof ValidationError) return c.json({ error: 'validation', issues: error.issues }, 422)
    if (error instanceof NotFoundError) return c.json({ error: 'not_found' }, 404)
    if (error instanceof ConflictError) return c.json({ error: 'conflict', message: error.message }, 409)
    if (error instanceof UploadError) return c.json({ error: 'upload', message: error.message }, 400)
    if (error instanceof HTTPException) return c.json({ error: error.message || 'http_error' }, error.status)
    console.error(error)
    return c.json({ error: 'internal' }, 500)
  })
  app.notFound((c) => c.json({ error: 'not_found' }, 404))

  app.get('/health', (c) => c.json({ ok: true }))

  // Uploaded photos and PDFs: random names, so they can be cached forever.
  app.use(
    '/uploads/*',
    async (c, next) => {
      await next()
      if (c.res.ok) {
        c.header('cache-control', 'public, max-age=31536000, immutable')
        c.header('x-content-type-options', 'nosniff')
      }
    },
    serveStatic({ root: options.staticRoot }),
  )

  // ---- Public, read-only content for the site ------------------------------
  app.get('/public/collections/:collection', (c) => {
    const entries = listPublicEntries(db, collectionParam(c))
    return c.json(entries.map(({ slug, data, version, updatedAt }) => ({ slug, data, version, updatedAt })))
  })

  app.get('/public/settings/:key', (c) => {
    const { data, updatedAt } = getSettings(db, settingsParam(c))
    return c.json({ data, updatedAt })
  })

  // ---- Sign-in -------------------------------------------------------------
  app.post('/auth/login', async (c) => {
    const { login, password } = await jsonBody(c, LoginSchema)
    const keys = [`login:${login.toLowerCase()}`, `ip:${c.req.header('x-forwarded-for') ?? 'unknown'}`]
    if (throttle.isBlocked(keys)) return c.json({ error: 'too_many_attempts' }, 429)
    const user = findUserWithHash(db, login)
    const valid = user ? await verifyPassword(password, user.passwordHash) : await hashPassword(password).then(() => false)
    if (!user || !valid) {
      throttle.recordFailure(keys)
      return c.json({ error: 'invalid_credentials' }, 401)
    }
    throttle.reset(keys)
    const session = createSession(db, user.id, options.sessionTtlMs)
    return c.json({ ...session, user: { id: user.id, login: user.login, name: user.name } })
  })

  // ---- MCP for AI assistants, authorised by an API token ---------------------
  // The token comes in the Authorization header, or in the path for clients that
  // cannot send headers (claude.ai and ChatGPT connectors).
  const mcpBodyLimit = bodyLimit({ maxSize: Math.ceil((options.maxUploadBytes * 4) / 3) + 1024 * 1024 })
  const mcp = async (c: Context, token: string | undefined) => {
    const user = token && isApiToken(token) ? findApiTokenUser(db, token) : undefined
    if (!user) return c.json({ error: 'unauthorized' }, 401)
    return handleMcpRequest(c.req.raw, options, user)
  }
  app.all('/mcp', mcpBodyLimit, (c) => mcp(c, bearerToken(c)))
  app.all('/mcp/:token', mcpBodyLimit, (c) => mcp(c, c.req.param('token')))

  // ---- Everything below requires a session ---------------------------------
  const admin = new Hono<Env>()

  admin.use('*', async (c, next) => {
    const token = bearerToken(c)
    const user = token ? findSessionUser(db, token) : undefined
    if (!token || !user) return c.json({ error: 'unauthorized' }, 401)
    c.set('user', user)
    c.set('token', token)
    await next()
  })

  admin.get('/me', (c) => c.json(c.get('user')))

  admin.post('/logout', (c) => {
    deleteSession(db, c.get('token'))
    return c.json({ ok: true })
  })

  admin.get('/recent', (c) => c.json(listRecentEntries(db, 8)))

  admin.get('/collections/:collection', (c) => c.json(listEntries(db, collectionParam(c))))

  admin.get('/collections/:collection/:slug', (c) =>
    c.json(getEntry(db, collectionParam(c), c.req.param('slug'))),
  )

  admin.post('/collections/:collection', async (c) => {
    const collection = collectionParam(c)
    const { data } = await jsonBody(c, SaveSchema)
    const entry = createEntry(db, collection, data, c.get('user').id)
    const revalidated = await revalidateSite(options.revalidate, [collection])
    return c.json({ entry, revalidated }, 201)
  })

  admin.put('/collections/:collection/:slug', async (c) => {
    const collection = collectionParam(c)
    const { data, expectedVersion } = await jsonBody(c, SaveSchema)
    const entry = updateEntry(db, collection, c.req.param('slug'), data, expectedVersion, c.get('user').id)
    const revalidated = await revalidateSite(options.revalidate, [collection])
    return c.json({ entry, revalidated })
  })

  admin.delete('/collections/:collection/:slug', async (c) => {
    const touched = deleteEntry(db, collectionParam(c), c.req.param('slug'))
    const revalidated = await revalidateSite(options.revalidate, touched)
    return c.json({ ok: true, revalidated })
  })

  admin.get('/settings/:key', (c) => c.json(getSettings(db, settingsParam(c))))

  admin.put('/settings/:key', async (c) => {
    const key = settingsParam(c)
    const { data, expectedVersion } = await jsonBody(c, SaveSchema)
    const entry = saveSettings(db, key, data, expectedVersion, c.get('user').id)
    const revalidated = await revalidateSite(options.revalidate, [key])
    return c.json({ entry, revalidated })
  })

  admin.post('/uploads', bodyLimit({ maxSize: options.maxUploadBytes + 64 * 1024 }), async (c) => {
    const body = await c.req.parseBody()
    const file = body.file
    if (!(file instanceof File)) throw new UploadError('Expected a file in the "file" field')
    const bytes = Buffer.from(await file.arrayBuffer())
    const path = await saveUpload(options.uploadsDir, bytes, options.maxUploadBytes, ['image', 'pdf'])
    return c.json({ path }, 201)
  })

  admin.get('/users', (c) => c.json(listUsers(db)))

  admin.post('/users', async (c) => {
    const { login, name, password } = await jsonBody(c, NewUserSchema)
    if (findUserWithHash(db, login)) throw new ConflictError(`Login ${login} is taken`)
    return c.json(createUser(db, login, name, await hashPassword(password)), 201)
  })

  admin.delete('/users/:id', (c) => {
    const id = Number(c.req.param('id'))
    if (id === c.get('user').id) throw new HTTPException(400, { message: 'You cannot delete yourself' })
    if (!deleteUser(db, id)) throw new NotFoundError('User not found')
    return c.json({ ok: true })
  })

  admin.get('/tokens', (c) => c.json(listApiTokens(db)))

  admin.post('/tokens', async (c) => {
    const { name } = await jsonBody(c, TokenNameSchema)
    return c.json(createApiToken(db, c.get('user').id, name), 201)
  })

  admin.delete('/tokens/:id', (c) => {
    if (!deleteApiToken(db, Number(c.req.param('id')))) throw new NotFoundError('Token not found')
    return c.json({ ok: true })
  })

  admin.put('/me/password', async (c) => {
    const { currentPassword, newPassword } = await jsonBody(
      c,
      z.object({ currentPassword: z.string().min(1), newPassword: PasswordSchema }),
    )
    const user = c.get('user')
    const stored = findUserWithHash(db, user.login)
    if (!stored || !(await verifyPassword(currentPassword, stored.passwordHash))) {
      return c.json({ error: 'invalid_credentials' }, 401)
    }
    setPassword(db, user.id, await hashPassword(newPassword))
    return c.json({ ok: true })
  })

  app.route('/admin', admin)
  return app
}
