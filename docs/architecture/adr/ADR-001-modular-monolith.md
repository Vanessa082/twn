# ADR-001: Use a Modular Monolith Architecture

- **Status**: Accepted
- **Date**: 2026-07-24
- **Last updated**: 2026-09-30
- **Decision owners**: TWN Engineering (Vanessa)
- **Related blueprint volumes**: Volume 7 — System Architecture

---

## Context

TWN is a solo-built editorial platform. The codebase must support long-term feature growth across editorial, community, notebook, search, newsletter, identity, site, workbench, and media capabilities.

The options considered were:
1. A flat monolith — all code organized by technical type (`services/`, `actions/`, `components/`)
2. A modular monolith — code organized by domain capability (`modules/editorial/`, `modules/community/`, etc.) inside one deployable unit
3. Microservices — separate deployed services per capability

---

## Decision

Adopt a **modular monolith** with strict module boundaries enforced by architecture tests.

A module is a business room, not a technical layer. Each module:

- Owns its language (`domain/` types, re-exported through `contracts/` and the module index)
- Owns its tables (one shared Postgres; ownership is logical, not a database per module)
- Exposes a public API only through `index.ts`, `contracts/`, `actions/`, `ui.ts`, and `admin-ui.ts`
- Hides `application/`, `domain/`, `infrastructure/`, and `presentation/` from outsiders
- Wires adapters in `index.ts` (composition root). Use cases take ports; they do not `new` Supabase or Clerk
- Keeps public widgets in `presentation/` behind `ui.ts`, and admin feature screens behind `admin-ui.ts`, so a public RSC page does not load the CMS client bundle

Cross-module calls go through that public API, in-process. No HTTP between rooms.

`src/app` is the transport hallway (routes and thin action re-exports). `src/components/ui` and admin chrome (`layout`, shared form kit, editor) are the shared kit. Feature screens (note form, moderators, homepage settings) live in the owning module's `presentation/` and are imported through `ui.ts`. `src/types` is only a shared kernel (`PaginatedResult`, `ApiResult`, `NavLink`). Domain nouns do not live there.

One Postgres database is intentional. Table ownership in `schema.sql` and architecture tests is the modular-monolith data rule. Separate databases would copy a microservice cost without independent deployability.

---

## Alternatives Considered

**Flat monolith**: Simpler initially but leads to unmanageable cross-cutting dependencies as features grow. Every future feature becomes a refactor risk.

**Microservices**: Operationally expensive for a solo project. Requires service discovery, distributed tracing, network-level contracts, and independent deployments. Not justified at this scale or team size.

---

## Consequences

### Positive consequences
- Each domain capability can evolve independently
- New developers or contributors can reason about one module at a time
- A future extraction to a service (if ever needed) starts from a room that already has a door and a table owner
- Architecture tests fail the build when a shortcut crosses a wall

### Negative consequences
- More upfront folder structure than a flat monolith
- Requires discipline to import `@/modules/<name>` rather than internals
- Contracts must be maintained when a module's public interface changes

---

## Security and Privacy Implications
None specific to this structural decision.

---

## Operational Implications
No operational change. TWN remains a single Next.js application with a single deployment unit.

---

## Migration Implications
`src/lib/services/` is closed. Server Actions that mutate one module live in that module's `actions/` folder. `src/app/actions/` re-exports them so the route layer stays thin.

---

## Review Conditions

This decision should be reconsidered when:
- One module consistently requires independent scaling separate from all others
- Deployments regularly break unrelated capabilities due to shared infrastructure
- Organisational ownership changes such that different teams own different modules
- Measured reliability or latency requirements cannot be satisfied within a monolith

---

## Supersedes / Superseded By
None.
