import { randomBytes } from 'node:crypto'
import { hashToken, type User } from './auth'
import type { Db } from './db'
import { nowIso } from './db'

/** Long-lived tokens for MCP clients; only a hash is stored, the token is shown once. */
const TOKEN_PREFIX = 'kzk_'

export interface ApiToken {
  id: number
  name: string
  userId: number
  userName: string
  createdAt: string
  lastUsedAt: string | null
}

export function isApiToken(value: string): boolean {
  return value.startsWith(TOKEN_PREFIX)
}

export function createApiToken(db: Db, userId: number, name: string): ApiToken & { token: string } {
  const token = `${TOKEN_PREFIX}${randomBytes(32).toString('base64url')}`
  const result = db
    .prepare('INSERT INTO api_tokens (user_id, name, token_hash, created_at) VALUES (?, ?, ?, ?)')
    .run(userId, name, hashToken(token), nowIso())
  const created = listApiTokens(db).find((row) => row.id === Number(result.lastInsertRowid))
  if (!created) throw new Error('Token was not stored')
  return { ...created, token }
}

export function listApiTokens(db: Db): ApiToken[] {
  return db
    .prepare(
      `SELECT api_tokens.id, api_tokens.name, api_tokens.user_id AS userId, users.name AS userName,
              api_tokens.created_at AS createdAt, api_tokens.last_used_at AS lastUsedAt
       FROM api_tokens JOIN users ON users.id = api_tokens.user_id
       ORDER BY api_tokens.id`,
    )
    .all() as ApiToken[]
}

export function deleteApiToken(db: Db, id: number): boolean {
  return db.prepare('DELETE FROM api_tokens WHERE id = ?').run(id).changes > 0
}

/** Resolves a token to its owner and records the use. */
export function findApiTokenUser(db: Db, token: string): User | undefined {
  const tokenHash = hashToken(token)
  const user = db
    .prepare(
      `SELECT users.id, users.login, users.name FROM api_tokens
       JOIN users ON users.id = api_tokens.user_id WHERE api_tokens.token_hash = ?`,
    )
    .get(tokenHash) as User | undefined
  if (user) db.prepare('UPDATE api_tokens SET last_used_at = ? WHERE token_hash = ?').run(nowIso(), tokenHash)
  return user
}
