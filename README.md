# KAZKIOTI

Next.js 14 + React 18 + TypeScript + Tailwind. Bilingual (RU/KK) marketing site for the Kazakhstan tractor manufacturer.

## Как обновлять сайт

Сайт размещён на Vercel и подключён к этому репозиторию. **Любой push в ветку `main` автоматически публикует сайт** на https://kazkioti.kz примерно за 1–2 минуты. Больше ничего делать не нужно.

### Где что лежит

| Что меняем | Где |
|---|---|
| Тексты интерфейса (меню, кнопки, заголовки) | `messages/ru.json`, `messages/kk.json` |
| Тракторы, навесное оборудование, новости, кейсы, FAQ | `content/<раздел>/<название>.ru.mdx` и `.kk.mdx` |
| Картинки | `public/images/` |

Сайт двуязычный: меняя текст на русском, не забудьте поправить и казахскую версию.

### Первая настройка (один раз)

Нужны [Git](https://git-scm.com), [Node.js 20](https://nodejs.org) и pnpm (`npm install -g pnpm`).

```bash
git clone https://github.com/rbdakee/kazkioti.kz.git
cd kazkioti.kz
pnpm install
```

### Внести изменения

```bash
git pull                     # забрать свежую версию
pnpm dev                     # посмотреть локально: http://localhost:3000
# ...правки...
pnpm build                   # убедиться, что сайт собирается без ошибок
git add .
git commit -m "Обновил цены на KH-AG-140"
git push                     # после этого сайт обновится сам
```

Небольшие правки текста можно делать прямо на GitHub: откройте файл → значок карандаша → **Commit changes** в ветку `main`.

### Как проверить, что всё опубликовалось

- **GitHub** → вкладка **Actions**: зелёная галочка означает, что проверки пройдены, красный крестик — что есть ошибка (нажмите на него, чтобы увидеть текст).
- **Vercel** → проект → **Deployments**: статус **Ready** означает, что сайт обновлён, **Error** — что сборка упала.

Если сборка упала, **рабочий сайт не ломается**: остаётся предыдущая версия. Исправьте ошибку и сделайте push ещё раз.

### Безопасный способ: проверить перед публикацией

1. Создайте ветку: `git checkout -b my-change`, внесите правки, затем `git push -u origin my-change`.
2. На GitHub откройте **Pull Request** в `main`. Vercel пришлёт в него ссылку на preview-версию сайта.
3. Если всё выглядит хорошо, нажмите **Merge**, и изменения уйдут на основной сайт.

### Откат

Vercel → **Deployments** → выберите последнюю рабочую версию → **⋯** → **Instant Rollback**. Сайт вернётся к ней за секунды.

### Важно

- Репозиторий **публичный**, поэтому никогда не коммитьте пароли, API-ключи и токены. Секреты хранятся только в Vercel → **Settings → Environment Variables** (список в `.env.example`). После изменения переменных нужен Redeploy.
- Файл `.env.local` предназначен только для локальной разработки и в git не попадает.

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
