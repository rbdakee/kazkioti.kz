# MEMORY.md

> Persistent project context shared between agents working in this repo.
> Update with non-obvious decisions, gotchas, and learnings.
> Format per entry: one-line fact, optionally followed by **Why:** and **How to apply:** lines.

---

## Project basics

- KAZKIOTI — Kazakhstan tractor manufacturer (est. 2016, Badam, Turkestan region). Website rebuild from scratch.
- Languages: KZ + RU (EN deferred).
- v1 scope (14 pages): see `PLAN.md` §0 / `docs/kazkioti.md` §12.

## Sources of truth (read these first)

- `docs/kazkioti.md` — company, models (6 tractors: DF 404, DF 904, TT 1004, TS 1204, TS 1404, TS 2114/MG 2104), attachments, services, scope.
- `docs/DESIGN.md` — design TZ: sections, components, motion, a11y, deliverables.
- `.handoff/kazkioti/` — Claude Design handoff (HTML/CSS/JS prototypes for all 14 pages + assets). Not committed.

## Design system (fixed)

- Direction: **B — Editorial-Minimal** (light, editorial, technical).
- Fonts: Space Grotesk (heading) + Inter (body) + JetBrains Mono (numerics/labels).
- Palette tokens (from `.handoff/kazkioti/project/theme.css`):
  - `--bg-default: #ffffff`, `--bg-muted: #f6f5f2`, `--bg-soft: #fafaf9`, `--bg-invert: #0c0c0d`
  - `--text-primary: #0a0a0a`, `--text-muted: #6b6b6b`, `--text-faint: #9a9a99`
  - `--brand-red: #e0001b`, `--brand-red-hover: #c20018`
  - `--brand-blue: #1853d6`, `--brand-blue-soft: #e8eefb`
  - `--border: rgba(15,15,15,.08)`, `--border-strong: rgba(15,15,15,.18)`
- Radius: 4–8px on cards/inputs, 999px on pills/buttons.
- Motion curve: `cubic-bezier(0.2, 0.8, 0.2, 1)`, 250–400ms default.

## Stack (locked 2026-05-20)

- **Framework:** Next.js 14 (App Router) pinned + React 18 + TypeScript 5 + Tailwind CSS 3.
- **Package manager:** pnpm.
- **Deploy:** Vercel, region `fra1` (assumption — see Risks in ARCHITECTURE.md §15), preview per PR, prod on `main`.
- **CMS v1:** MDX-in-repo. File naming: `{slug}.{locale}.mdx` (co-located RU + KK). Path: `content/{tractors,news,cases,attachments,faq}/`. Single swap point in `lib/content/*` for future Sanity/Strapi migration.
- **i18n:** `next-intl` v3 + middleware-based locale detection. Locales: `ru` (default) + `kk` (ISO 639-1, not `kz`). URL form: `/{locale}/...`, always prefixed.
- **Styling:** Tailwind theme mirrors tokens from `.handoff/kazkioti/project/theme.css`. Fonts via `next/font/google` (Space Grotesk, Inter, JetBrains Mono with Cyrillic subset).
- **Email delivery:** Resend (assumption). Rate-limit via `@upstash/ratelimit` + `@upstash/redis`.
- **Validation:** Zod everywhere — frontmatter, API routes, forms.
- **Maps:** stylized inline SVG of Kazakhstan (no 3rd-party tile map in v1).
- **Animation:** native CSS + Intersection Observer hooks; no Framer Motion (bundle weight).

## Workflow rules (see `PLAN.md` for full)

- Main agent never writes code — always delegates to subagents.
- Opus for complex/connected work; Sonnet for small isolated tasks.
- Reviews: Codex (second opinion) + Opus (main reviewer) only — never Sonnet.

## Content gaps (need client input — see ARCHITECTURE.md §15 for full list)

**Blocking for launch:**
- Telegram username for FAB deep link (WhatsApp confirmed: +7 747 876-44-44).
- Top model brand naming: codebase uses **MG 2104** (handoff prototype canonical). Flip to **TS 2114** if client confirms — single sed/replace across `content/` and `lib/constants.ts`.
- TT 1004 — engine, transmission, tank, weight, dimensions all missing.
- Dealer network — 9 placeholder cities (Актобе, Уральск, Костанай, Астана, Караганда, Семей, Кызылорда, Алматы, Тараз) need real addresses, phones, hours.
- Active state subsidy programs + leasing terms (rates, eligibility).
- KK locale WhatsApp pre-filled message (natural-language quality check).

**Non-blocking (needed by Phase 5):**
- Photo bank for DF 404, TT 1004, TS 1204, MG 2104 (placeholders in handoff).
- Customer cases — farm participation confirmations, metrics, quotes, photos.
- YouTube review video URLs per model.
- 2026 PDF catalog confirmation.

**Architecture assumptions (revisitable):**
- Email via Resend (one-function swap if client uses different SMTP).
- Locale slug `kk` not `kz` (ISO 639-1 correctness).
- Vercel `fra1` region (revisit if KZ data residency is required — Vercel has no KZ edge).
- Cookie banner legal text — placeholder; needs legal counsel review.

## Decisions log

- **2026-05-20** — Stack locked: Next.js 14 + React 18 + TS + Tailwind, deploy on Vercel, content as MDX-in-repo. Rationale: best SEO/i18n for KZ+RU site, zero-DevOps deploy, content fits in git for v1.
- **2026-05-20** — Phase 2 architecture (ARCHITECTURE.md) accepted. Key picks: `next-intl` v3, locales `ru`+`kk`, model naming canonical = MG 2104 (matches handoff), pnpm, Resend for email, inline SVG map (no 3rd-party), no Framer Motion (CSS + IO).
