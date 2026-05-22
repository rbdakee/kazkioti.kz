# KAZKIOTI

Next.js 14 + React 18 + TypeScript + Tailwind. Bilingual (RU/KK) marketing site for the Kazakhstan tractor manufacturer.

## Develop

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000 (auto-redirects to `/ru`).

Visual component index: `/ru/dev` (excluded from production sitemap and robots).

## Build

```bash
pnpm build
pnpm start
```

## Typecheck and lint

```bash
pnpm typecheck
pnpm lint
```

## CI

`.github/workflows/ci.yml` runs `typecheck` + `lint` + `build` on every push to `main` and every pull request.

## Deploy (Vercel)

1. Import this repository at https://vercel.com/new → "Import Git Repository".
2. Vercel auto-detects Next.js; `vercel.json` pins the region to `fra1` (Frankfurt) and the package manager to pnpm.
3. Set environment variables in **Project Settings → Environment Variables**. See `.env.example` for the list:
   - `NEXT_PUBLIC_SITE_URL` — production origin (`https://kazkioti.kz`).
   - `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_TO` — required for `/api/lead` to deliver email.
   - `KV_REST_API_URL`, `KV_REST_API_TOKEN` — optional; enables rate-limiting on `/api/lead`. Provision Vercel KV from the **Storage** tab and it will inject these automatically.
   - `WHATSAPP_NUMBER`, `TELEGRAM_USERNAME` — messenger deep-link configuration.
   - `NEXT_PUBLIC_YANDEX_METRICA_ID` — Yandex.Metrica counter ID. When unset, the tracker is not loaded.
   - `NEXT_PUBLIC_GA4_MEASUREMENT_ID` — GA4 measurement ID (e.g. `G-XXXXXXX`). When unset, the tracker is not loaded.
   - `GOOGLE_SITE_VERIFICATION` — value of the Google Search Console verification meta tag. Omitted from `<head>` when unset.
   - `YANDEX_VERIFICATION` — value of the Yandex Webmaster verification meta tag. Omitted from `<head>` when unset.
4. Deploy. Every push to `main` ships to production; every PR gets a preview URL.

### DNS

Point the apex `kazkioti.kz` (and `www.kazkioti.kz` as alias) to Vercel per **Project Settings → Domains**.

## Project docs

- `ARCHITECTURE.md` — canonical architecture blueprint
- `CLAUDE.md` — coding principles
- `PLAN.md` — workflow and phase plan
- `MEMORY.md` — locked decisions and content gaps
- `docs/DESIGN.md` — visual/design TZ
- `docs/kazkioti.md` — company and product source data
