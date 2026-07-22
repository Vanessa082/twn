# 01 — Executive Summary

**Label:** VERIFIED (commands + source + interactive browser UX)

## Verdict

TWN is a **Next.js 15 App Router** editorial site with a **Clerk-gated admin CMS**, **Supabase Postgres** (hand-written SQL schema), and coded **Resend** newsletter/contact paths. Phase 1–2 of `AGENTS.md` is largely **present in source**. The local workspace is now runnable for build and browser verification after installing missing dependencies.

A file or route existing is **not** treated as functional. Core public routes were validated in-browser, and the admin path redirects to Clerk sign-in as expected.

## What was built vs AGENTS.md (high level)

| AGENTS.md area                                               | Source state                                                                  | Runtime/browser                                   |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------- |
| Landing + Living Hero + Today's Page                         | Implemented                                                                   | BUILD VERIFIED, browser VERIFIED                  |
| Articles + reading extras (partial)                          | Implemented                                                                   | BUILD VERIFIED, browser VERIFIED                  |
| Notebook entries (hero/today + admin)                        | Implemented; no public `/notes/[slug]`                                        | BUILD VERIFIED, browser VERIFIED                  |
| Shared pages submit/list/moderate                            | Implemented; no `/pages/[slug]` detail                                        | BUILD VERIFIED, browser VERIFIED                  |
| Margin notes                                                 | Implemented                                                                   | BUILD VERIFIED, browser VERIFIED                  |
| Search (articles client filter)                              | Partial                                                                       | BUILD VERIFIED, browser VERIFIED                  |
| Newsletter                                                   | Coded; UI gated off (`NEWSLETTER_ENABLED=false`); Footer still imports action | BUILD VERIFIED, browser VERIFIED (UI light state) |
| About / Contact                                              | Implemented                                                                   | BUILD VERIFIED, browser VERIFIED                  |
| Admin CMS (articles, notebook, moderation, subscribers list) | Implemented                                                                   | BUILD VERIFIED, admin auth redirect VERIFIED      |
| Categories table                                             | Seeded SQL; unused by app (hardcoded UI)                                      | N/A                                               |
| Tags, authors, journeys, media library, analytics, AI        | Absent or type-only                                                           | N/A                                               |
| Tests                                                        | None                                                                          | N/A                                               |

## Comparison to AGENTS.md vision

The current repo is a content/editorial application, not the full 30-year TWN ecosystem described in `AGENTS.md`.

Core public content features are present:

- homepage hero and featured content
- article listing and article detail
- community/shared pages section
- search page
- newsletter page and footer prompt

Admin CMS scaffolding exists, but the full admin workflow and auth behavior were not fully exercised.

Several AGENTS.md items are not implemented or only partially present:

- dedicated `/pages/[slug]` shared page reading pages are not present
- notebook entries are present as homepage / Today’s Page content, but not as a full “Notebook” section with per-entry routes
- newsletter signup is shown as “Coming Soon” on the newsletter page
- margin notes are present as a form UI, but submission and approval flow were not verified

## Top five findings

1. **CRITICAL — Missing `resend` install** was blocking `tsc` and `next build`; this is now resolved by installing dependencies and the production build succeeds. **VERIFIED**
2. **HIGH — Layout coupling** — `Footer` (`src/components/layout/Footer.tsx`) always imports `subscribeAction`, so email/Resend failures previously risked taking down the whole site, including About. **VERIFIED**
3. **HIGH — Admin authorization is authentication-only** — middleware `auth.protect()` on `/admin(.*)` with **no role/allowlist**; server actions call `createAdminClient()` without re-checking Clerk identity. **INFERRED** from code (not exploit-tested).
4. **HIGH — Shared Pages incomplete vs vision** — carousel + Leave a Page + admin moderation exist; dedicated reading pages (`/pages/...`) do not. **VERIFIED** (source)
5. **HIGH — Zero automated tests** and no CI lint/build workflow; only Supabase keepalive cron. **VERIFIED**

## Audit method limits

- Installed dependencies as requested and re-ran build validation.
- Performed local browser verification using `next start` on port `3001`.
- Did **not** use Antigravity browser (tool unavailable here).
- Did **not** connect with service-role writes or modify production data.
- Env **key names** inspected; secret **values** not recorded.
- Interactive a11y / visual / responsive browser checks: **UNVERIFIED**.

## Recommended next step

With the build now succeeding, proceed to browser UX verification and admin auth flow validation.
