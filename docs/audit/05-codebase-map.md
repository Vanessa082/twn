# 05 — Codebase Map

~84 source files under `src/`. Responsibilities and concerns.

## Entry points — VERIFIED

| Path                  | Responsibility                                                   |
| --------------------- | ---------------------------------------------------------------- |
| `src/middleware.ts`   | Clerk middleware; protect `/admin(.*)`                           |
| `src/app/layout.tsx`  | Root HTML, fonts, metadata, Navbar/Footer, ambient UI, next-intl |
| `src/app/page.tsx`    | Homepage composition                                             |
| `src/lib/env.ts`      | Env validation                                                   |
| `next.config.ts`      | Images, headers, redirects, next-intl plugin                     |
| `src/i18n/request.ts` | Locale/messages loader                                           |

## `src/app/` — routes & special files

| Area                                                                                  | Responsibility             | Concerns                            |
| ------------------------------------------------------------------------------------- | -------------------------- | ----------------------------------- |
| `page.tsx`, `about/`, `articles/`, `community/`, `contact/`, `newsletter/`, `search/` | Public pages               | No `loading.tsx`                    |
| `(admin)/admin/**`                                                                    | CMS pages                  | AuthZ weak; ClerkProvider only here |
| `actions/*`                                                                           | Server Actions             | Admin actions lack auth re-check    |
| `api/health/route.ts`                                                                 | Health JSON                | Layer bypass                        |
| `error.tsx`, `not-found.tsx`                                                          | Error UX                   | Present                             |
| `manifest.ts`                                                                         | PWA manifest               | Icons under `public/icons`          |
| `globals.css`                                                                         | Design tokens (~758 lines) | Large CSS surface                   |

## `src/components/`

| Folder      | Responsibility                             | Concerns                                                     |
| ----------- | ------------------------------------------ | ------------------------------------------------------------ |
| `home/`     | Landing sections                           | `CategoryCards.tsx` dead; `NotebookSketch.tsx` ~396 lines    |
| `articles/` | Cards, progress, engagement, margin notes  | Engagement is localStorage-only                              |
| `admin/`    | CMS forms/lists                            | `NotebookEntriesManager.tsx` ~452 lines (over 300 guideline) |
| `layout/`   | Navbar, Footer                             | Footer hard-depends on newsletter action                     |
| `search/`   | Client search UI                           | Substring filter only                                        |
| `ui/`       | Ambient UX (cursor, timeline, transitions) | Not a shadcn kit despite `components.json`                   |

## `src/lib/`

| Path                                     | Responsibility                |
| ---------------------------------------- | ----------------------------- |
| `db/schema.sql`                          | DDL + RLS + seeds             |
| `db/server.ts`                           | Anon + admin Supabase clients |
| `db/client.ts`                           | Browser client — **unused**   |
| `services/*`                             | Business logic + fallbacks    |
| `feature-flags.ts`                       | Newsletter gate               |
| `utils/slug.ts`, `utils/reading-time.ts` | Pure helpers                  |

## Other

| Path                                   | Responsibility   | Concerns                                  |
| -------------------------------------- | ---------------- | ----------------------------------------- |
| `src/types/index.ts`                   | Domain TS types  | `Tag` has no table                        |
| `src/messages/en.json`                 | i18n copy        | Incomplete coverage (much inline English) |
| `scripts/apply-schema*.mjs`, `seed.js` | Schema/seed ops  | Hard-coded project ref in scripts         |
| `public/`                              | Static SVG/icons | Default create-next-app leftovers present |
| `scratch-test.mjs`                     | Informal scratch | Not a test suite                          |
| Tests                                  | —                | **None**                                  |

## Missing directories (vs common Next apps)

No `src/hooks`, no top-level `src/services` (services live under `lib/services`), no `supabase/` CLI project, no `__tests__`.
