# 12 — Security Review

## Positive controls — VERIFIED

- Clerk middleware on `/admin(.*)`
- Supabase RLS for public read/write boundaries in `schema.sql`
- Admin DB mutations via service role (not exposing service key to browser via `env.ts` client schema)
- t3-env validation for required secrets
- HTTP security headers in `next.config.ts` (frame deny, nosniff, referrer, permissions-policy)
- `next/image` remotePatterns allowlist (Cloudinary, Unsplash)

## Findings

| ID | Risk | Severity | Label | Evidence |
|----|------|----------|-------|----------|
| S-01 | Admin = any signed-in Clerk user | HIGH | INFERRED | `middleware.ts` no role check |
| S-02 | Admin Server Actions lack `auth()` | HIGH | INFERRED | `actions/*.ts` use `createAdminClient` directly |
| S-03 | Stored XSS via article HTML | HIGH | INFERRED | `dangerouslySetInnerHTML` on content |
| S-04 | Public INSERT without rate limit (subscribers, shared_pages, margin_notes) | MEDIUM | INFERRED | RLS insert `with check (true)` |
| S-05 | Health route non-null asserts env; bypasses env module | LOW | VERIFIED | `api/health/route.ts` |
| S-06 | Contact recipient hard-coded in source | LOW | VERIFIED | `contact.ts` |
| S-07 | Keepalive workflow comments embed project URL pattern | LOW | VERIFIED | workflow file comments |
| S-08 | Missing `resend` does not leak secrets but disables safe error paths | — | VERIFIED | runtime |

## Auth boundaries summary

- **Public:** read published content; submit community/notes/subscribe  
- **Admin UI:** Clerk session required  
- **Admin data:** service role; effective authZ depends on who can invoke actions  

## Secrets handling — VERIFIED (process)

- `.env.local` present; values not copied into audit docs  
- `.gitignore` expected to cover env (standard Next) — confirm in ops review  

## Not tested

- CSRF specifics of Server Actions beyond Next defaults  
- Clerk production instance hardening  
- Penetration of RLS with anon key beyond reading health  
- Dependency CVE scan (`pnpm audit` not run — optional; would not modify lockfile)
