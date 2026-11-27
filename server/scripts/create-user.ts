// Usage: pnpm user:create <login> "<Name>"   — the password is read from stdin.
import { createInterface } from 'node:readline/promises'
import { MIN_PASSWORD_LENGTH, createUser, findUserWithHash, hashPassword, setPassword } from '../src/auth'
import { config } from '../src/config'
import { openDatabase } from '../src/db'

const [login, name] = process.argv.slice(2)
if (!login || !name) {
  console.error('Usage: pnpm user:create <login> "<Name>"')
  process.exit(1)
}

const prompt = createInterface({ input: process.stdin, output: process.stdout })
const password = (await prompt.question(`Password for ${login} (min ${MIN_PASSWORD_LENGTH} chars): `)).trim()
prompt.close()
if (password.length < MIN_PASSWORD_LENGTH) {
  console.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
  process.exit(1)
}

const db = openDatabase(config.databaseFile)
const existing = findUserWithHash(db, login)
if (existing) {
  setPassword(db, existing.id, await hashPassword(password))
  console.log(`Password updated for ${login}`)
} else {
  createUser(db, login, name, await hashPassword(password))
  console.log(`User ${login} created`)
}
db.close()
