# 04 — Architecture

## System shape — VERIFIED

```
Browser
  → Next.js App Router (RSC + Client Components)
      → Server Actions (src/app/actions/*)  OR  Server Components calling services
          → Service layer (src/lib/services/*)
              → Supabase (anon SSR client | service-role admin client)
          → Resend (email.ts / contact fetch)   [BROKEN: package missing]
  → Clerk middleware (protect /admin)
```

## Layering — VERIFIED with exceptions

Intended: **UI → actions/services → DB** (aligns with project layered rules).

| Concern                           | Assessment                                                                               |
| --------------------------------- | ---------------------------------------------------------------------------------------- |
| Components call Supabase directly | Not observed — good                                                                      |
| Pages import services             | Yes (e.g. `src/app/page.tsx`)                                                            |
| Mutations via Server Actions      | Yes                                                                                      |
| Health route                      | Bypasses service + `env` module — creates Supabase client inline (`api/health/route.ts`) |
| Contact action                    | Calls Resend HTTP directly instead of only `email.ts`                                    |
| Browser DB client                 | `src/lib/db/client.ts` unused                                                            |

## Rendering strategy — VERIFIED

- Public content pages: RSC + ISR (`revalidate = 60`)
- Admin: `force-dynamic` on admin layout
- Fallbacks in services when DB errors (and sometimes when empty)

## AuthZ model — INFERRED (security-sensitive)

1. Public reads: Supabase RLS (published/approved/active rows).
2. Public inserts: subscribers, shared_pages, margin_notes (open INSERT policies).
3. Admin writes: service-role client bypasses RLS.
4. Gate to admin UI: any authenticated Clerk user (`auth.protect()` only).
5. Server actions: **no** `auth()` check before admin mutations — relies on obscurity of action IDs + assuming only admin UI invokes them. Next.js Server Actions are callable if the action ID is known; this is a material risk.

## Content management — VERIFIED

Custom admin UI (not headless CMS). HTML article body stored as text and rendered with `dangerouslySetInnerHTML`.

## Cross-cutting configs — VERIFIED

- Security headers in `next.config.ts`
- Image allowlist: Cloudinary, Unsplash
- Redirect: `/blog/:slug` → `/articles/:slug`
- PWA manifest: `src/app/manifest.ts`

## Structural risks

1. Email dependency imported from global Footer → site-wide blast radius (**VERIFIED** via 500s).
2. Feature flag does not gate Footer newsletter import (**VERIFIED**).
3. Orphan `categories` table vs hardcoded category enums (**VERIFIED**).
4. No migration tooling — schema drift risk (**INFERRED**).
5. Fallback content can mask empty DB state (Today's Page always shows fallback when no row) (**VERIFIED** in `getTodaysEntry`).
