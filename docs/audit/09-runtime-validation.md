# 09 — Runtime Validation

**Policy:** No packages installed. Dependencies already present under `node_modules` (incomplete).

## Commands run — VERIFIED

| # | Command | Result | Exit |
|---|---------|--------|------|
| 1 | `git status` / branch / log | Clean app tree; untracked `docs/`; `main` @ `58ab279` | 0 |
| 2 | Env key listing (names only) | Keys present matching example | 0 |
| 3 | `pnpm type-check` | **FAIL** — `TS2307: Cannot find module 'resend'` at `src/lib/services/email.ts:14` | 2 |
| 4 | `pnpm lint` | **FAIL** — 4 errors (format + style), 13 warnings (`any`, non-null assertions, hook deps, etc.) | 1 |
| 5 | Configured tests | **SKIPPED** — no test script / no test files | N/A |
| 6 | `pnpm build` | **FAIL** — webpack `Can't resolve 'resend'` (traces via `subscribers` / newsletter / admin) | 1 |
| 7 | `pnpm dev` | Server starts (Turbopack Ready) | running |
| 8 | HTTP probes against localhost:3000 | See below | — |
| 9 | Stopped dev server | Process killed after probes | — |

## HTTP probe results (`pnpm dev`) — VERIFIED

| Path | HTTP | Notes |
|------|------|-------|
| `/` | 500 | Module not found `resend` |
| `/about` | 500 | Same (Footer import chain) |
| `/articles` | 500 | Same |
| `/community` | 500 | Same |
| `/contact` | 500 | Same |
| `/newsletter` | 500 | Same |
| `/search` | 500 | Same |
| `/api/health` | **200** | `ok:true`, `database:"ok"`, `latency_ms` ~1160 |
| `/admin` | 500 | Clerk `signed-out` protect headers + resend compile error |
| unknown path | 500 | Not clean 404 while compile error active |
| `/blog/test-slug` | **308** | Redirects to `/articles/test-slug` |

## Install state note — VERIFIED

- `package.json` lists `resend`
- `pnpm-lock.yaml` contains `resend@6.17.2`
- `node_modules/resend` **does not exist**
- Other deps (`next`, `@clerk/nextjs`, `@supabase/supabase-js`) **do** resolve

**Conclusion:** Runtime validation proves the app is **not production-buildable** and **not browsable for HTML pages** until dependencies are repaired. Health endpoint and DB connectivity work independently of Resend.

## Tests

No `*.test.*` / `*.spec.*`, no Vitest/Jest/Playwright config. `scratch-test.mjs` is not a suite.

**Do not claim tests passed — they were not run because they do not exist.**
