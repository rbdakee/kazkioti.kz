# ARCHITECTURE.md — KAZKIOTI

## 1. Stack Summary and Rationale

The project uses **Next.js 14 (App Router) with React 18**, TypeScript 5, Tailwind CSS 3, deployed on Vercel. Next.js 14 is pinned over 15 because React 19 with Server Components is still stabilizing ecosystem compatibility with `next-intl` and several MDX packages; React 18 is production-stable and sufficient. The App Router provides native support for `[locale]` dynamic segments, per-route `generateMetadata`, and RSC-first rendering which eliminates JavaScript overhead on static content-heavy pages (tractor specs, news articles). Tailwind 3 is used because the design tokens from `theme.css` map cleanly to a Tailwind theme extension with no runtime overhead. Package manager is **pnpm** — faster installs in CI, strict dependency resolution, symlink isolation prevents phantom dependency issues in the Vercel build environment. The MDX-in-repo CMS is implemented via `next-mdx-remote` with `gray-matter` frontmatter parsing and Zod validation; this keeps content in Git, requires no external service in v1, and the data-access layer (`lib/content/`) is the single swap point for future Sanity/Strapi migration.

---

## 2. Folder Layout

```
kazkioti/
├── app/
│   └── [locale]/                    # locale segment: "ru" | "kk"
│       ├── layout.tsx               # root locale layout: fonts, i18n provider, Header, Footer, FAB, CookieBanner
│       ├── page.tsx                 # Home /
│       ├── tractors/
│       │   ├── page.tsx             # /tractors — catalog with filter pills
│       │   ├── compare/
│       │   │   └── page.tsx         # /tractors/compare
│       │   └── [model]/
│       │       └── page.tsx         # /tractors/[model] — tractor detail
│       ├── attachments/
│       │   └── page.tsx             # /attachments — tabbed catalog
│       ├── parts/
│       │   └── page.tsx             # /parts
│       ├── dealers/
│       │   └── page.tsx             # /dealers — map + sidebar list
│       ├── cases/
│       │   ├── page.tsx             # /cases — grid list
│       │   └── [slug]/
│       │       └── page.tsx         # /cases/[slug]
│       ├── news/
│       │   ├── page.tsx             # /news — list with tag filter
│       │   └── [slug]/
│       │       └── page.tsx         # /news/[slug]
│       ├── about/
│       │   └── page.tsx             # /about
│       ├── faq/
│       │   └── page.tsx             # /faq
│       └── contacts/
│           └── page.tsx             # /contacts
│
├── app/
│   ├── api/
│   │   └── lead/
│   │       └── route.ts             # POST handler: validate, send, respond
│   ├── sitemap.ts                   # dynamic sitemap for all routes × locales
│   ├── robots.ts                    # robots.txt
│   └── opengraph-image.tsx          # default OG image via next/og
│
├── components/
│   ├── ui/                          # Primitive, reusable, locale-agnostic
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Select.tsx
│   │   ├── PhoneInput.tsx
│   │   ├── FormField.tsx            # label + input + error message wrapper
│   │   ├── Pill.tsx                 # filter tag pill (active/inactive)
│   │   ├── Eyebrow.tsx              # mono uppercase with red rule prefix
│   │   ├── SectionHeader.tsx        # eyebrow + h2 + lede + optional link
│   │   ├── Breadcrumbs.tsx
│   │   ├── Pagination.tsx
│   │   ├── Accordion.tsx            # FAQ accordion (details/summary)
│   │   ├── Tabs.tsx                 # tabbed interface
│   │   ├── Modal.tsx                # dialog overlay (desktop)
│   │   ├── Sheet.tsx                # bottom-sheet (mobile alt to Modal)
│   │   ├── Toast.tsx                # form submission feedback
│   │   ├── VideoPlayer.tsx          # lazy video with poster
│   │   ├── SpecTable.tsx            # spec-group grid (k/v rows)
│   │   ├── Card/
│   │   │   ├── CardTractor.tsx
│   │   │   ├── CardNews.tsx
│   │   │   └── CardCase.tsx
│   │   └── Map/
│   │       ├── DealersMap.tsx       # SVG Kazakhstan map with click pins
│   │       └── MapPin.tsx           # pin + popup card
│   │
│   ├── sections/                    # Page-level blocks (Server Components unless noted)
│   │   ├── Header.tsx               # sticky header + mobile menu (Client)
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx                 # home hero with video + metrics
│   │   ├── UTPStripe.tsx            # 3-column UTP block
│   │   ├── TractorGrid.tsx          # 3-col grid of CardTractor with filter pills
│   │   ├── FactorySplit.tsx         # left text + right video/gallery split
│   │   ├── CompareBanner.tsx        # promo block → /tractors/compare
│   │   ├── CasesGrid.tsx            # 3-col cases grid
│   │   ├── NewsGrid.tsx             # 3-col news grid
│   │   ├── DealersMapPreview.tsx    # SVG map preview with CTA
│   │   ├── FinalCTA.tsx             # 2-col: text + MiniContactForm
│   │   ├── CompareTray.tsx          # sticky bottom tray when models selected (Client)
│   │   └── CookieBanner.tsx         # bottom-left cookie bar (Client)
│   │
│   └── forms/
│       ├── MiniContactForm.tsx      # name + phone + submit (Client)
│       ├── LeadForm.tsx             # full form: name, phone, model, comment (Client)
│       └── MessengerFAB.tsx         # pulsing FAB with WhatsApp/Telegram expansion (Client)
│
├── content/
│   ├── tractors/
│   │   ├── df-404.ru.mdx
│   │   ├── df-404.kk.mdx
│   │   ├── df-904.ru.mdx
│   │   └── ...                     # one file per model per locale
│   ├── attachments/
│   │   ├── bd-30.ru.mdx
│   │   └── ...
│   ├── cases/
│   │   ├── ak-zhayyk-df904.ru.mdx
│   │   └── ...
│   ├── news/
│   │   ├── 2026-04-12-delivery-df904.ru.mdx
│   │   └── ...
│   └── faq/
│       ├── warranty.ru.mdx          # one file per category per locale
│       └── ...
│
├── lib/
│   ├── content/
│   │   ├── tractors.ts             # getAllTractors(), getTractor(model, locale)
│   │   ├── attachments.ts          # getAllAttachments(), getAttachment(slug, locale)
│   │   ├── cases.ts                # getAllCases(), getCase(slug, locale)
│   │   ├── news.ts                 # getAllNews(), getNews(slug, locale)
│   │   └── faq.ts                  # getAllFAQGroups(locale)
│   ├── i18n/
│   │   ├── routing.ts              # next-intl defineRouting config
│   │   └── request.ts              # getRequestConfig for next-intl
│   ├── types/
│   │   ├── tractor.ts              # TractorFrontmatter Zod schema + inferred type
│   │   ├── attachment.ts
│   │   ├── case.ts
│   │   ├── news.ts
│   │   └── faq.ts
│   ├── utils/
│   │   ├── slugify.ts              # model slug normalization
│   │   ├── formatPhone.ts          # +7 (___) ___-__-__ masking
│   │   └── cn.ts                   # clsx + tailwind-merge helper
│   └── constants.ts                # site URL, phone, email, messenger links, nav items
│
├── messages/
│   ├── ru.json                     # Russian UI strings
│   └── kk.json                     # Kazakh UI strings
│
├── public/
│   ├── images/
│   │   ├── tractors/               # tractor photography
│   │   │   ├── df-904-3q.jpg       # naming: {model-slug}-{angle}.{ext}
│   │   │   ├── df-904-front.jpg
│   │   │   ├── df-904-rear.jpg
│   │   │   ├── ts-1404-side.jpg
│   │   │   └── ...
│   │   ├── cases/                  # case cover photos
│   │   ├── news/                   # news cover photos
│   │   └── factory/                # factory/about photos
│   ├── videos/
│   │   ├── hero-loop.mp4           # home hero video loop
│   │   ├── hero-loop.webm
│   │   └── factory-loop.mp4        # factory section loop
│   ├── posters/
│   │   ├── hero-loop.jpg           # LCP poster for hero video
│   │   └── factory-loop.jpg
│   ├── docs/
│   │   └── kazkioti-catalog.pdf    # downloadable PDF catalog
│   ├── icons/                      # SVG icons (favicon, OG, etc.)
│   └── fonts/                      # no self-hosted fonts; loaded via next/font/google
│
├── styles/
│   └── globals.css                 # Tailwind base directives + CSS custom properties from theme.css
│
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
├── .eslintrc.json
├── .prettierrc
├── .env.example
├── .gitignore
├── middleware.ts                    # next-intl locale detection + redirect
└── CLAUDE.md                        # project coding conventions
```

**Folder purpose notes:**

- `app/[locale]/layout.tsx` — wraps every page in the locale-specific provider, sets `<html lang>`, loads fonts, renders Header and Footer. Default export is a React Server Component that accepts `{children, params: {locale}}`.
- `app/api/lead/route.ts` — Node.js runtime, not Edge. Handles POST only. Default export is `{ POST }`.
- `components/ui/` — all primitive components. Must have zero page-level business logic. May use `"use client"` only when they encapsulate interactivity (modals, inputs, tabs).
- `components/sections/` — compose `ui/` primitives into full page sections. Server Components unless they manage client state (Header, CompareTray, CookieBanner).
- `components/forms/` — all Client Components because they manage form state and submit to the API route.
- `lib/content/` — the data access abstraction layer. Every function in this directory is the only place that reads MDX files. Pages import from here, never from `content/` directly. This is the migration seam: swap function implementations to call Sanity/Strapi without touching page components.
- `lib/types/` — Zod schemas exported as both `Schema` (for validation) and `type T = z.infer<typeof Schema>` (for TypeScript).
- `messages/` — flat-key JSON files for UI strings. Content (MDX) is not in these files; only interface labels, button text, aria-labels, and static copy.
- `middleware.ts` — single file that runs next-intl locale negotiation on every request.

---

## 3. Design Tokens → Tailwind Theme Mapping

### CSS Variable to Tailwind Name Table

| CSS Variable | Value | Tailwind Name |
|---|---|---|
| `--bg-default` | `#ffffff` | `bg.default` |
| `--bg-muted` | `#f6f5f2` | `bg.muted` |
| `--bg-soft` | `#fafaf9` | `bg.soft` |
| `--bg-invert` | `#0c0c0d` | `bg.invert` |
| `--text-primary` | `#0a0a0a` | `text.primary` |
| `--text-muted` | `#6b6b6b` | `text.muted` |
| `--text-faint` | `#9a9a99` | `text.faint` |
| `--brand-red` | `#e0001b` | `brand.red` |
| `--brand-red-hover` | `#c20018` | `brand.red-hover` |
| `--brand-blue` | `#1853d6` | `brand.blue` |
| `--brand-blue-soft` | `#e8eefb` | `brand.blue-soft` |
| `--border` | `rgba(15,15,15,.08)` | `border.default` |
| `--border-strong` | `rgba(15,15,15,.18)` | `border.strong` |

### `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          default: '#ffffff',
          muted: '#f6f5f2',
          soft: '#fafaf9',
          invert: '#0c0c0d',
        },
        text: {
          primary: '#0a0a0a',
          muted: '#6b6b6b',
          faint: '#9a9a99',
        },
        brand: {
          red: '#e0001b',
          'red-hover': '#c20018',
          blue: '#1853d6',
          'blue-soft': '#e8eefb',
        },
        border: {
          default: 'rgba(15,15,15,0.08)',
          strong: 'rgba(15,15,15,0.18)',
        },
      },
      fontFamily: {
        heading: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display': ['clamp(48px,8vw,112px)', { lineHeight: '0.98', letterSpacing: '-0.035em' }],
        'h1': ['clamp(40px,5vw,64px)', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        'h2': ['clamp(32px,4vw,48px)', { lineHeight: '1.04', letterSpacing: '-0.02em' }],
        'h3': ['clamp(22px,2vw,28px)', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        'lede': ['clamp(17px,1.4vw,21px)', { lineHeight: '1.5' }],
        'eyebrow': ['11px', { lineHeight: '1', letterSpacing: '0.18em' }],
        'body-l': ['18px', { lineHeight: '1.6' }],
        'body-m': ['16px', { lineHeight: '1.5' }],
        'body-s': ['14px', { lineHeight: '1.5' }],
        'mono-label': ['11px', { lineHeight: '1', letterSpacing: '0.14em' }],
      },
      spacing: {
        '4.5': '18px',
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '8px',
        'lg': '12px',
        'pill': '999px',
      },
      boxShadow: {
        'card': '0 18px 40px -24px rgba(0,0,0,0.18)',
        'card-hover': '0 18px 40px -24px rgba(0,0,0,0.18)',
        'form': '0 30px 80px -40px rgba(0,0,0,0.18), 0 8px 24px -16px rgba(0,0,0,0.06)',
        'hero-media': '0 30px 80px -40px rgba(0,0,0,0.22), 0 8px 24px -16px rgba(0,0,0,0.08)',
        'fab': '0 8px 24px -8px rgba(224,0,27,0.55), 0 2px 6px rgba(0,0,0,0.18)',
      },
      transitionTimingFunction: {
        'kk': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      transitionDuration: {
        'fast': '150ms',
        'DEFAULT': '250ms',
        'slow': '400ms',
        'page': '600ms',
      },
      maxWidth: {
        'container': '1440px',
        'content': '1280px',
      },
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1440px',
      },
    },
  },
  plugins: [],
}

export default config
```

### Font Loading (`app/[locale]/layout.tsx`)

```typescript
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin', 'latin-ext'],  // latin-ext covers Cyrillic-adjacent glyphs
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
  preload: true,
})

const inter = Inter({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: false,  // mono font is not render-blocking; defer
})
```

**Kazakh glyph coverage note:** Space Grotesk's `latin-ext` subset covers the full Kazakh Cyrillic alphabet including `ә ғ қ ң ө ұ ү һ і`. Inter `cyrillic-ext` covers the same. JetBrains Mono `latin-ext` covers all digits and Latin glyphs used in spec labels. All three fonts must be declared with `variable` (CSS custom property) so Tailwind `font-heading / font-body / font-mono` classes resolve correctly.

**`styles/globals.css`** must set base font and CSS custom properties mirroring `theme.css` so any non-Tailwind CSS in prototype components still resolves:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-default: #ffffff;
  --bg-muted: #f6f5f2;
  --bg-soft: #fafaf9;
  --bg-invert: #0c0c0d;
  --text-primary: #0a0a0a;
  --text-muted: #6b6b6b;
  --text-faint: #9a9a99;
  --border: rgba(15,15,15,.08);
  --border-strong: rgba(15,15,15,.18);
  --brand-red: #e0001b;
  --brand-red-hover: #c20018;
  --brand-blue: #1853d6;
  --brand-blue-soft: #e8eefb;
  --btn-radius: 999px;
}

::selection {
  background: var(--brand-red);
  color: #fff;
}

body {
  font-variant-numeric: tabular-nums;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

## 4. i18n Strategy

### Library Choice: `next-intl`

`next-intl` v3+ has first-class support for the Next.js App Router: it provides a `NextIntlClientProvider` that works with RSC, a `middleware.ts`-based locale detection, and typed `useTranslations` / `getTranslations` hooks. `next-i18next` was designed for the Pages Router and requires the `appWithTranslation` HOC pattern that does not compose naturally with App Router layouts. `next-intl` is the correct choice.

### Locale Slugs

Use `ru` and `kk`. Rationale: `kz` is the ISO 3166-1 country code for Kazakhstan (used in domain extensions like `.kz`), while `kk` is the ISO 639-1 language code for the Kazakh language. Using `kk` is linguistically correct and matches what browsers report in `Accept-Language` headers, ensuring automatic locale detection works without custom mapping. The handoff prototype uses `kz` internally as an attribute value (e.g. `data-kz`), but the URL slug and `<html lang>` attribute must use the standard `kk`.

### URL Structure

`/{locale}/path` — explicit locale prefix in URL for all routes. No cookie-only detection. Default locale is `ru`. Requests to `/` redirect to `/ru/`. Requests with a matching `Accept-Language: kk` header redirect to `/kk/`.

Middleware configuration (`middleware.ts`):

```typescript
import createMiddleware from 'next-intl/middleware'
import { routing } from './lib/i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
```

`lib/i18n/routing.ts`:

```typescript
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['ru', 'kk'],
  defaultLocale: 'ru',
  localePrefix: 'always',
})
```

### Messages File Layout

```
messages/
├── ru.json    # Russian: all UI strings
└── kk.json    # Kazakh: all UI strings, must be 100% complete (no fallback to ru)
```

Key namespaces within each JSON:

```json
{
  "nav": { "tractors": "Тракторы", "attachments": "Навесное", ... },
  "header": { "cta": "Оставить заявку", "phone": "+7 747 876 44 44" },
  "hero": { "eyebrow": "Казахстанский завод · с 2016", "h1": "...", ... },
  "utp": { ... },
  "tractors": { "catalog": "Каталог тракторов", "filter": { "all": "Все", ... } },
  "forms": { "name": "Имя", "phone": "Телефон", "submit": "Получить расчёт", ... },
  "footer": { ... },
  "cookie": { "text": "...", "ok": "Хорошо" },
  "meta": { "home": { "title": "...", "description": "..." }, ... },
  "breadcrumbs": { "home": "KAZKIOTI", "tractors": "Тракторы", ... },
  "common": { "learnMore": "Подробнее", "allCases": "Все кейсы →", ... }
}
```

### MDX Locale Handling

Each MDX file carries its locale as a filename suffix: `{slug}.{locale}.mdx`. The content access functions in `lib/content/` filter by locale when loading:

```typescript
// lib/content/news.ts
export async function getNews(slug: string, locale: 'ru' | 'kk') {
  const filePath = path.join(contentDir, 'news', `${slug}.${locale}.mdx`)
  // ...
}
```

This keeps RU and KK versions of the same article co-located, makes diffs clear, and avoids directory nesting. If a KK version does not exist, the function throws — there is no silent fallback to RU, because equal completeness is required.

### Language Switcher

The switcher renders the label of the **other** language, not the current one. When the current locale is `ru`, the button shows `ҚАЗ`. When current locale is `kk`, the button shows `RU`. This matches `DESIGN.md §12` and the prototype's `lang-switch` component. Implementation: the switcher links to the equivalent URL with the alternate locale. It is a Server Component that reads the current locale from next-intl's `useLocale()` (or receives it as a prop from the layout).

### SEO

Every `page.tsx` exports `generateMetadata` that calls `getTranslations('meta')` for the current locale. The root layout sets `<html lang={locale}>`. The `sitemap.ts` generates entries for every route × every locale with proper `hreflang` alternate links. Structured data (JSON-LD) is injected as a `<script type="application/ld+json">` in each page's metadata or directly in the page component.

---

## 5. Content Model (MDX)

### Tractor

**Folder:** `content/tractors/`
**Naming:** `{model-slug}.{locale}.mdx` (e.g., `df-904.ru.mdx`, `df-904.kk.mdx`)

**Frontmatter schema (Zod):**

```typescript
// lib/types/tractor.ts
import { z } from 'zod'

export const TractorFrontmatterSchema = z.object({
  // Identity
  slug: z.string(),                    // e.g., "df-904"
  name: z.string(),                    // e.g., "DF 904"
  subtitle: z.string(),                // e.g., "Универсальный трактор 90 л.с."
  powerClass: z.enum(['40', '90', '100', '120', '140', '210']), // hp for filter pill

  // Hero dashboard cells
  power: z.number(),                   // 90 (л.с.)
  driveType: z.string(),               // "4×4"
  transmission: z.string(),            // "12F+4R"
  fuelTank: z.number(),                // 150 (litres)
  weight: z.number(),                  // 4800 (kg)
  wheelbase: z.number().optional(),    // 2350 (mm)

  // Engine group
  engineModel: z.string(),             // "YTO LR4M5"
  engineCylinders: z.number(),         // 4
  engineDisplacement: z.number(),      // 5130 (cm³)
  engineEcoClass: z.string(),          // "Euro 2"
  fuelType: z.string(),                // "Дизель" / "Дизель"

  // Transmission group
  transmissionType: z.string(),        // "Механика"
  pto: z.string(),                     // "540 / 1000 rpm"
  clutch: z.string().optional(),       // "Двойное, сухое"

  // Dimensions group
  lengthMm: z.number(),                // 4440
  widthMm: z.number(),                 // 2100
  heightMm: z.number(),                // 2750

  // Hydraulics group
  hydraulicPump: z.string().optional(), // "42 L/min"
  rearLinkage: z.string().optional(),   // "2200 kg"
  brakes: z.string().optional(),        // "Пневмо"

  // Warranty
  warrantyYears: z.number().default(1),
  warrantyHours: z.number().default(1000),

  // Media
  heroImage: z.string(),               // "/images/tractors/df-904-3q.jpg"
  galleryImages: z.array(z.string()).optional(), // angle thumbnails
  videoUrl: z.string().optional(),     // YouTube URL or null
  videoLoop: z.string().optional(),    // "/videos/df-904-loop.mp4" for card hover

  // Relations
  compatibleAttachments: z.array(z.string()), // attachment slugs
  relatedCases: z.array(z.string()).optional(), // case slugs

  // SEO
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImage: z.string().optional(),

  // Availability (for TBD models)
  status: z.enum(['available', 'coming-soon']).default('available'),
})

export type TractorFrontmatter = z.infer<typeof TractorFrontmatterSchema>
```

**Body conventions:** The MDX body of a tractor file contains the cabin-and-comfort section copy only. Specs, gallery, and related content are in frontmatter and rendered by the page component, not MDX body. Allowed MDX components: none in v1 (tractor body is minimal prose). The body is `<section id="cabin">` copy text.

**List page query:** `lib/content/tractors.ts` exports `getAllTractors(locale)` which reads all `*.{locale}.mdx` files in `content/tractors/`, parses frontmatter with Zod, and returns an array sorted by `power` ascending. The catalog page is a Server Component that calls this function at build time.

**Migration note:** Replace the file-reading implementation in `lib/content/tractors.ts` with a Sanity GROQ or Strapi REST call. The `TractorFrontmatter` type and all page components remain unchanged.

---

### Attachment

**Folder:** `content/attachments/`
**Naming:** `{slug}.{locale}.mdx` (e.g., `bd-30.ru.mdx`)

```typescript
export const AttachmentFrontmatterSchema = z.object({
  slug: z.string(),
  name: z.string(),
  category: z.enum(['seeding', 'tillage', 'mowing', 'extra']),
  compatibleModels: z.array(z.string()),  // tractor slugs
  heroImage: z.string(),
  specs: z.record(z.string()).optional(), // key-value spec pairs
  metaTitle: z.string().optional(),
})
```

**List page query:** `getAllAttachments(locale)` returns all, grouped by `category` for the Tabs component on `/attachments`.

---

### Customer Case

**Folder:** `content/cases/`
**Naming:** `{slug}.{locale}.mdx` (e.g., `ak-zhayyk-df904.ru.mdx`)

```typescript
export const CaseFrontmatterSchema = z.object({
  slug: z.string(),
  title: z.string(),                   // e.g., "«Один трактор закрыл три старых ЮМЗ»"
  farmName: z.string(),                // "ФХ «Ақ Жайық»"
  region: z.string(),                  // "ЗКО · Уральск"
  tractorModel: z.string(),            // "df-904"
  coverImage: z.string(),
  date: z.string(),                    // ISO date "2026-01-15"
  // Key metrics (displayed in card and hero)
  hectares: z.number().optional(),
  motorHours: z.number().optional(),
  years: z.number().optional(),
  machineCount: z.number().optional(),
  // Body
  quote: z.string().optional(),        // Pull quote text
  quoteAuthor: z.string().optional(),  // Cite line
  galleryImages: z.array(z.string()).optional(),
  videoUrl: z.string().optional(),
  relatedTractors: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})
```

**Body conventions:** Long-form prose in RU/KK. Allowed MDX components: `<CaseQuote>` (blockquote with red left border + cite), `<CaseGallery images={[...]} />` (3-col photo grid), `<CaseStats>` (inline 3-cell metrics grid, matches prototype's `.art-stats`).

---

### News Article

**Folder:** `content/news/`
**Naming:** `{YYYY-MM-DD}-{slug}.{locale}.mdx` (e.g., `2026-04-12-delivery-df904.ru.mdx`) — date prefix enables natural filesystem sort by date.

```typescript
export const NewsFrontmatterSchema = z.object({
  slug: z.string(),                    // URL segment (without date prefix)
  title: z.string(),
  date: z.string(),                    // ISO "2026-04-12"
  tag: z.enum(['production', 'delivery', 'partnership', 'lineup']),
  coverImage: z.string(),
  excerpt: z.string(),                 // 1–2 sentence preview for list card
  readingMinutes: z.number().optional(),
  relatedNews: z.array(z.string()).optional(), // slugs of 3 related articles
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})
```

**Body conventions:** Long-form editorial. Allowed MDX components: `<NewsStats>` (matches prototype's `.art-stats` grid), `<NewsQuote>` (red-border pullquote), standard `<img>` via Next.js `Image`. The news article layout includes a sticky right-column TOC (`art-body__side`) that is generated client-side from `h2` headings.

---

### FAQ

**Folder:** `content/faq/`
**Naming:** `{category}.{locale}.mdx` (e.g., `warranty.ru.mdx`, `leasing.ru.mdx`)

Categories: `warranty`, `leasing`, `delivery`, `docs`, `service` — matching prototype groups.

```typescript
export const FAQGroupSchema = z.object({
  category: z.enum(['warranty', 'leasing', 'delivery', 'docs', 'service']),
  title: z.string(),   // "01 · Гарантия"
  order: z.number(),   // display order: 1–5
})

// Each MDX file body contains FAQ items as:
// ## Question text
// Answer prose
// The FAQ page parser converts h2+prose pairs into accordion items.
```

`lib/content/faq.ts` exports `getAllFAQGroups(locale)` which reads all category files, parses them, and returns an array of `{ group: FAQGroupFrontmatter, items: { question: string, answer: string }[] }` sorted by `order`.

---

## 6. Component Library Plan

### Rendering Strategy Convention

- **Server Component (SC):** no event handlers, no hooks, receives only serializable props. Used for everything that doesn't need browser APIs or user interactivity.
- **Client Component (CC):** must have `"use client"` at top. Used when component needs `useState`, `useEffect`, event listeners, or browser APIs.
- When a section is mostly static but has one interactive sub-element, keep the section as SC and extract a narrow CC child (e.g., `Header` is CC, but its nav link `href`s are static).

---

### Primitive Components (`components/ui/`)

**Button**
- File: `components/ui/Button.tsx` (SC)
- Props: `variant: 'primary' | 'secondary' | 'ghost'`, `size: 'sm' | 'md' | 'lg'`, `asChild?: boolean` (render as `<a>` via Radix slot), `disabled?: boolean`, `loading?: boolean`, standard button/anchor HTML props
- Variants: primary (brand-red bg), secondary (transparent + border-strong), ghost (transparent, no border)
- States: default, hover (translateY -1px), active (scale .98), disabled (opacity .5), loading (spinner)
- Used: Header CTA, Hero CTAs, forms, FinalCTA, tractor detail CTAs, every page

**Input**
- File: `components/ui/Input.tsx` (CC — focus state)
- Props: `label: string`, `error?: string`, standard input HTML props
- States: default (border-default), focused (border-brand-red + red glow `rgba(224,0,27,.08)`), filled, error (red border + error message below)
- Label is rendered above as mono uppercase (`font-mono, text-[10px], tracking-widest`)
- Used: MiniContactForm, LeadForm, FAQSearchInput

**Textarea**
- File: `components/ui/Textarea.tsx` (CC)
- Same visual system as Input, `rows` prop, auto-resize not required in v1
- Used: LeadForm

**Select**
- File: `components/ui/Select.tsx` (CC)
- Custom-styled `<select>` (not a third-party dropdown in v1; avoids bundle overhead for minimal options)
- Same border/focus style as Input
- Used: LeadForm (model selection), LeadForm (region selection)

**PhoneInput**
- File: `components/ui/PhoneInput.tsx` (CC)
- Wraps Input, enforces mask `+7 (___) ___-__-__` via `inputmode="tel"`, `type="tel"`, client-side masking with `lib/utils/formatPhone.ts`
- Used: MiniContactForm, LeadForm

**FormField**
- File: `components/ui/FormField.tsx` (SC)
- Wrapper that renders `label` + child input + optional `error` string below
- Props: `label: string`, `error?: string`, `children: React.ReactNode`
- Used: All form components

**Pill**
- File: `components/ui/Pill.tsx` (CC — active state toggle)
- Props: `active?: boolean`, `onClick?: () => void`, `children: React.ReactNode`
- States: default (border-strong, transparent bg), active/hover (bg text-primary, color white)
- Font: `font-mono text-[11px] tracking-widest uppercase`
- Used: TractorGrid filter, News tag filter, Attachments category tabs

**Eyebrow**
- File: `components/ui/Eyebrow.tsx` (SC)
- Renders a `<span>` with `font-mono text-eyebrow uppercase tracking-widest text-text-muted` and a red `::before` rule (24px wide, 1px tall)
- Props: `children: React.ReactNode`
- Used: Hero, section headers throughout

**SectionHeader**
- File: `components/ui/SectionHeader.tsx` (SC)
- Props: `eyebrow?: string`, `h2: string`, `lede?: string`, `link?: { label: string; href: string }`
- Renders the `.sec__hd` pattern: flex row, left column (eyebrow+h2+lede), right optional link
- Used: every major section on Home, catalog pages

**Breadcrumbs**
- File: `components/ui/Breadcrumbs.tsx` (SC)
- Props: `items: { label: string; href?: string }[]`
- Renders mono uppercase with `/` separators, current item not a link
- Used: `/tractors/[model]`, `/cases/[slug]`, `/news/[slug]`

**Pagination**
- File: `components/ui/Pagination.tsx` (CC — could be SC with search params)
- Props: `total: number`, `perPage: number`, `currentPage: number`, `basePath: string`
- Renders prev/next + numbered pages; uses Next.js `Link` with `?page=N` search param
- Used: `/news`, `/cases`

**Accordion**
- File: `components/ui/Accordion.tsx` (CC)
- Uses native `<details>`/`<summary>` with CSS transition for open/close (matches prototype's `.faq` pattern)
- Props: `items: { question: string; answer: string }[]`, `defaultOpen?: number`
- The `+` icon rotates 45° to `×` on open (via CSS transform on `.faq__icon`)
- Used: `/faq`

**Tabs**
- File: `components/ui/Tabs.tsx` (CC)
- Props: `tabs: { key: string; label: string; content: React.ReactNode }[]`, `defaultTab?: string`
- Renders pill-style tab buttons and switches content panel
- Used: `/attachments` (category tabs), `/tractors/[model]` sub-nav (sticky, scroll-based)

**Modal**
- File: `components/ui/Modal.tsx` (CC)
- Uses native `<dialog>` element with `showModal()` / `close()`
- Props: `open: boolean`, `onClose: () => void`, `children: React.ReactNode`, `title?: string`
- Focus trap handled by native dialog behavior
- Used: attachment quick-view (if implemented), lightbox fallback

**Sheet**
- File: `components/ui/Sheet.tsx` (CC)
- Bottom-sheet variant of Modal for mobile. Fixed position, slides up from bottom, backdrop.
- Props: same as Modal
- Used: forms on mobile viewports (MiniContactForm can render in a Sheet on `<sm`)

**Toast**
- File: `components/ui/Toast.tsx` (CC)
- Ephemeral notification, positioned bottom-right (offset from FAB). Auto-dismisses after 4s.
- Props: `message: string`, `type: 'success' | 'error'`, `onDismiss: () => void`
- Used: after form submission in MiniContactForm, LeadForm

**VideoPlayer**
- File: `components/ui/VideoPlayer.tsx` (CC)
- Two modes: `type="loop"` renders `<video autoPlay muted loop playsInline>` with Intersection Observer lazy-load; `type="youtube"` renders a clickable poster that swaps to `<iframe>` on click (avoids YouTube's 500 KB initial load)
- Props: `src: string`, `poster: string`, `type: 'loop' | 'youtube'`, `alt: string`, `aspectRatio?: string`
- `prefers-reduced-motion`: when reduced, `type="loop"` shows static poster only
- Used: Hero (loop), FactorySplit (loop), tractor card hover (loop), tractor detail review (youtube)

**SpecTable**
- File: `components/ui/SpecTable.tsx` (SC)
- Props: `groups: { title: string; rows: { label: string; value: string }[] }[]`
- Renders the 2-column `.specs` grid matching prototype: spec-group cards in a 2×N grid, each with a header and dashed-separator rows
- Values rendered in `font-mono font-medium`
- Used: `/tractors/[model]` specs section

**Card.Tractor (`CardTractor`)**
- File: `components/ui/Card/CardTractor.tsx` (CC — hover video swap)
- Props: `tractor: TractorFrontmatter`, `locale: 'ru' | 'kk'`, `onCompare?: (slug: string) => void`
- Layout: `border rounded-sm p-6 flex flex-col gap-5`; media area 4:3 aspect ratio; name + power (large mono-heading); spec chips (font-mono pill); "Подробнее →" link
- Hover: `translateY(-3px)` + `shadow-card`; on desktop, if `tractor.videoLoop` exists, swap static image for `<video>` via `onMouseEnter`/`onMouseLeave`
- Compare button: pill-style "Сравнить" that calls `onCompare(slug)` when CompareTray is available
- Used: TractorGrid (home + /tractors), CompareTray column headers

**Card.News (`CardNews`)**
- File: `components/ui/Card/CardNews.tsx` (SC)
- Props: `article: NewsFrontmatter & { slug: string }`, `locale: 'ru' | 'kk'`
- Layout: 16:10 media → mono meta (date · tag) → h3 (heading font) — hover: title turns brand-red
- Used: NewsGrid (home + /news)

**Card.Case (`CardCase`)**
- File: `components/ui/Card/CardCase.tsx` (SC)
- Props: `case: CaseFrontmatter`, `locale: 'ru' | 'kk'`
- Layout: 4:3 media → body: meta row (region / model) → title → metrics row (3 numbers with mono labels)
- Hover: `translateY(-3px)` + shadow
- Used: CasesGrid (home + /cases)

**Map / DealersMap**
- File: `components/ui/Map/DealersMap.tsx` (CC)
- Renders an SVG Kazakhstan silhouette with clickable `<circle>` pins. No third-party map library in v1 (avoids 200 KB Mapbox/Leaflet bundle on a marketing site with a fixed pin set).
- Props: `dealers: DealerPoint[]`, `onSelect?: (id: string) => void`, `activeId?: string`
- `DealerPoint`: `{ id, city, type: 'factory'|'dealer'|'service', cx, cy, address, phone, hours }`
- Pin colors: factory=brand-red, dealer=text-primary, service=brand-blue (matches prototype)
- On click: updates `activeId`, parent shows `DealerCard` popup
- Used: `/dealers`, `DealersMapPreview`

**MapPin**
- File: `components/ui/Map/MapPin.tsx` (SC)
- SVG `<circle>` with optional pulse ring (for factory pin). Receives `cx`, `cy`, `type` props.

---

### Section Components (`components/sections/`)

**Header**
- File: `components/sections/Header.tsx` (CC)
- State: `isStuck` (scroll > 24px), `isHide` (scroll direction down + > 120px), `mobileMenuOpen`
- On `isStuck`: adds `border-bottom: border-default`, shrinks row height from 72px to 58px
- On `isHide`: `translateY(-100%)`
- Mobile: hides nav + phone at `<1100px` breakpoint (matches theme.css), shows `≡ Меню` button
- Mobile menu overlay: full-screen, slides down from top (`.mm.is-open`), nav links in heading font at 32px, stagger animation
- Language switcher: renders current-other locale label (see §4)
- PDF download link: visible on desktop in header right area

**Footer**
- File: `components/sections/Footer.tsx` (SC)
- Dark background `bg-invert`, 5-column grid (brand col + 4 link cols) on desktop, 2-col on tablet, 1-col on mobile
- Columns: Каталог (tractors, attachments, parts, compare), Компания (about, cases, news, faq), Сервис (warranty, leasing, dealers, service-centers), Контакты (phone, email, instagram, youtube)
- Bottom bar: mono uppercase, copyright + privacy policy link

**Hero**
- File: `components/sections/Hero.tsx` (SC shell, VideoPlayer CC inside)
- Sections: top bar (location + time indicator), eyebrow, h1 (display size, max 17ch), lede, CTA row, media (21:9 video, border-radius 12px, box-shadow hero-media), metrics row (3 count-up numbers + scroll indicator)
- Video: `<VideoPlayer type="loop" src="/videos/hero-loop.mp4" poster="/posters/hero-loop.jpg">` with `preload="metadata"`
- Metrics use `data-countup` behavior (see §9)

**UTPStripe**
- File: `components/sections/UTPStripe.tsx` (SC)
- 3-column grid, each item: mono number (01/02/03), h3 with `<em>` in brand-red, description text
- `reveal-stagger` animation behavior

**TractorGrid**
- File: `components/sections/TractorGrid.tsx` (CC — filter state)
- Props: `tractors: TractorFrontmatter[]`, `locale: 'ru' | 'kk'`
- Manages active power filter pill (client state), renders filtered CardTractor grid
- Manages compare tray state: array of up to 3 selected slugs, passes `onCompare` to each card, renders `CompareTray` when length > 0

**FactorySplit**
- File: `components/sections/FactorySplit.tsx` (SC)
- Left: eyebrow, h2, lede, 3-number stats row (50% localization, 2016, 24/7), link "О заводе →"
- Right: `VideoPlayer type="loop"` for factory footage
- 2-column grid, flips to single column at `<900px`

**CompareBanner**
- File: `components/sections/CompareBanner.tsx` (SC)
- Bordered card with muted background, h3 text, paragraph, primary CTA button → `/[locale]/tractors/compare`

**CasesGrid**
- File: `components/sections/CasesGrid.tsx` (SC)
- Props: `cases: CaseFrontmatter[]` (max 3), `locale: 'ru' | 'kk'`
- 3-column grid of CardCase, section header with "Все кейсы →" link

**NewsGrid**
- File: `components/sections/NewsGrid.tsx` (SC)
- Props: `articles: NewsFrontmatter[]` (max 3), `locale: 'ru' | 'kk'`
- 3-column grid of CardNews, section header

**DealersMapPreview**
- File: `components/sections/DealersMapPreview.tsx` (CC)
- Renders the stylized SVG Kazakhstan map with legend and "Открыть карту →" CTA button overlaid
- Non-interactive (preview only); clicking the CTA navigates to `/[locale]/dealers`

**FinalCTA**
- File: `components/sections/FinalCTA.tsx` (SC shell)
- 2-column grid: left (eyebrow, h2, lede, contact info block), right (LeadForm)
- Background: `bg-muted` with radial gradient ghost `rgba(224,0,27,.06)` on right
- Used: Home page, every content page bottom

**CompareTray**
- File: `components/sections/CompareTray.tsx` (CC)
- Fixed bottom bar, initially `translateY(120%)`, slides up when 1+ models selected
- Shows model name chips with ✕ to remove, count badge, "Сравнить →" button → `/[locale]/tractors/compare?models=slug1,slug2`
- Max 3 models. Persists selection in `sessionStorage` so Compare page can read it.

**CookieBanner**
- File: `components/sections/CookieBanner.tsx` (CC)
- Fixed bottom-left, slides up after 1200ms. Dismissal stored in `localStorage('kk_cookie_ack')`.
- Dark background, white button, matches prototype exactly

---

### Form Components (`components/forms/`)

**MiniContactForm**
- File: `components/forms/MiniContactForm.tsx` (CC)
- Fields: name (Input), phone (PhoneInput), submit Button
- On submit: POST to `/api/lead`, show Toast on success/error
- Below submit: "или" + WhatsApp/Telegram pill links
- Used: FinalCTA section, tractor detail form section (contextualized with model pre-filled)

**LeadForm**
- File: `components/forms/LeadForm.tsx` (CC)
- Fields: name+farm (Input), phone (PhoneInput) + region (Select) in 2-col row, comment/tasks (Textarea), submit Button
- Honeypot hidden field `website` (must be empty)
- On submit: POST to `/api/lead` with `{ name, phone, region, comment, model, source, locale }`
- Below submit: WhatsApp + Telegram pill links
- Props: `defaultModel?: string` — pre-fills model context (used on tractor detail)
- Used: FinalCTA (home), tractor detail KP form

**MessengerFAB**
- File: `components/forms/MessengerFAB.tsx` (CC)
- Fixed bottom-right, z-index 60, offset from any bottom bar
- Toggle button: 56×56px circle, brand-red, `fab-pulse` animation (8s interval, one pulse)
- Expanded: WhatsApp pill + Telegram pill, slide up from bottom with delay
- Links: exact URLs from `lib/constants.ts` (`WHATSAPP_URL`, `TELEGRAM_URL`)
- Close on outside click

---

## 7. Data Flow / Lead Capture

### API Route

`app/api/lead/route.ts` — Node.js runtime (not Edge; email sending libraries require Node.js APIs).

```typescript
// shape of the expected body
const LeadSchema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().regex(/^\+7\s?\(?\d{3}\)?\s?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/),
  model: z.string().optional(),
  region: z.string().optional(),
  comment: z.string().max(500).optional(),
  source: z.string().optional(),   // "hero-form" | "tractor-kp" | "mini-form" | etc.
  locale: z.enum(['ru', 'kk']),
  website: z.string().max(0),      // honeypot — must be empty string
})
```

**Bot Protection:** Honeypot field `website` (hidden via CSS, not `display:none` — screen-readers skip visually-hidden). Rate limit: 5 requests per IP per 15 minutes via `@upstash/ratelimit` + `@upstash/redis` (Vercel KV). Cloudflare Turnstile is deferred to v2; the honeypot covers v1 sufficiently for a B2B agricultural site.

**Lead Destination:** **Resend** (email to `info@kazkioti.kz`). Chosen over Telegram bot and Google Sheets because: email is natively familiar to the client, Resend has a generous free tier (3000 emails/month), and the swap point is a single function inside `app/api/lead/route.ts`. To switch to Telegram bot later: replace the Resend call with a `telegram-bot-api` call, update `.env.example`.

```typescript
// Swap point — everything above this line stays the same:
await resend.emails.send({
  from: 'site@kazkioti.kz',
  to: 'info@kazkioti.kz',
  subject: `Новая заявка · ${lead.source} · ${lead.model ?? '—'}`,
  text: formatLead(lead),
})
```

**Phone format:** `+7 (___) ___-__-__`. The `PhoneInput` component enforces this on the client. The API route validates with the regex above (accepts slight variations in separators).

**WhatsApp deep link:** `https://wa.me/77478764444?text={encoded}` where `{encoded}` is a pre-filled message "Здравствуйте, хочу узнать о тракторе KAZKIOTI". The phone number and message template live in `lib/constants.ts` and are locale-aware (KK variant uses Kazakh message text).

**Telegram deep link:** `https://t.me/{username}` where `{username}` is the client's Telegram handle (currently placeholder `TBD` in constants; needs client input).

---

## 8. Media Handling

### next/image Configuration

```javascript
// next.config.mjs
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    // No remotePatterns needed in v1 (all images served from public/)
    deviceSizes: [375, 640, 768, 1024, 1280, 1440, 1920],
    imageSizes: [64, 128, 256, 384],
  },
}
```

All images are in `public/images/` and served locally via `next/image`. No CDN or S3 in v1.

### Video Strategy

| Location | Video type | Implementation | Rationale |
|---|---|---|---|
| Home hero | Loop, autoplay, muted | `<video autoPlay muted loop playsInline>` with Intersection Observer | LCP; preloaded; no click required |
| Tractor card hover | 2–4s loop, muted | Lazy-loaded on `mouseenter`; `src` set dynamically | Avoid loading 6 videos on page load |
| Factory split section | Loop, muted | `<VideoPlayer type="loop">` with IO lazy load | Below fold; IO triggers on entry |
| Tractor detail review | YouTube embed | Clickable poster → `<iframe>` swap on click | Saves ~500 KB initial JS from YouTube |
| Case detail | YouTube or mp4 | Same as above | Varies by case |

**Poster convention:** Every video asset has a corresponding poster at `/public/posters/{video-name}.jpg`. Poster files are 1280×720, optimized JPEGs. They are the actual LCP element for hero and factory sections.

**File size budgets (from DESIGN.md §8):**

- Hero loop desktop: ≤ 6 MB (mp4) + webm fallback ≤ 4 MB
- Hero loop mobile: served as static poster below 900px breakpoint; JS loads video only if viewport ≥ 900px
- Card hover loops: ≤ 1 MB each, 2–4s, H.264
- Factory loop: ≤ 3 MB

**CI enforcement:** A GitHub Actions step runs `node scripts/check-media-sizes.mjs` which reads all files under `public/videos/` and asserts they are under budget. Build fails if any video exceeds its limit.

**Asset migration from handoff:** The handoff directory at `.handoff/kazkioti/project/assets/` contains the following confirmed files:

- `tractor-df904-3q.jpg` → `public/images/tractors/df-904-3q.jpg`
- `tractor-df904-front.jpg` → `public/images/tractors/df-904-front.jpg`
- `tractor-df904-rear.jpg` → `public/images/tractors/df-904-rear.jpg`
- `tractor-ts1404-side.jpg` → `public/images/tractors/ts-1404-side.jpg`
- `tractor-ts1404-front.jpg` → `public/images/tractors/ts-1404-front.jpg`
- `hero-loop.mp4` → `public/videos/hero-loop.mp4`

**Filename normalization rule:** all public assets use lowercase kebab-case with model slug prefix: `{model-slug}-{angle|description}.{ext}`. No spaces, no uppercase, no underscores. Posters share the same base name as their video: `hero-loop.mp4` → `posters/hero-loop.jpg`.

---

## 9. Motion Implementation

### Library Choice

**No Framer Motion.** Framer Motion adds ~75 KB to the client bundle. All motion in the handoff prototype is achievable with CSS transitions + a small Intersection Observer hook. This choice keeps bundle below 200 KB JS on the home page. The only JavaScript-driven behaviors are: count-up numbers, tractor card video hover swap, CompareTray slide-up, and sticky header/leadbar state. All use vanilla hooks or event listeners.

### Scroll Reveal

A `useReveal` hook in `lib/utils/useReveal.ts` implements Intersection Observer with `rootMargin: '0px 0px -8% 0px'` and `threshold: 0.06`. Exposed as a `<Reveal>` wrapper component:

```typescript
// components/ui/Reveal.tsx — CC
// Props: children, stagger?: boolean (enables child stagger via CSS nth-child delays)
// Adds class "in" when intersecting; removes observer after trigger (one-shot)
```

CSS in `globals.css` (matching base.css prototype):

```css
.reveal { opacity: 0; transform: translateY(16px); transition: opacity .6s cubic-bezier(.2,.8,.2,1), transform .6s cubic-bezier(.2,.8,.2,1); }
.reveal.in { opacity: 1; transform: none; }
.reveal-stagger > * { opacity: 0; transform: translateY(12px); transition: opacity .5s cubic-bezier(.2,.8,.2,1), transform .5s cubic-bezier(.2,.8,.2,1); }
.reveal-stagger.in > *:nth-child(1) { transition-delay: 0ms; }
.reveal-stagger.in > *:nth-child(2) { transition-delay: 60ms; }
/* ...up to nth-child(6) with 60ms increment */
@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal-stagger > * { opacity: 1 !important; transform: none !important; transition: none !important; }
}
```

### Count-Up Numbers

`useCountUp(target: number, duration: number = 1200)` hook in `lib/utils/useCountUp.ts`:
- Uses `useRef` for the Intersection Observer, `useState` for displayed value
- Easing: `1 - Math.pow(1 - p, 3)` (cubic ease-out, matches prototype)
- Runs once on viewport entry
- Under `prefers-reduced-motion`: renders target immediately without animation

Applied to hero metrics (10 years, 6 models, 30%), about timeline numbers, case metric numbers.

### Tractor Card Hover-to-Video

In `CardTractor.tsx` (CC):
- `useState<boolean>(isVideoLoaded)` and `useRef<HTMLVideoElement>()`
- On `mouseenter`: if `tractor.videoLoop` exists and `!isVideoLoaded`, set `video.src = videoLoop`, call `video.load()`, set `isVideoLoaded = true`; then `video.play()`
- On `mouseleave`: `video.pause()`, `video.currentTime = 0`; toggle CSS to show static image
- `prefers-reduced-motion`: skip video swap entirely, keep static image
- Implementation is a crossfade (opacity transition) between the `<img>` and `<video>` layers, both absolutely positioned inside the `trac__media` div

### prefers-reduced-motion Enforcement

Three layers:
1. CSS: `@media (prefers-reduced-motion: reduce)` blocks on `.reveal` classes in `globals.css`
2. Hook-level: `useCountUp` and `useReveal` check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` before running animations
3. Component-level: `VideoPlayer type="loop"` renders static poster only when reduced motion is active; `CardTractor` skips video hover swap

---

## 10. Performance and a11y Baseline

### Lighthouse Targets

- Home page (`/ru/`): Performance ≥ 90, Accessibility ≥ 95, SEO = 100, Best Practices ≥ 95
- Tractor detail (`/ru/tractors/df-904`): Performance ≥ 90, Accessibility ≥ 95, SEO = 100

### LCP Strategy

The LCP element on the home page is the hero video poster image. Implementation:

```html
<!-- In Hero.tsx, rendered as a Server Component -->
<link rel="preload" as="image" href="/posters/hero-loop.jpg" fetchpriority="high" />
```

The `<video>` element has `poster="/posters/hero-loop.jpg"`. The poster image is a `1440×620` optimized JPEG loaded at the first paint. The hero video itself has `preload="metadata"` so it does not block the poster.

The tractor detail LCP is the hero product image (`df-904-3q.jpg`), rendered with `loading="eager"` and `fetchPriority="high"` on the `<Image>` component.

### Font Loading Strategy

All fonts load via `next/font/google` with `display: 'swap'`. This means text renders immediately with a system font (FOUT) and swaps to the custom font when loaded. `display: 'block'` (FOIT) is rejected because the readership accesses from mobile networks in rural Kazakhstan — waiting up to 3 seconds on a blank page would harm UX more than a flash of fallback font. System font fallback stack: `system-ui, -apple-system, sans-serif` for heading/body; `ui-monospace, monospace` for mono — both render Cyrillic characters acceptably.

### Image Format Pipeline

`next/image` automatically serves AVIF (first) then WebP then original format based on `Accept` header. All source images in `public/` are JPEGs or PNGs (originals). The `formats: ['image/avif', 'image/webp']` config in `next.config.mjs` activates this. No manual conversion needed.

### a11y Requirements

Every Client Component must include:
- All icon-only buttons: `aria-label` in the current locale's translation key
- Form inputs: `id` + `htmlFor` pairing (handled by FormField wrapper)
- Modal/Sheet: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to title
- Skip link: `<a href="#main-content" className="sr-only focus:not-sr-only">` in the layout, before the Header
- Focus ring: never `outline: none` without a custom replacement. Use `focus-visible:ring-2 focus-visible:ring-brand-red` on all interactive elements
- Videos: `aria-label` describing the video content; no `autoplay` with sound
- Color contrast: brand-red `#e0001b` on white fails AA at small sizes (3.9:1 ratio). **Rule:** never render small body text in brand-red on white. Red is used only for large display numerics (≥ 28px) and as decorative rule/accent — not for information-carrying text. This must be enforced in SpecTable, UTPStripe, and any component that uses `text-brand-red` on `bg-white`.

### Testing

**Playwright smoke tests** for all 14 routes (one test file per route group):
- `tests/smoke/home.spec.ts` — loads `/ru/`, checks H1, hero video poster visible, no console errors
- `tests/smoke/tractors.spec.ts` — loads `/ru/tractors`, checks 6 cards visible
- `tests/smoke/tractor-detail.spec.ts` — loads `/ru/tractors/df-904`, checks spec table rendered, form visible
- `tests/smoke/i18n.spec.ts` — loads `/kk/`, verifies `<html lang="kk">`, checks a few Kazakh strings
- `tests/smoke/a11y.spec.ts` — runs `axe-core` via `@axe-core/playwright` on home + tractor detail

No unit testing for components in v1 (overhead not justified for a marketing site). Tests run in CI on every PR via Vercel preview URL.

---

## 11. SEO

### Per-Route Metadata

Every `page.tsx` exports `generateMetadata`:

```typescript
// Pattern — same shape in every page
export async function generateMetadata({
  params: { locale, model },
}: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta.tractorDetail' })
  const tractor = await getTractor(model, locale)
  return {
    title: t('title', { model: tractor.name }),
    description: t('description', { model: tractor.name, power: tractor.power }),
    alternates: {
      canonical: `https://kazkioti.kz/${locale}/tractors/${model}`,
      languages: {
        'ru': `https://kazkioti.kz/ru/tractors/${model}`,
        'kk': `https://kazkioti.kz/kk/tractors/${model}`,
        'x-default': `https://kazkioti.kz/ru/tractors/${model}`,
      },
    },
    openGraph: {
      title: t('title', { model: tractor.name }),
      description: t('description', { model: tractor.name, power: tractor.power }),
      images: [tractor.ogImage ?? tractor.heroImage],
      locale: locale === 'ru' ? 'ru_RU' : 'kk_KZ',
      alternateLocale: locale === 'ru' ? 'kk_KZ' : 'ru_RU',
    },
  }
}
```

### OG Image

`app/opengraph-image.tsx` — default OG image using `next/og` (Edge runtime). Renders a branded card: KAZKIOTI logo mark, tagline, brand-red accent. Size: 1200×630.

For tractor detail pages: `app/[locale]/tractors/[model]/opengraph-image.tsx` reads the tractor's `heroImage` and renders it as the OG image background with the model name overlaid.

### Sitemap

`app/sitemap.ts`:

```typescript
export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['ru', 'kk']
  const staticRoutes = ['/', '/tractors', '/tractors/compare', '/attachments',
    '/parts', '/dealers', '/cases', '/news', '/about', '/faq', '/contacts']
  // + dynamic routes from getAllTractors, getAllCases, getAllNews per locale
}
```

Priority: home = 1.0, tractor detail = 0.9, catalog pages = 0.8, content pages = 0.7.

### Robots

`app/robots.ts`: allow all, point sitemap to `https://kazkioti.kz/sitemap.xml`.

### Structured Data

| Page | Schema type |
|---|---|
| Home | `Organization` (name, url, logo, telephone, address) |
| `/tractors/[model]` | `Product` (name, description, image, brand, offers placeholder) |
| `/news/[slug]` | `Article` (headline, datePublished, author=Organization, image) |
| `/cases/[slug]` | `Article` (same as news) |
| `/faq` | `FAQPage` (mainEntity array of Question/Answer) |
| `/dealers` | `LocalBusiness` for each dealer point (name, address, telephone, geo) |

Structured data injected as `<script type="application/ld+json">` in the page component, not in `generateMetadata` (metadata API does not support script injection).

---

## 12. Environment, Config, Deployment

### `.env.example`

```bash
# Site
NEXT_PUBLIC_SITE_URL=https://kazkioti.kz

# Lead delivery
RESEND_API_KEY=re_...
RESEND_FROM=site@kazkioti.kz
RESEND_TO=info@kazkioti.kz

# Rate limiting (Vercel KV / Upstash Redis)
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...

# Messenger links (no NEXT_PUBLIC_ — compose server-side in constants)
WHATSAPP_NUMBER=77478764444
TELEGRAM_USERNAME=kazkioti       # TBD — needs client input

# Analytics (deferred)
# NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
```

`NEXT_PUBLIC_SITE_URL` is the only browser-exposed env var in v1. All others are server-only.

### Vercel Project Setup

- **Framework Preset:** Next.js (auto-detected)
- **Node.js version:** 20.x
- **Build command:** `pnpm build`
- **Output directory:** `.next` (default)
- **Install command:** `pnpm install --frozen-lockfile`
- **Edge runtime:** used only for `middleware.ts` (next-intl locale detection). All API routes use Node.js runtime.
- **Regions:** `fra1` (Frankfurt) — closest major Vercel region to Kazakhstan. Latency from Almaty to Frankfurt is ~80ms, acceptable for SSG/ISR content. Dynamic API routes (`/api/lead`) benefit from edge proximity.
- **KV (Upstash Redis):** provisioned in Vercel dashboard for rate limiting. Required before launch.

### Preview Deployment Strategy

Every PR gets a Vercel preview URL. The preview URL is posted as a GitHub comment by Vercel's GitHub integration. Branch protection rules (GitHub):

- `main` branch: require PR + 1 approval + Vercel build passing
- PR checks: `pnpm lint`, `pnpm build`, Playwright smoke tests against preview URL

### Branch Protection

- Direct push to `main` is blocked
- Required status checks: `lint`, `typecheck`, `playwright-smoke`
- Merge strategy: squash merge, PR description includes files touched (per PLAN.md §5 delegation checklist)

---

## 13. Build Sequence for Phase 3 (Каркас и дизайн-система)

One Opus agent executes the following in order. Each task has explicit acceptance criteria.

- [ ] **3.1 Project initialization**
  - Files: `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `next.config.mjs`, `postcss.config.js`, `.eslintrc.json`, `.prettierrc`, `.gitignore`
  - Install: `next@14`, `react@18`, `react-dom@18`, `typescript`, `tailwindcss@3`, `next-intl@3`, `zod`, `resend`, `@upstash/ratelimit`, `@upstash/redis`, `gray-matter`, `next-mdx-remote`, `clsx`, `tailwind-merge`
  - Dev: `@types/react`, `@types/node`, `playwright`, `@axe-core/playwright`
  - Acceptance: `pnpm dev` starts with no errors, `pnpm build` completes

- [ ] **3.2 Tailwind config and global styles**
  - Files: `tailwind.config.ts`, `styles/globals.css`
  - Paste the `tailwind.config.ts` from §3 verbatim, add plugin `@tailwindcss/typography` for article body text
  - `globals.css`: CSS custom properties from §3, `::selection`, base body styles
  - Acceptance: `bg-brand-red`, `font-heading`, `text-text-muted`, `text-display` all resolve in JSX className

- [ ] **3.3 Font setup and layout shell**
  - Files: `app/[locale]/layout.tsx`, `app/layout.tsx` (root layout — minimal, just HTML/body), `middleware.ts`, `lib/i18n/routing.ts`, `lib/i18n/request.ts`
  - Wire Space Grotesk + Inter + JetBrains Mono via `next/font/google`, attach CSS variables
  - Root locale layout: `NextIntlClientProvider`, `<html lang={locale}>`, font class application
  - Middleware: next-intl locale detection, redirect `/` → `/ru/`
  - Acceptance: `localhost:3000` redirects to `localhost:3000/ru`, `<html lang="ru">` in source

- [ ] **3.4 Translation files and constants**
  - Files: `messages/ru.json`, `messages/kk.json`, `lib/constants.ts`
  - All namespaces from §4 with RU strings; KK strings (use placeholder `[kk] {ru_text}` for untranslated — KK translation is a content gap for Phase 5)
  - `lib/constants.ts`: site URL, phone, email, nav items array, WhatsApp URL, Telegram URL (placeholder)
  - Acceptance: `useTranslations('nav')` returns strings in both locales

- [ ] **3.5 Utility functions and Zod types**
  - Files: `lib/utils/cn.ts`, `lib/utils/slugify.ts`, `lib/utils/formatPhone.ts`, `lib/utils/useReveal.ts`, `lib/utils/useCountUp.ts`, `lib/types/tractor.ts`, `lib/types/attachment.ts`, `lib/types/case.ts`, `lib/types/news.ts`, `lib/types/faq.ts`
  - Zod schemas from §5 exactly
  - `cn.ts`: `clsx` + `tailwind-merge` export
  - Acceptance: `pnpm tsc --noEmit` passes; each schema validates a sample object in a unit test or inline assertion

- [ ] **3.6 Primitive UI components**
  - Files: all components under `components/ui/` as specified in §6
  - Order: Button → Input → Textarea → Select → PhoneInput → FormField → Pill → Eyebrow → SectionHeader → Breadcrumbs → Pagination → Accordion → Tabs → Modal → Sheet → Toast → VideoPlayer → SpecTable → Card/CardTractor → Card/CardNews → Card/CardCase → Map/MapPin → Map/DealersMap → Reveal
  - Each component must: use Tailwind classes only (no inline style except for dynamic values), export a TypeScript props interface, have `aria-label` or semantic HTML for accessibility
  - Acceptance: all components render without TypeScript errors; no `any` types

- [ ] **3.7 Section components**
  - Files: all components under `components/sections/` as specified in §6
  - Implement exactly the visual structure from the prototype HTML, mapping CSS classes to Tailwind equivalents
  - Header: implement scroll detection (`useEffect` + `window.addEventListener('scroll')`), mobile menu state, language switcher logic
  - CompareTray: implement `sessionStorage` persistence for selected model slugs
  - CookieBanner: implement `localStorage` check
  - Acceptance: Header renders with correct sticky behavior, mobile menu opens/closes, FAB expands

- [ ] **3.8 Form components and API route**
  - Files: `components/forms/MiniContactForm.tsx`, `components/forms/LeadForm.tsx`, `components/forms/MessengerFAB.tsx`, `app/api/lead/route.ts`
  - API route: Zod validation, honeypot check, rate limit check, Resend email send, return `{ success: true }` or `{ error: string }`
  - Acceptance: POST to `http://localhost:3000/api/lead` with valid body returns 200; with honeypot field returns 400; with invalid phone returns 422

- [ ] **3.9 Content access layer with mock data**
  - Files: `lib/content/tractors.ts`, `lib/content/news.ts`, `lib/content/cases.ts`, `lib/content/attachments.ts`, `lib/content/faq.ts`
  - Implement file-reading functions using `gray-matter` + `next-mdx-remote/rsc`
  - Create 2 mock MDX files per content type in `content/` to exercise the functions (df-904.ru.mdx, ts-1404.ru.mdx, 1 news, 1 case, 1 faq group)
  - Acceptance: `getAllTractors('ru')` returns an array of 2 validated tractor objects

- [ ] **3.10 Skeleton pages and component review route**
  - Files: one `page.tsx` per route (all 14), all returning `<main>` with a `<h1>` placeholder
  - One dev-only route `app/[locale]/_dev/page.tsx` rendering all components with test props (visual index for agent review)
  - Acceptance: `pnpm build` succeeds with all 14 routes, no TypeScript errors

---

## 14. Build Sequence for Phase 4 (Страницы)

### Group A — Home + Catalog + Tractor Detail + Compare

**Model:** Opus agent. Most complex group — these four pages share the tractor data model and the CompareTray state. Must be one agent.

**Files to create:**
- `app/[locale]/page.tsx` — Home: imports Hero, UTPStripe, TractorGrid, FactorySplit, CompareBanner, CasesGrid, NewsGrid, DealersMapPreview, FinalCTA; calls `getAllTractors`, `getAllCases(3)`, `getAllNews(3)` as Server Component fetches
- `app/[locale]/tractors/page.tsx` — catalog: full TractorGrid with all 6 tractors, power filter pills (client state), CompareTray integration
- `app/[locale]/tractors/[model]/page.tsx` — tractor detail: Breadcrumbs, product hero (split grid), sticky sub-nav, VideoPlayer (youtube), SpecTable, cabin grid, attachments grid, warranty block, cases grid, LeadForm; sticky LeadBar at bottom; `generateStaticParams` for all model slugs × locales
- `app/[locale]/tractors/compare/page.tsx` — compare: reads `?models=` search param or `sessionStorage`; model selector dropdowns; comparison table with grouped rows; "best" value highlighting

**Phase 3 dependencies:** All primitive + section components. TractorGrid, CardTractor, SpecTable, CompareTray, LeadForm, VideoPlayer.

**Parallel with other groups:** Groups B, C, D can start as soon as Phase 3 is complete. Group A does not conflict with B/C/D by file path.

---

### Group B — Attachments + Parts + Dealers

**Model:** Opus agent. Shares the SVG map component between Dealers and the DealersMapPreview used in home (already built in Phase 3). Parts page has a service map variant. Connected enough to warrant one agent.

**Files to create:**
- `app/[locale]/attachments/page.tsx` — Tabs by category; `getAllAttachments(locale)` grouped; attachment card grid; "Запросить цену" CTA opens MiniContactForm in a Sheet with attachment name pre-filled
- `app/[locale]/parts/page.tsx` — hero with service request CTA, "what we do" block (4 items), parts request form (model + serial + description), service map (DealersMap variant showing service-only pins)
- `app/[locale]/dealers/page.tsx` — `dealers-layout` (380px sidebar + map area); sidebar: search input, region filter, scrollable list of DealerItem buttons; map: DealersMap CC with click selection showing DealerCard popup; responsive: on `<900px` map top 60vh, list below

**Phase 3 dependencies:** Tabs, Sheet, MiniContactForm, DealersMap, MapPin, SectionHeader.

---

### Group C — News + Cases (list and detail)

**Model:** Opus agent. The list→detail pattern is shared. Article body MDX rendering with custom components is non-trivial.

**Files to create:**
- `app/[locale]/news/page.tsx` — grid with tag filter pills (ru: all/production/delivery/partnership/lineup), Pagination; `getAllNews(locale)` with optional tag filter
- `app/[locale]/news/[slug]/page.tsx` — article layout: Breadcrumbs, hero (date + tag + h1 + lede), 21:9 cover image, 2-col body (main content + sticky TOC sidebar); MDX body with NewsStats and NewsQuote components; share row; 3 related articles at bottom; `generateStaticParams`
- `app/[locale]/cases/page.tsx` — 3-col grid, no pagination in v1 (≤10 cases), tag filter by region or model
- `app/[locale]/cases/[slug]/page.tsx` — Breadcrumbs; case hero (meta row: farm + region + model); 21:9 cover; 2-col body (main + sticky meta box with 4 numbers); MDX body; gallery; related tractors; `generateStaticParams`

**Phase 3 dependencies:** CardNews, CardCase, Pagination, Breadcrumbs, Tabs/Pill, SpecTable (for case metabox), VideoPlayer.

**Custom MDX components needed (create in Phase 4):**
- `components/mdx/NewsStats.tsx` — 3-cell metric grid
- `components/mdx/NewsQuote.tsx` — red-border pullquote
- `components/mdx/CaseQuote.tsx` — same as NewsQuote but with `<cite>`
- `components/mdx/CaseGallery.tsx` — 3-col photo grid
- `components/mdx/CaseStats.tsx`

---

### Group D — About + FAQ + Contacts

**Model:** Sonnet agent. Per PLAN.md §4 Group D rationale: these are static informational pages using patterns already established in Phase 3. No new component patterns needed.

**Files to create:**
- `app/[locale]/about/page.tsx` — hero (mission h1), timeline section (vertical list of year+event pairs, ordered chronologically from 2016), strategic goals (numbered grid with large numbers), factory split section (reuse FactorySplit), logistics infographic (static SVG or image), optional team section (placeholder)
- `app/[locale]/faq/page.tsx` — page hero, search input (client-filtered on type), 2-col layout: sticky left nav (5 category anchors, scroll-spy), right accordion body grouped by category; "Не нашли ответ?" MiniContactForm at bottom; `getAllFAQGroups(locale)`
- `app/[locale]/contacts/page.tsx` — contacts layout: large map (DealersMap showing factory + main office pins); contact info blocks (phone, email, messenger buttons); LeadForm; company requisites (legal name, BIN, address) in small mono text

**Phase 3 dependencies:** Accordion, DealersMap, MiniContactForm, LeadForm, SectionHeader, Breadcrumbs.

**Parallel with A, B, C:** Yes — Sonnet agent for D can run in parallel with Opus agents for A+B+C, provided Phase 3 is complete. No file conflicts.

---

## 15. Risks and Open Questions for the Client

The following items need human input before or during Phase 3. They are marked `TBD` in mock content and listed in `docs/CONTENT_GAPS.md`.

**Blocking for launch:**

1. **Telegram username** for the FAB deep link. The WhatsApp number (+7 747 876-44-44) is confirmed; the Telegram handle is not in any source document. `TELEGRAM_URL` in `lib/constants.ts` is a placeholder.

2. **Top model naming: TS 2114 vs MG 2104.** The PDF catalog says TS 2114; the current site and the handoff prototype use MG 2104. The architecture assumes **MG 2104** as the canonical brand name and URL slug `mg-2104`, because the handoff prototype (the agreed visual truth) uses this name in its tractor card. If the client confirms TS 2114, update the slug, all MDX filenames, and `lib/constants.ts`.

3. **TT 1004 full specifications.** Only power (100 л.с.) is confirmed. All other spec fields in `tt-1004.*.mdx` frontmatter are `null` and the page renders a "Coming soon" badge. Client must provide: engine model, transmission, tank, weight, dimensions.

4. **Dealer network data.** The prototype SVG map has 9 placeholder cities (Актобе, Уральск, Костанай, Астана, Караганда, Семей, Кызылорда, Алматы, Тараз) and a factory pin at Бадам. None of these dealers are confirmed with real addresses, phone numbers, or hours. The DealersMap in v1 will render placeholder data until the client provides the real list.

5. **Active subsidy programs and leasing terms.** The UTPStripe says "до 30% скидки по госпрограммам" and mentions KazAgroFinance. The FAQ leasing section needs accurate current interest rates, program names, and eligibility criteria. This is legal copy that the development team cannot invent.

6. **WhatsApp pre-filled message text in KK locale.** The RU message is "Здравствуйте, хочу узнать о тракторе KAZKIOTI". The KK equivalent needs client review for natural-language quality.

**Non-blocking but needs input before Phase 5 content fill:**

7. **Photo bank.** Models DF 404, TT 1004, TS 1204, MG 2104 have no confirmed photography. The handoff prototype shows `media-ph` placeholders for these. Phase 5 will create MDX files with `heroImage: null` and render a styled placeholder. Real photos must be provided by the client.

8. **Customer cases content.** The prototype shows 3 cases (ФХ «Ақ Жайық», ТОО «Дала Агро», ФХ «Шарбақты»). These farms need to confirm participation and provide: farm name, region, metrics (ha, hours, years), quotes, and photos.

9. **Video assets.** `hero-loop.mp4` exists in the handoff. Factory loop video is a placeholder. Tractor review videos (YouTube URLs) for each model are TBD. The tractor detail page handles missing `videoUrl` gracefully (hides the section).

10. **PDF catalog file.** `public/docs/kazkioti-catalog.pdf` is referenced in the header and FinalCTA. The PDF from the design docs is the 2024 catalog; confirm if this should be updated before launch.

**Architecture assumptions made without client confirmation:**

- Assumed `resend.com` for email delivery. If the client has a preferred SMTP provider, the swap is one function in `app/api/lead/route.ts`.
- Assumed `kk` (ISO 639-1) as the Kazakh locale slug, not `kz`. This changes all URL prefixes and the `hreflang` values.
- Assumed `fra1` Vercel region. If the site requires a Kazakhstan CDN for compliance reasons, this must be revisited (Vercel does not have a KZ edge node; Cloudflare Workers may be needed for compliance).
- The stylized SVG Kazakhstan map is used for the dealers page instead of a third-party tile map (Yandex Maps, 2GIS). This avoids privacy/GDPR concerns, bundle weight, and API key management. If the client requires real geocoded map interaction, a third-party map library must be added (estimated +200 KB bundle, requires a Phase 6 task).
- The legal basis for the cookie banner is assumed to be Kazakhstan law (standard consent for analytics). The specific legal text in `messages/` is a placeholder; it requires review by the client's legal counsel.

---

## 16. Glossary / Naming Conventions

### Component Naming

- All component files: `PascalCase`, filename equals the component's default export name. `Button.tsx` exports `function Button()`. No default exports for utility files — those use named exports.
- Compound components: `CardTractor.tsx` in `Card/` directory. Import as `import { CardTractor } from '@/components/ui/Card/CardTractor'`.
- No index barrel files in `components/ui/` or `components/sections/` — import each component by its explicit path. This prevents circular dependency issues and makes tree-shaking reliable.

### File Naming

- All files: `camelCase.ts` for utilities and types, `PascalCase.tsx` for React components, `kebab-case.mdx` for content files.
- MDX content files always end in `.{locale}.mdx`: e.g., `df-904.ru.mdx`, `df-904.kk.mdx`.
- Test files: co-located with source using `.test.ts` suffix (if unit tests are added); Playwright tests in `tests/` root directory.

### Tractor Model Naming

Canonical brand names and URL slugs:

| Display name | URL slug | File prefix |
|---|---|---|
| DF 404 | `df-404` | `df-404` |
| DF 904 | `df-904` | `df-904` |
| TT 1004 | `tt-1004` | `tt-1004` |
| TS 1204 | `ts-1204` | `ts-1204` |
| TS 1404 | `ts-1404` | `ts-1404` |
| MG 2104 | `mg-2104` | `mg-2104` |

The top model is **MG 2104** in the codebase because the handoff prototype (the agreed visual source of truth) uses this name in every card and label. If the client confirms TS 2114 as the final brand name, a single sed/replace across content files and constants is sufficient — no structural changes needed.

### Route Slug Conventions

- All URL slugs: lowercase kebab-case. No underscores, no uppercase.
- Model slugs: `df-904`, `ts-1404`, `mg-2104` (model prefix, hyphen, number)
- Case slugs: descriptive, e.g., `ak-zhayyk-df904` (farm abbreviation + model slug)
- News slugs: date-prefixed in filename (`2026-04-12-delivery-df904.ru.mdx`) but the URL slug is the non-date portion (`delivery-df904`)
- Attachment slugs: product code kebab-cased, e.g., `bd-30`, `pn-400`, `kh-ag-200`

### Translation Key Conventions

- Namespaces use camelCase: `nav`, `hero`, `tractors`, `forms`, `footer`, `meta`
- Leaf keys use camelCase: `learnMore`, `allCases`, `submitButton`
- Enum-like values use lowercase with hyphens in the locale file: `tag.production`, `tag.delivery`

### CSS Class Conventions

- All Tailwind utility classes in JSX, no custom CSS classes except those required for animation (`.reveal`, `.reveal-stagger`, `.reveal.in`) which are defined in `globals.css` and applied via `className` string
- Animation classes: `reveal` (single element), `reveal-stagger` (on parent, children stagger)
- The `cn()` utility (`lib/utils/cn.ts`) must be used whenever className is computed conditionally — never string concatenation

### API Route Conventions

- All API routes in `app/api/{resource}/route.ts`
- Each route file exports only the HTTP method handlers it implements: `export async function POST(...) {}`. No default export.
- Response shape: `{ success: true, data?: unknown }` or `{ success: false, error: string }`. HTTP status codes are explicit, never omitted.

---

*End of ARCHITECTURE.md — KAZKIOTI*