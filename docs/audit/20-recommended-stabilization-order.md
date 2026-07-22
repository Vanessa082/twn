# 20 — Recommended Stabilization Order

Do **not** add features until the site can type-check, build, and pass a smoke browser pass.

## P0 — Unblock runtime (do first)

1. **Restore dependencies** — approve and run `pnpm install`; confirm `node_modules/resend` exists.  
2. Re-run `pnpm type-check`, `pnpm lint`, `pnpm build`, `pnpm dev`.  
3. **Decouple Footer from Resend** when newsletter disabled (or always lazy-load) so email outages cannot 500 the whole site.  
4. Smoke HTTP: `/`, `/articles`, `/api/health`, one article slug, `/community`.

## P1 — Security hardening

5. Admin **role/allowlist** in middleware.  
6. `auth()` (and role) checks inside **every** admin Server Action.  
7. Sanitize article HTML (or switch to Markdown) before `dangerouslySetInnerHTML`.

## P2 — Truthfulness of content surfaces

8. Fix `getTodaysEntry` empty vs error fallback behavior.  
9. Gate Footer subscribe UI with `NEWSLETTER_ENABLED`.  
10. Align category sources (DB vs CHECK vs UI).

## P3 — Product completeness vs AGENTS Phase 1

11. Shared Page detail route + preview truncation.  
12. Privacy/Terms real pages or remove links.  
13. Search scope decision (articles-only documented vs expand).

## P4 — Quality system

14. Add minimal Vitest for validation helpers + one service.  
15. Add CI: install, type-check, lint, build.  
16. Replace README with real runbook (env, schema apply, seed, Clerk).  
17. Introduce migration discipline (Supabase CLI or equivalent).

## P5 — Then grow

18. Media upload, tags, authors, analytics — only via approved feature packets after P0–P4.

## Success criteria for “stabilized”

- type-check, lint, build green  
- public routes HTTP 200 with expected sections  
- admin login + create draft article verified in browser  
- health green  
- known bugs BUG-001–003 closed  
