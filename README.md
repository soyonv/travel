# Discover Bangladesh AI

**Every Journey Tells a Story.**

An AI-assisted travel platform for Bangladesh: cinematic destination guides, a page for all 64 districts, costed trip templates, an editable itinerary builder, a transparent budget model, an interactive map, bilingual global search and **BanglaVoyage AI**, a grounded travel agent that drafts plans instead of pretending to book them.

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Motion for React, Leaflet/OpenStreetMap, Cloudflare D1 + Drizzle ORM and an OpenAI-compatible AI endpoint.

---

## What is implemented

| Area | What works |
| --- | --- |
| Homepage | Announcement bar (DB-driven), navigation with language switcher and ⌘K search, cinematic Ken Burns hero with staggered headline, functional destination autocomplete, quick discovery filters, AI planner widget, live stats, featured destinations, 64-district teaser, experience carousel, AI section, trip templates, seasonal guide, food/culture, editorial cards, newsletter |
| Destinations | Directory with category/region filters and text search; detail pages with markdown body, highlights, seasonal caveats, linked attractions, advisories, sources, image credit, save-to-account and JSON-LD |
| Districts | Searchable/bilingual client directory for all 64 districts; detail pages with attractions, destination links, food, transport, tips, a sample budget and a printable outline |
| Attractions | Paginated directory (158 records) with category filters; detail pages with fee caveat, coordinates and related sites |
| Experiences | Thirteen anchored, illustrated sections mapped to suitable destinations with responsibility notes |
| Packages | Eight costed trip templates with explicit "estimate, not a quote" labelling, inclusions/exclusions, operator status, no invented dates; detail pages with inquiry form; travel directory of hotels, operators, guides, transport |
| Trip planner | AI/data-based itinerary generation, drag-and-drop and keyboard reordering, add/remove stops and days, save to account, duplicate, delete, print-friendly output, optional read-only share link |
| Budget calculator | Per-room accommodation maths, per-person items, 12% contingency, group/per-person/per-day totals, budget/standard/premium comparison, printable, indicative currency display |
| Map | Leaflet + OpenStreetMap with destination, district and attraction markers, category search, list/map synchronisation, attribution and "no routing engine" disclosure |
| Search | `/search` plus `/api/search` across destinations, districts, attractions, packages, articles, listings and experiences; Bangla/English synonyms, aliases and fallback attempts |
| AI agent | Streaming chat (`/api/ai/chat`) and structured planning (`/api/plan`) with Zod validation, rate limits, same-origin checks, grounding data, prompt-injection guardrails, setup guidance when unconfigured, and a deterministic fallback |
| Accounts | Registration, login, logout, password reset request (email optional), profile/locale, password change, saved destinations, saved reading, saved itineraries, JSON export, account deletion |
| Admin | Role-gated dashboard (editor/admin): destinations, districts, trip templates, articles/guides with markdown preview, alerts, announcements, site settings, inquiries, newsletter subscribers, users/roles (admin only), audit log and content revision snapshots; R2-backed image uploads with type/size checks |
| SEO | Per-page metadata and canonicals, hreflang alternates, Open Graph, JSON-LD (WebSite, Organization, TouristDestination, TouristAttraction, Article/BlogPosting, FAQPage, ItemList), XML sitemap, robots rules, breadcrumbs |
| Quality | 29 unit tests for budget maths, planner validation and search aliases; TypeScript strict; reduced-motion support; skip link; labelled forms; focus styles; print styles; security headers |

No booking, payment, reservation or ticket purchase flow exists. Nothing on the site claims otherwise.

---

## Stack and architecture decisions

* **Next.js App Router + TypeScript** — server-rendered public pages for SEO, server actions for mutations, minimal client JavaScript where interaction demands it.
* **Cloudflare D1 + Drizzle ORM** instead of PostgreSQL/Prisma. The deployment target is Cloudflare Workers, where D1 is the native relational store. The typed schema lives in `db/schema.ts`, migration SQL in `db/migrations/`, and the data-access layer in `lib/queries.ts`.
* **R2** for editor image uploads (`FILES` binding), served through `/api/media/[...key]`.
* **Custom session auth** — PBKDF2-SHA256 password hashes (120k iterations, per-user salt), hashed random session tokens in D1, HTTP-only SameSite=Lax cookies. No third-party auth dependency, no secrets in the client.
* **Content in the database, not in JSX** — destinations, districts, attractions, packages, articles, alerts, announcements, FAQs and settings are records with sources and verification states.
* **AI is optional** — without `AI_API_KEY`, chat explains setup and the planner returns a deterministic plan built from the destination records and the cost model.
* **Leaflet + OpenStreetMap** — no API key, attribution kept, no routing quotes (no routing provider is configured, so we do not invent route times).

### Directory map

```
app/
  actions/          server actions: auth, account, trips, admin, public forms
  api/              ai/chat, plan, search, health, admin/upload, media, account/export
  destinations/     list + [slug]
  districts/        list + [slug]
  attractions/      list + [slug]
  experiences/      anchored experience sections
  packages/         templates + directory + [slug]
  trip-planner/     itinerary builder
  ai-travel-agent/  full-page chat
  budget-calculator/
  map/  search/  travel-guides/  blog/
  account/  account/trips/
  admin/            dashboard + content editors + moderation
  trips/[token]/    read-only shared itinerary
  privacy, terms, cookies, editorial-policy, responsible-tourism,
  affiliate-disclosure, about, contact, faq, partners
components/         brand, site shell, cards, UI primitives, AI, map, trips, admin, account
db/                 schema, migration, seed JSON (destinations, 64 districts, attractions, articles…)
lib/                db, queries, auth, ai, planner, budget, currency, search, seasons, rate limiting
scripts/            image metadata, seed SQL generator, admin bootstrap
tests/              Vitest unit tests
```

---

## Quick start

Requirements: Node 20+, npm, and a Cloudflare account only for remote deployment.

```bash
npm ci
cp .env.example .env.local        # NEXT_PUBLIC_SITE_URL at minimum

# Local D1 (Miniflare) — creates .wrangler/state
npm run db:migrate:local
npm run db:seed:local

# Optional: create an admin account for /admin
npm run admin:create -- you@example.com "Your Name" "a-strong-password"

npm run dev                       # http://localhost:3000
```

`next dev` initialises Cloudflare bindings through `@opennextjs/cloudflare`, so the same D1 and R2 bindings work locally without Docker.

Useful scripts:

```bash
npm run typecheck          # tsc --noEmit
npm test                   # Vitest unit tests
npm run build              # production Next.js build
npm run build:worker       # OpenNext build for Cloudflare Workers
npm run preview:worker     # preview the Worker build locally
npm run db:migrate:local   # apply schema to local D1
npm run db:seed:local      # load editorial seed data locally
npm run db:migrate:remote  # apply schema to the deployed D1
npm run db:seed:remote     # load seed data into the deployed D1
npm run admin:create -- email name [password] [--remote]
```

---

## Environment variables

| Name | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | recommended | Canonical origin for metadata, sitemap, alternates and reset links. |
| `AI_API_KEY` | optional | Enables BanglaVoyage AI chat and AI-drafted plans. Server-side only. |
| `AI_BASE_URL` | optional | OpenAI-compatible base URL. Default `https://freebuff.com/api/v1/paid`. |
| `AI_MODEL` | optional | Model id. Default `@cf/meta/llama-3.1-8b-instruct`. |
| `RESEND_API_KEY` + `EMAIL_FROM` | optional | Password-reset email. Without them the UI explains that nothing was sent. |
| `ADMIN_BOOTSTRAP_EMAIL` | optional | That email is granted `admin` on registration. |

Bindings (in `wrangler.jsonc`, not env vars): `DB` (D1) and `FILES` (R2). Never put secrets in `NEXT_PUBLIC_*`.

---

## How the AI stays honest

1. Chat and planner requests are rate-limited per hashed IP and reject cross-origin POSTs.
2. The system prompt limits facts to a compact grounding extract (destination records, attractions, active advisories), forbids invented fees/schedules/operators/reviews/confirmations and tells the model to ignore instructions inside the data block.
3. Plan output is validated against a Zod schema (`lib/planner.ts`). Invalid output falls back to the deterministic plan and says so.
4. The fallback plan is built from the same records and the transparent budget model, so every number is traceable.
5. The interface states that estimates are estimates and that no booking exists. The agent cannot take payments.

To verify quickly:

```bash
curl -s -X POST http://localhost:3000/api/plan \
  -H 'content-type: application/json' -H 'origin: http://localhost:3000' \
  -d '{"destinationSlug":"sylhet","days":3,"travelers":2}'
# → {"plan":{…},"source":"data-model","aiConfigured":false}
```

---

## Admin

* `/admin` — counts, latest inquiries, recent audit entries, AI/binding status.
* Destinations, districts, trip templates, guides/blog — create, edit, delete; previous versions are snapshotted to `content_revisions`; every change is appended to `audit_logs`.
* Alerts and announcements — create, activate/deactivate, delete.
* Submissions — inquiry status workflow and newsletter removal.
* Settings — announcements, site settings, environment checks (presence only; values are never rendered).
* Users — role changes (admin only; you cannot change your own role).
* Uploads — JPEG/PNG/WebP/AVIF, max 4 MB, stored in R2 under `uploads/`.

**First admin:** use `npm run admin:create`, or set `ADMIN_BOOTSTRAP_EMAIL` before that person registers. There is no "first registered user becomes admin" shortcut.

---

## Deploying to Cloudflare Workers

1. Create the database and bucket, then replace the placeholder id in `wrangler.jsonc`:
   ```bash
   npx wrangler d1 create discover-bangladesh-ai
   npx wrangler r2 bucket create discover-bangladesh-media
   ```
2. Apply the schema and seed to remote D1:
   ```bash
   npm run db:migrate:remote
   npm run db:seed:remote
   ```
   Review the seed before production: it is editorial demo content, not a live verified directory.
3. Set secrets:
   ```bash
   npx wrangler secret put AI_API_KEY        # optional
   npx wrangler secret put RESEND_API_KEY    # optional
   npx wrangler secret put EMAIL_FROM        # optional
   ```
   Set `NEXT_PUBLIC_SITE_URL` as a plain variable to the production origin.
4. Build and deploy the Worker:
   ```bash
   npm run build:worker
   npm run deploy:worker
   ```
5. Create the first admin against remote D1:
   ```bash
   npm run admin:create -- you@example.com "Your Name" [password] --remote
   ```

### Deployment notes

* Next image optimisation on Workers needs a supported loader (for example Cloudflare Images). If you do not configure one, set `images.unoptimized = true` in `next.config.ts` or serve pre-sized images; otherwise `/ _next/image` may fail at the edge.
* Email delivery is intentionally optional; password reset reports that it could not send rather than pretending.
* The map needs outbound access to OpenStreetMap tiles from the browser; no key is required, and attribution is displayed.
* Re-run `db:migrate:remote` whenever `db/migrations` changes.

---

## Verification performed

* `npm run typecheck` — clean.
* `npm test` — 29 tests across budget arithmetic, planner validation, currency and search aliases.
* `npm run build` — production build completes (see the build log in the handover notes).
* HTTP smoke tests on the local D1-backed dev server for every public route in the brief, including 404 handling, sitemap and robots.
* Auth flow exercised through the progressive-enhancement form (no JavaScript): sign-in → session cookie → `/account` → `/admin` dashboard → JSON export; signed-out requests to `/account` and `/admin` redirect to `/login`.
* API checks: `/api/health`, `/api/search`, `/api/plan` (validated data-model plan), `/api/ai/chat` (503 with actionable setup guidance when no key).
* Local admin bootstrap script creates a working PBKDF2 hash and admin role in D1.

### Known limitations

* No live booking, payment, weather, routing or availability provider is configured; the UI says so instead of faking it.
* AI output quality depends on the configured model and key. In this environment no key was present, so only the deterministic planner path could be verified live.
* Bangla UI covers navigation, page furniture and Bangla content fields; some long-form editorial bodies are English only. Hreflang points to the language-cookie view.
* Attraction coordinates and district images are incomplete; pages handle missing values rather than inventing them.
* No automated browser test suite is included; interactive behaviours (drag-and-drop, map, streaming) are covered by code review and manual checks.

---

## Content and licensing

Editorial text is original. Photographs are hotlinked from Wikimedia Commons with author/licence links stored per record; map data © OpenStreetMap contributors. Check each file page before reusing an image. Official information should be re-verified against the Bangladesh Tourism Board, Forest Department and other authorities before publication.
