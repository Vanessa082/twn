# ADR-002: Use Clerk for Authentication

- **Status**: Accepted
- **Date**: 2026-07-24
- **Decision owners**: TWN Engineering (Vanessa)
- **Related blueprint volumes**: Volume 7 — System Architecture, Volume 10 — Security Architecture

---

## Context

TWN requires authentication for the admin CMS (article creation, moderation, user management). Building a custom authentication system from scratch introduces significant security risk and engineering overhead. A third-party provider was preferred.

---

## Decision

Use **Clerk** as the authentication provider for all admin authentication in Phase 2.

Clerk is treated as an infrastructure dependency. It is wrapped behind an adapter (`identity/infrastructure/clerk-adapter.ts`) so no business or application layer code imports Clerk directly.

Admin identity is resolved through the `Identity` module's published contracts, not through direct Clerk API calls in business modules.

---

## Alternatives Considered

**Auth.js (NextAuth)**: Open-source and self-hosted. Requires more configuration and database session management. More control but more responsibility for security.

**Supabase Auth**: Tight Supabase integration. Works well if the entire auth surface is Supabase-managed, but requires mixing Supabase auth with Supabase data queries in ways that complicate the architecture.

**Custom JWT implementation**: High security risk. Not appropriate for a solo project.

---

## Consequences

### Positive consequences
- Clerk handles session management, token rotation, and OAuth provider integrations
- Built-in Next.js middleware and Server Component support
- Admin user management dashboard provided out of the box
- Rapid implementation allowed Phase 2 to focus on content features

### Negative consequences
- Vendor dependency: if Clerk changes pricing, deprecates APIs, or shuts down, migration is required
- The adapter abstraction adds a small layer of indirection
- Clerk's free tier limits may require paid upgrade as the project scales

---

## Security and Privacy Implications
- Clerk stores user credentials and session tokens externally
- No TWN database tables contain passwords or session data
- The `CLERK_SECRET_KEY` is a server-only variable never exposed to the client bundle
- Admin routes are protected by Clerk middleware and by the `requireAdmin()` server-side check

---

## Operational Implications
- Clerk dashboard is required for admin user management (creating/revoking admin access)
- `ADMIN_USER_IDS` environment variable provides a secondary allowlist check independent of Clerk roles

---

## Migration Implications
Replacing Clerk in the future requires:
1. Implementing a new `AuthAdapter` satisfying the `AuthorizationPort` interface in `identity/contracts/index.ts`
2. Updating `identity/infrastructure/` only — no business logic changes required
3. Updating middleware to use the new provider's session verification

---

## Review Conditions

This decision should be reconsidered when:
- Clerk's pricing becomes prohibitive relative to TWN's scale
- A security incident affects Clerk's infrastructure
- Reader authentication is introduced and requires a different identity model
- Self-hosting authentication becomes a stated product or compliance requirement

---

## Supersedes / Superseded By
None.
