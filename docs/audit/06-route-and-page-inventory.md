# 06 — Route and Page Inventory

## Public pages — VERIFIED (source)

| URL | File | Purpose | Local HTTP (2026-07-22) |
|-----|------|---------|-------------------------|
| `/` | `src/app/page.tsx` | Landing notebook | **500** — missing `resend` |
| `/about` | `src/app/about/page.tsx` | Story/mission (static) | **500** |
| `/articles` | `src/app/articles/page.tsx` | Article index + category query | **500** |
| `/articles/[slug]` | `src/app/articles/[slug]/page.tsx` | Article detail + margin notes | UNVERIFIED (list unreachable) |
| `/community` | `src/app/community/page.tsx` | Shared pages landing | **500** |
| `/contact` | `src/app/contact/page.tsx` | Contact form | **500** |
| `/newsletter` | `src/app/newsletter/page.tsx` | Newsletter / Coming Soon | **500** |
| `/search` | `src/app/search/page.tsx` | Client article search | **500** |

## Admin pages — VERIFIED (source) / UNVERIFIED (auth UX)

| URL | File | Purpose | Local HTTP |
|-----|------|---------|------------|
| `/admin` | `(admin)/admin/page.tsx` | Dashboard | **500** (also Clerk signed-out headers) |
| `/admin/articles` | `.../articles/page.tsx` | List | UNVERIFIED |
| `/admin/articles/new` | `.../new/page.tsx` | Create | UNVERIFIED |
| `/admin/articles/[id]/edit` | `.../[id]/edit/page.tsx` | Edit | UNVERIFIED |
| `/admin/content/notebook` | `.../notebook/page.tsx` | Notebook manager | UNVERIFIED |
| `/admin/content/shared-pages` | `.../shared-pages/page.tsx` | Moderation | UNVERIFIED |
| `/admin/content/margin-notes` | `.../margin-notes/page.tsx` | Moderation | UNVERIFIED |
| `/admin/newsletter` | `.../newsletter/page.tsx` | Subscriber list | UNVERIFIED |

Admin layout: `src/app/(admin)/admin/layout.tsx` — `dynamic = "force-dynamic"`.

## API — VERIFIED

| Method/URL | File | Local HTTP |
|------------|------|------------|
| `GET /api/health` | `src/app/api/health/route.ts` | **200** — `{"ok":true,"database":"ok",...}` |

## Redirects — VERIFIED

| From | To | Result |
|------|-----|--------|
| `/blog/:slug` | `/articles/:slug` | HTTP **308** observed for `/blog/test-slug` |

## Special

| Route | Notes |
|-------|-------|
| `/manifest.webmanifest` | From `manifest.ts` — UNVERIFIED HTTP |
| 404 | `not-found.tsx` — unknown path returned **500** (error overlay), not clean 404, due to compile error |

## Server Actions (not URL routes) — VERIFIED

| Module | Exports (principal) |
|--------|---------------------|
| `actions/articles.ts` | create/update/delete article |
| `actions/notebook-entries.ts` | CRUD entries |
| `actions/shared-pages.ts` | submit/moderate/delete |
| `actions/margin-notes.ts` | submit/moderate/pin/delete |
| `actions/newsletter.ts` | subscribe |
| `actions/contact.ts` | contact email |

## Absent routes (planned in vision / types) — VERIFIED ABSENT

- `/pages/[slug]` or `/shared-pages/[slug]` detail
- `/notes/[slug]` (commented as future on `NotebookEntry.slug`)
- `/privacy`, `/terms` (footer links point at `/about`)
- Author/profile routes
- Journey/chapter routes
- Tags browse routes
