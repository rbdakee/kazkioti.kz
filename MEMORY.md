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

**Phase 4 Wave 2 Group D content gaps (added 2026-05-20):**
- FAQ leasing answers: subsidy rate "до 30%" and KazAgroFinance terms (3–7% годовых, до 7 лет) are approximate — needs client confirmation.
- `contacts.requisitesBinValue` = "TBD" in both ru.json and kk.json — BIN unknown, needs client.
- `contacts.requisitesBankValue` = "TBD" in both — bank details unknown, needs client.
- About page timeline: 6 milestones derived from handoff HTML prototype — should be verified with client.

**Architecture assumptions (revisitable):**
- Email via Resend (one-function swap if client uses different SMTP).
- Locale slug `kk` not `kz` (ISO 639-1 correctness).
- Vercel `fra1` region (revisit if KZ data residency is required — Vercel has no KZ edge).
- Cookie banner legal text — placeholder; needs legal counsel review.

## Decisions log

- **2026-05-20** — Stack locked: Next.js 14 + React 18 + TS + Tailwind, deploy on Vercel, content as MDX-in-repo. Rationale: best SEO/i18n for KZ+RU site, zero-DevOps deploy, content fits in git for v1.
- **2026-05-20** — Phase 2 architecture (ARCHITECTURE.md) accepted. Key picks: `next-intl` v3, locales `ru`+`kk`, model naming canonical = MG 2104 (matches handoff), pnpm, Resend for email, inline SVG map (no 3rd-party), no Framer Motion (CSS + IO).
- **2026-05-20** — Phase 3 scaffold built (pre-review). 18 app routes, 41 components, content access layer + 7 mock MDX files, lead API. Deviations from ARCHITECTURE.md: (1) `app/[locale]/_dev/` → `app/[locale]/dev/` because Next.js App Router treats `_`-prefixed folders as private and excludes them from routing — robots.txt and `metadata.robots = noindex` keep it out of prod indexes; (2) `next-intl` v3.22+ uses `await requestLocale` in `getRequestConfig`, not the legacy `locale` argument — implementation follows current docs; (3) Hero count-up animation and `app/opengraph-image.tsx` deferred to Phase 4 polish (`useCountUp` hook exists, not yet integrated in Hero).
- **2026-05-20** — Phase 3 review pass. Opus reviewer (`feature-dev:code-reviewer`) found 4 Tier-1 blockers + 9 Tier-2 quality issues + 3 Tier-3 nits. Codex (`codex:rescue`) was BLOCKED by Windows PowerShell sandbox policy — could not run any commands; second-opinion runtime verification skipped. Mitigation: main agent ran `pnpm build` directly after fixes (27 prerendered routes + 3 dynamic, First Load JS ≤127 KB, middleware 49.5 KB — clean). For future phases on Windows, Codex agent will need a sandbox-policy workaround or be replaced by manual verification.
- **2026-05-20** — Phase 3 fixes applied by Sonnet agent. Notable: `lib/content/news.ts` `getNews` rewritten to exact-match on `frontmatter.slug` (was substring-match → 404 bug); `tailwind.config.ts` got explicit `transitionDuration: { '250': '250ms', '400': '400ms' }` because Tailwind 3 `DEFAULT` key produces bare `duration` utility, not `duration-DEFAULT`; `app/api/lead/route.ts` honeypot `website` is now `optional().default('')` (was required, would 400 any caller omitting it); 7 i18n keys added to messages (`forms.optional`, `about.factoryStats.{localization,founded,service}`, `dealers.mapAriaLabel`, `notFound.title`, `common.close`) to plug RU/EN literal leaks. `Reveal.tsx` `as 'div'` cast intentionally kept (load-bearing for `RefObject<HTMLDivElement>`).
- **2026-05-20** — Phase 4 Wave 1 (Groups A + B parallel) built. Group A: Home/Catalog/TractorDetail/Compare + Hero count-up + OG image + LanguageSwitcher search-params (Suspense-wrapped); 5 new components (HeroMetric, TractorProductHero, TractorSubNav, TractorLeadBar, CompareTable); content: 4 new tractor MDX (DF 404, TT 1004, TS 1204, MG 2104) + 2 news + 2 cases. Group B: Attachments/Parts/Dealers; 3 new components (AttachmentsCatalog, DealersDirectory, PartsRequestForm); 17 attachment MDX; `lib/data/dealers.ts` with 10 placeholder cities; `DealersMap` gained `variant: 'service'|'dealer'|'all'` prop; `/api/lead` extended with optional `vin` + `attachment` fields. No race condition on `messages/*.json` — namespace partitioning held. Final build: 35 prerendered routes, First Load JS ≤127 KB, middleware 49.7 KB.
- **2026-05-20** — Wave 1 review (Opus) found 3 Tier-1 + 9 Tier-2 + 10 Tier-3 issues; Sonnet fix-agent applied 14 (all Tier-1 + Tier-2 + 2 trivial Tier-3). Key fixes: (1) introduced top-level `units.*` namespace in messages (`hp/kg/mm/liters/cylinders/years/hours/km`) — used across TractorProductHero, CompareTable, parts page to plug RU unit leaks in KK locale; (2) TractorProductHero power cell relabeled with new `tractorDetail.cellPower` key (was wrongly using `forms.model`); (3) `lib/data/dealers.ts` Aktobe `phoneHref` had stray space breaking iOS/Android tel: parsing — fixed; (4) `lat/lng` fields renamed to `cx/cy` (they're SVG viewBox coords, not geo); (5) `ATTACHMENT_LIBRARY` hardcoded map dropped from tractor detail page — replaced with `getAttachment(slug, locale)` fetch; (6) `MapPin` got keyboard activation (Enter/Space on `role="button"`); (7) `TractorGrid` unsafe `JSON.parse as string[]` cast replaced with `Array.isArray + every typeof string` guard; (8) `TractorSubNav` items wrapped in `useMemo` to prevent IO observer re-attaching on every render. **Schema casing canonicalized**: attachments use `seeding|tillage|mowing|extra` (Zod schema), NOT `mowers/extras` as ARCHITECTURE.md §5 mentioned — schema is source of truth.
- **2026-05-20** — Phase 4 Wave 2 (Groups C + D parallel) built. Group C (Opus): News list+detail / Cases list+detail; 5 RSC MDX components (NewsStats, NewsQuote, CaseStats, CaseQuote, CaseGallery) + 4 section components (NewsFilter, CasesFilter, ArticleToc, ArticleShareRow) + 1 utility (`lib/utils/mdxToc.ts`); 3 new news + 2 new cases MDX; `getAllNews`/`getAllCases` extended with `{tag?,region?,limit?}` options (backwards-compatible — number form preserved for home page caller). Group D (Sonnet): About + FAQ + Contacts; 2 new CC (FAQClient, ContactsMap); 4 new FAQ MDX (`leasing`, `delivery`, `docs`, `service`). No race condition on `messages/*.json`. Final build: 46 prerendered routes.
- **2026-05-20** — Wave 2 review (Opus) found 1 Tier-1 + 2 Tier-2 + 10 Tier-3. Root cause: two divergent `slugify` implementations in `components/mdx/article.tsx` and `lib/utils/mdxToc.ts` stripped Cyrillic without consistent fallback → Cyrillic-only H2s rendered as `<h2 id="">` while TOC anchors emitted `#section-N` → TOC clicks went nowhere, scroll-spy never updated, duplicate `## Что дальше` headings produced two empty IDs (invalid HTML). Sonnet fix-agent introduced `lib/utils/slugifyHeading.ts` with RU+KK Cyrillic→Latin transliteration map AND `createHeadingIdAssigner` factory that tracks counter + seen-slugs map for `section-N` fallback and `-2`/`-3` collision suffixes; both `article.tsx` (now `buildNewsArticleComponents`/`buildCaseArticleComponents` factories) and `mdxToc.ts` instantiate identical assigners → IDs match deterministically. Also applied 5 Tier-3 real bugs: (1) contacts page metric `'10/9/1'` now derived from `DEALERS.filter()`; (2) messenger card split into separate WhatsApp + Telegram cards (was single card with WhatsApp link only); (3) FAQClient sidebar dims empty categories under search filter; (4) ArticleShareRow got `execCommand('copy')` clipboard fallback for older browsers/insecure contexts; (5) CaseGallery `<img>` got intrinsic `width={1200} height={900}` to prevent CLS. Contacts page is now 5 cards in `lg:grid-cols-4` — wraps gracefully.
