import { serve } from '@hono/node-server'
import { createApp } from './app'
import { deleteExpiredSessions } from './auth'
import { config } from './config'
import { openDatabase } from './db'

const db = openDatabase(config.databaseFile)
deleteExpiredSessions(db)
setInterval(() => deleteExpiredSessions(db), 60 * 60 * 1000).unref()

const app = createApp({
  db,
  uploadsDir: config.uploadsDir,
  staticRoot: config.dataDir,
  sessionTtlMs: config.sessionTtlMs,
  maxUploadBytes: config.maxUploadBytes,
  revalidate: { urls: config.revalidateUrls, secret: config.revalidateSecret },
})

const server = serve({ fetch: app.fetch, port: config.port }, ({ port }) => {
  console.log(`KAZKIOTI CMS listening on :${port}, data in ${config.dataDir}`)
  if (config.revalidateUrls.length === 0) console.warn('SITE_REVALIDATE_URLS is empty: the site will not refresh after edits')
})

function shutdown() {
  server.close(() => {
    db.close()
    process.exit(0)
  })
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
