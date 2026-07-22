# 07 — Feature Inventory

Statuses used (only these):

`VERIFIED_WORKING` · `PARTIALLY_WORKING` · `IMPLEMENTED_NOT_BROWSER_VERIFIED` · `PLACEHOLDER` · `BROKEN` · `PLANNED_ONLY` · `DEAD_OR_UNUSED` · `UNKNOWN`

**Note:** Because HTML pages return HTTP 500 locally, no public UI feature is `VERIFIED_WORKING`. Features with complete source but failed runtime are `BROKEN` for local verification; source completeness is noted in evidence.

---

### F-01 Public home page

- **User:** Visitor
- **Routes:** `/`
- **Files:** `src/app/page.tsx`, `components/home/*`
- **Deps:** Articles, notebook entries, shared pages services; Footer→newsletter
- **Status:** `BROKEN`
- **Browser:** HTTP 500 (`resend`)
- **Limitations:** Site-wide email import failure
- **Evidence:** curl `/` → 500; `email.ts` module not found

### F-02 Navigation

- **User:** Visitor
- **Routes:** global via Navbar/Footer
- **Files:** `Navbar.tsx`, `Footer.tsx`, `messages/en.json`
- **Status:** `BROKEN` (cannot render)
- **Limitations:** Privacy/Terms → `/about`; Footer always mounts newsletter action
- **Evidence:** source + 500s

### F-03 Living Hero

- **User:** Visitor
- **Files:** `Hero.tsx`, `HeroClient.tsx`, `HeroTypewriter.tsx`, `notebook-entries.ts`
- **Status:** `BROKEN`
- **Evidence:** wired on homepage; runtime blocked

### F-04 Today's Page

- **User:** Visitor
- **Files:** `TodaysPage.tsx`, `getTodaysEntry()`
- **Status:** `BROKEN`
- **Limitations:** Returns hardcoded fallback when no DB row for today (never truly empty)
- **Evidence:** `notebook-entries.ts` L211–215

### F-05 Articles list & detail

- **User:** Visitor / Admin (CRUD)
- **Routes:** `/articles`, `/articles/[slug]`, admin article routes
- **Files:** `articles/*`, `services/articles*.ts`, `ArticleForm.tsx`
- **Status:** `BROKEN` (public); admin `IMPLEMENTED_NOT_BROWSER_VERIFIED` blocked by same 500
- **Limitations:** HTML body unsanitized render; scheduled status in schema — scheduling UX UNVERIFIED
- **Evidence:** source; HTTP 500 on `/articles`

### F-06 Notebook entries (admin + hero feed)

- **User:** Admin (write); Visitor (consume)
- **Routes:** `/admin/content/notebook`; consumed on `/`
- **Status:** `BROKEN` / source-complete
- **Limitations:** No public note detail route
- **Evidence:** admin manager + services

### F-07 Journeys / chapters

- **Status:** `PLANNED_ONLY` / absent
- **Evidence:** no routes/services

### F-08 Categories

- **Status:** `PARTIALLY_WORKING` (source) → runtime `BROKEN`
- **Files:** hardcoded in `BrowseByTopic.tsx`, `articles/page.tsx`; table in `schema.sql`
- **Limitations:** DB `categories` unused
- **Evidence:** no service queries `categories`

### F-09 Tags

- **Status:** `PLANNED_ONLY`
- **Evidence:** `Tag` interface in `types/index.ts` only

### F-10 Authors / profiles

- **Status:** `PLANNED_ONLY` / absent
- **Evidence:** About is static Vanessa narrative; no profiles table

### F-11 Media library

- **Status:** `PLACEHOLDER` / partial
- **Evidence:** Cloudinary env + URL optimize; paste URL in `ArticleForm`; no upload API

### F-12 Editorial / featured picks

- **Status:** `PARTIALLY_WORKING` (source)
- **Evidence:** Featured = first of latest articles, not curated flag (`page.tsx`)

### F-13 Shared pages

- **User:** Visitor submit; Admin moderate; Visitor read previews
- **Routes:** `/`, `/community`, `/admin/content/shared-pages`
- **Status:** `PARTIALLY_WORKING` (source) / `BROKEN` (runtime)
- **Limitations:** No detail page; carousel shows full content in card (not preview→read page per AGENTS.md)
- **Evidence:** `SharedPagesSection.tsx` renders `page.content` inline; no `/pages/[slug]`

### F-14 Margin notes

- **Routes:** article detail; `/admin/content/margin-notes`
- **Status:** `BROKEN` runtime / source-complete
- **Evidence:** form/list + moderation services

### F-15 Search

- **Route:** `/search`
- **Status:** `PARTIALLY_WORKING` source / `BROKEN` runtime
- **Limitations:** Client filter ≤100 articles; no notebook/shared-page search
- **Evidence:** `SearchClient.tsx`, `search/page.tsx`

### F-16 Authentication

- **User:** Admin
- **Status:** `IMPLEMENTED_NOT_BROWSER_VERIFIED`
- **Limitations:** No role model; admin journeys UNVERIFIED (no secrets entered)
- **Evidence:** `middleware.ts`; curl `/admin` showed Clerk signed-out protect headers but response still 500

### F-17 Admin CMS

- **Status:** `IMPLEMENTED_NOT_BROWSER_VERIFIED` / runtime blocked
- **Evidence:** full admin nav + managers

### F-18 Newsletter

- **Status:** `PARTIALLY_WORKING` (backend coded; UI Coming Soon) / `BROKEN` (missing package)
- **Deps:** Resend, subscribers table
- **Limitations:** `NEWSLETTER_ENABLED=false`; sandbox FROM address; Footer ignores flag for import
- **Evidence:** `feature-flags.ts`, `email.ts`, `Footer.tsx`

### F-19 Contact

- **Status:** `BROKEN` locally
- **Evidence:** `contact.ts` + page; hard-coded recipient email in action

### F-20 About

- **Status:** `BROKEN` locally (static content in source)
- **Evidence:** `about/page.tsx`

### F-21 Reading experience extras

- **Status:** `PARTIALLY_WORKING` (source)
- **Present:** reading progress, reading time, share/like/bookmark (local), margin notes
- **Absent vs AGENTS:** TOC, print mode, dark reading, syntax highlighting, footnotes, prev/next article as dedicated feature
- **Evidence:** article page components

### F-22 Responsive / a11y / SEO

- **Status:** `UNKNOWN` browser; partial source a11y labels
- **Evidence:** many `aria-*` in components; no browser pass; metadata in layout + article `generateMetadata`; no `sitemap.ts`/`robots.ts` found

### F-23 Health check

- **Route:** `/api/health`
- **Status:** `VERIFIED_WORKING`
- **Evidence:** HTTP 200, `database:"ok"`, latency ~1.1s

### F-24 Dead / unused

- **Status:** `DEAD_OR_UNUSED`
- **Items:** `CategoryCards.tsx`; `src/lib/db/client.ts`; `Tag` type; Cloudinary API secret unused in code; shadcn `components.json` without primitives

### F-25 Analytics / AI / PWA offline

- **Status:** `PLANNED_ONLY` / absent (manifest only for PWA)
- **Evidence:** no analytics/AI packages; `manifest.ts` present

---

## AGENTS.md Phase 1–2 gap summary

**Built (source):** landing sections, hero, today's page, articles, notebook admin, shared pages flow (partial), margin notes, search (partial), about, contact, newsletter plumbing, admin CMS core.

**Lacking / incomplete vs AGENTS.md:** tags; real category CMS; shared page dedicated reading UX; notebook public pages; media library; analytics dashboard; newsletter live delivery; double opt-in; TOC/print/dark mode; community depth (profiles, etc.); journeys; tests.
