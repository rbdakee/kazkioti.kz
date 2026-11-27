import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import type { Db } from './db'
import { nowIso } from './db'

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keyLength: number,
) => Promise<Buffer>

const KEY_LENGTH = 64
export const MIN_PASSWORD_LENGTH = 10

export interface User {
  id: number
  login: string
  name: string
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const hash = await scryptAsync(password, salt, KEY_LENGTH)
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, hashHex] = stored.split('$')
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false
  const expected = Buffer.from(hashHex, 'hex')
  const actual = await scryptAsync(password, Buffer.from(saltHex, 'hex'), expected.length)
  return timingSafeEqual(actual, expected)
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function createUser(db: Db, login: string, name: string, passwordHash: string): User {
  const result = db
    .prepare('INSERT INTO users (login, name, password_hash, created_at) VALUES (?, ?, ?, ?)')
    .run(login, name, passwordHash, nowIso())
  return { id: Number(result.lastInsertRowid), login, name }
}

export function listUsers(db: Db): Array<User & { createdAt: string }> {
  return db
    .prepare('SELECT id, login, name, created_at AS createdAt FROM users ORDER BY id')
    .all() as Array<User & { createdAt: string }>
}

export function findUserWithHash(
  db: Db,
  login: string,
): (User & { passwordHash: string }) | undefined {
  return db
    .prepare('SELECT id, login, name, password_hash AS passwordHash FROM users WHERE login = ?')
    .get(login) as (User & { passwordHash: string }) | undefined
}

export function setPassword(db: Db, userId: number, passwordHash: string): void {
  db.transaction(() => {
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, userId)
    // A password change signs the user out everywhere.
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId)
  })()
}

export function deleteUser(db: Db, userId: number): boolean {
  return db.prepare('DELETE FROM users WHERE id = ?').run(userId).changes > 0
}

export function createSession(db: Db, userId: number, ttlMs: number): { token: string; expiresAt: number } {
  const token = randomBytes(32).toString('base64url')
  const expiresAt = Date.now() + ttlMs
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(
    hashToken(token),
    userId,
    expiresAt,
  )
  return { token, expiresAt }
}

export function findSessionUser(db: Db, token: string): User | undefined {
  return db
    .prepare(
      `SELECT users.id, users.login, users.name FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = ? AND sessions.expires_at > ?`,
    )
    .get(hashToken(token), Date.now()) as User | undefined
}

export function deleteSession(db: Db, token: string): void {
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token))
}

export function deleteExpiredSessions(db: Db): void {
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now())
}

/**
 * Counts failed sign-ins per login and per client address so guessing a
 * password is slow. In memory on purpose: one small server, resets on restart.
 */
export class LoginThrottle {
  private readonly failures = new Map<string, number[]>()

  constructor(
    private readonly maxFailures = 5,
    private readonly windowMs = 15 * 60 * 1000,
  ) {}

  isBlocked(keys: readonly string[]): boolean {
    return keys.some((key) => this.recent(key).length >= this.maxFailures)
  }

  recordFailure(keys: readonly string[]): void {
    for (const key of keys) this.failures.set(key, [...this.recent(key), Date.now()])
  }

  reset(keys: readonly string[]): void {
    for (const key of keys) this.failures.delete(key)
  }

  private recent(key: string): number[] {
    const since = Date.now() - this.windowMs
    return (this.failures.get(key) ?? []).filter((time) => time > since)
  }
}
