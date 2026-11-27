# KAZKIOTI CMS

Backend for the site admin (`/admin`): content API, logins and photo storage.
Node 22 + Hono + SQLite. Everything it stores lives in `DATA_DIR`: `cms.sqlite` and `uploads/`.

## Local development

```bash
cd server
pnpm install
pnpm seed                     # load the current site content (refuses if data exists; --force to overwrite)
pnpm user:create admin "Администратор"   # asks for a password (10+ characters)
SITE_REVALIDATE_URLS=http://localhost:3000/api/revalidate REVALIDATE_SECRET=local-dev-revalidate-secret pnpm dev
```

The site needs `CMS_URL=http://localhost:4000` and the same `REVALIDATE_SECRET` in `.env.local`.

`pnpm test` runs the API tests, `pnpm typecheck` checks types.

## Deploying to a VPS

Requires Docker with the compose plugin and a DNS A record (e.g. `api.kazkioti.kz`) pointing at the server.

```bash
git clone <repo> kazkioti && cd kazkioti/server/deploy
cp .env.example .env          # fill CMS_DOMAIN and REVALIDATE_SECRET
docker compose up -d --build
docker compose exec cms node --import tsx scripts/seed.ts            # first deploy only
docker compose exec cms node --import tsx scripts/create-user.ts admin "Администратор"
```

Caddy gets the HTTPS certificate automatically. Then set on the site (Vercel):

- `CMS_URL=https://api.kazkioti.kz`
- `REVALIDATE_SECRET=` the same value as in `deploy/.env`

Update: `git pull && docker compose up -d --build`.

## Backups

Content and photos are in the `cms_data` Docker volume. A consistent copy while running:

```bash
docker compose exec cms node -e "require('better-sqlite3')('/data/cms.sqlite').backup('/data/backup.sqlite').then(()=>console.log('ok'))"
docker compose cp cms:/data/backup.sqlite ./backup-$(date +%F).sqlite
docker compose cp cms:/data/uploads ./uploads-backup
```

Run it daily from cron and keep copies off the server.
