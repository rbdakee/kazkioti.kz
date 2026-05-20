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

- **Framework:** Next.js (App Router) + TypeScript + Tailwind CSS.
- **Deploy:** Vercel (preview per PR, prod on `main`).
- **CMS v1:** MDX-in-repo (`/content/news/*.mdx`, `/content/cases/*.mdx`, `/content/faq/*.mdx`, `/content/tractors/*.mdx` for specs). Migration to Sanity/Strapi possible later.
- **i18n:** Next.js built-in `next-intl` or `next-i18next` (architect agent decides in Phase 2).
- **Styling:** Tailwind theme mirrors tokens from `.handoff/kazkioti/project/theme.css`.

## Workflow rules (see `PLAN.md` for full)

- Main agent never writes code — always delegates to subagents.
- Opus for complex/connected work; Sonnet for small isolated tasks.
- Reviews: Codex (second opinion) + Opus (main reviewer) only — never Sonnet.

## Content gaps (need client input)

- Final brand naming for top model: **TS 2114** (catalog PDF) vs **MG 2104** (current site).
- TT 1004 — full spec sheet missing.
- Dealer / service network — list of points, addresses, regions.
- Active state subsidy programs and leasing terms (rates, conditions).
- Customer cases — which farms agreed to be featured, photos, metrics.
- Photo bank: production line, cabins, tractors in the field by model.

## Decisions log

- **2026-05-20** — Stack locked: Next.js + TS + Tailwind, deploy on Vercel, content as MDX-in-repo. Rationale: best SEO/i18n for KZ+RU site, zero-DevOps deploy, content fits in git for v1.
