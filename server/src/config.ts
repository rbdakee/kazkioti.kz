import path from 'node:path'
import { z } from 'zod'

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  /** Holds the SQLite database and uploaded files; back this directory up. */
  DATA_DIR: z.string().default('./data'),
  /** Site endpoints that drop cached pages after an edit, comma-separated. */
  SITE_REVALIDATE_URLS: z
    .string()
    .default('')
    .transform((value) =>
      value
        .split(',')
        .map((url) => url.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string().url())),
  REVALIDATE_SECRET: z.string().default(''),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(14),
  MAX_UPLOAD_MB: z.coerce.number().positive().default(10),
})

function loadConfig() {
  const env = EnvSchema.parse(process.env)
  if (env.SITE_REVALIDATE_URLS.length > 0 && env.REVALIDATE_SECRET.length < 16) {
    throw new Error('REVALIDATE_SECRET (16+ characters) is required when SITE_REVALIDATE_URLS is set')
  }
  const dataDir = path.resolve(env.DATA_DIR)
  return {
    port: env.PORT,
    dataDir,
    databaseFile: path.join(dataDir, 'cms.sqlite'),
    uploadsDir: path.join(dataDir, 'uploads'),
    revalidateUrls: env.SITE_REVALIDATE_URLS,
    revalidateSecret: env.REVALIDATE_SECRET,
    sessionTtlMs: env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
    maxUploadBytes: Math.round(env.MAX_UPLOAD_MB * 1024 * 1024),
  }
}

export type Config = ReturnType<typeof loadConfig>

export const config = loadConfig()
