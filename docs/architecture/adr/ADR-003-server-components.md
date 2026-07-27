# ADR-003: Default to React Server Components

- **Status**: Accepted
- **Date**: 2026-07-24
- **Decision owners**: TWN Engineering (Vanessa)
- **Related blueprint volumes**: Volume 7 — System Architecture

---

## Context

Next.js 13+ introduced the App Router with React Server Components (RSC) as the default rendering model. TWN needed to decide how to handle the Server Component / Client Component boundary across the application.

The key tradeoffs are:
- **Server Components** execute on the server, have direct database and secrets access, produce zero client-side JavaScript, and improve Core Web Vitals
- **Client Components** are required for interactivity, hooks, browser APIs, and event handlers

---

## Decision

**Default to Server Components** across all route shells (`page.tsx`, `layout.tsx`) and non-interactive UI.

`"use client"` is added only when a component genuinely requires:
- React state (`useState`, `useReducer`)
- React effects (`useEffect`)
- Browser APIs (`window`, `localStorage`, `navigator`)
- Event handlers that manipulate component state
- Third-party client-only libraries

Business logic, database queries, and authentication checks remain in Server Components or Server Actions. They never run in client components.

---

## Alternatives Considered

**Client-first (everything `"use client"`)**: Simpler mental model for developers familiar with React pre-App Router. But eliminates the performance and security benefits of RSC, and requires moving all data fetching to client-side effects with extra loading states.

**Hybrid without clear rules**: Leads to inconsistency — developers add `"use client"` when encountering errors rather than reasoning about the boundary deliberately.

---

## Consequences

### Positive consequences
- Route shells have zero unnecessary client JavaScript
- Secrets and database credentials stay on the server by default
- Smaller client bundles improve Core Web Vitals (LCP, FCP)
- Direct database access in Server Components eliminates unnecessary API round-trips

### Negative consequences
- Developers must think carefully about the Server/Client boundary
- Some third-party components require wrapping to work within RSC constraints
- Debugging RSC-specific errors requires understanding the two-component model

---

## Security and Privacy Implications
- Server Components cannot accidentally leak environment variables to the client bundle
- `"use client"` components must never receive secrets as props

---

## Operational Implications
No operational implications. This is a compile-time rendering model decision.

---

## Migration Implications
No migration required. This is the Next.js App Router default.

---

## Review Conditions

This decision should be reconsidered when:
- A major Next.js architectural change deprecates the RSC model
- A significant portion of the codebase requires real-time client state that cannot be cleanly separated from server rendering

---

## Supersedes / Superseded By
None.
