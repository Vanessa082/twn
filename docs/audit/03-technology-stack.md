# 03 — Technology Stack

Versions below are **installed** from `node_modules/*/package.json` unless noted. Declared ranges are from `package.json`.

## Core — VERIFIED

| Layer       | Choice                      | Declared  | Installed |
| ----------- | --------------------------- | --------- | --------- |
| Framework   | Next.js App Router          | `15.3.9`  | `15.3.9`  |
| UI library  | React                       | `^19.0.0` | `19.2.7`  |
| Language    | TypeScript (`strict: true`) | `^5`      | `5.9.3`   |
| Styling     | Tailwind CSS v4 + PostCSS   | `^4`      | `4.3.1`   |
| Lint/format | Biome                       | `1.9.4`   | `1.9.4`   |

## Rendering & routing — VERIFIED

- **Rendering:** React Server Components by default; client components marked `"use client"`.
- **ISR:** `revalidate = 60` on home and article pages.
- **Routing:** App Router file-based routes under `src/app`; route group `(admin)` for CMS.
- **i18n:** `next-intl` `4.13.0` — single locale `en` (`src/i18n/request.ts`, `src/messages/en.json`).

## Auth — VERIFIED (usage)

- **Provider:** `@clerk/nextjs` `7.5.2`
- **Usage:** `clerkMiddleware` + `auth.protect()` on `/admin(.*)`; `ClerkProvider` / `UserButton` only in admin layout.
- **Not used:** NextAuth, Supabase Auth for app users.

## Data — VERIFIED

- **Database:** Hosted Supabase Postgres
- **Client:** `@supabase/supabase-js` `2.108.1`, `@supabase/ssr` `0.12.0`
- **ORM:** None (no Drizzle/Prisma)
- **Schema:** `src/lib/db/schema.sql` (manual apply)
- **Access pattern:** Services → `createClient` / `createAdminClient` in `src/lib/db/server.ts`

## Validation — VERIFIED / INFERRED

- **Zod** `4.4.3` — used heavily in `src/lib/env.ts`; **not** used for domain entity schemas.
- Domain validation is ad-hoc in services (email regex, word counts, char limits).

## Email — VERIFIED (code) / BROKEN (install)

- **Package:** `resend` declared `^6.17.2`, present in lockfile, **absent from `node_modules`**
- **Code:** `src/lib/services/email.ts` imports `Resend`; contact also uses Resend REST via `fetch` in `contact.ts`

## Media — PARTIAL — VERIFIED

- **Cloudinary:** env vars required; URL transform in `ImageWithSkeleton.tsx`; `next.config.ts` remotePatterns; **no** Cloudinary npm SDK; admin cover = paste URL.

## UI libraries — VERIFIED

- `lucide-react` icons
- `components.json` references shadcn/ui **new-york**, but `src/components/ui/` contains only custom ambient components (no shadcn primitives installed)
- Google fonts via `next/font`: Inter, Playfair Display, Cormorant Garamond

## State / forms — VERIFIED

- No Redux/Zustand/React Query
- Server Actions + `useActionState` for forms
- Client `localStorage` for article like/bookmark (`ArticleEngagement.tsx`)

## Feature flags — VERIFIED

- `NEWSLETTER_ENABLED = false` in `src/lib/feature-flags.ts`

## Analytics / AI / CMS — VERIFIED ABSENT

No PostHog/Vercel Analytics, no OpenAI/AI SDK, no Sanity/Contentful/Payload.

## Testing tools — VERIFIED ABSENT

No Jest/Vitest/Playwright/Cypress configs or test scripts.

## Logging / monitoring — INFERRED

- `console.error` / `console.warn` in services/actions
- `/api/health` for uptime-style checks
- GitHub Actions keepalive for Supabase free-tier pause prevention
- No Sentry/OpenTelemetry packages found

## Env tooling — VERIFIED

`@t3-oss/env-nextjs` `0.13.11` + Zod fail-fast validation.
