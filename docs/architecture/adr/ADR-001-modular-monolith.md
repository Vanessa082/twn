# ADR-001: Use a Modular Monolith Architecture

- **Status**: Accepted
- **Date**: 2026-07-24
- **Decision owners**: TWN Engineering (Vanessa)
- **Related blueprint volumes**: Volume 7 — System Architecture

---

## Context

TWN is a solo-built editorial platform. The codebase must support long-term feature growth across editorial, community, notebook, search, newsletter, and identity capabilities.

The options considered were:
1. A flat monolith — all code organized by technical type (`services/`, `actions/`, `components/`)
2. A modular monolith — code organized by domain capability (`modules/editorial/`, `modules/community/`, etc.) inside one deployable unit
3. Microservices — separate deployed services per capability

---

## Decision

Adopt a **modular monolith** with strict module boundaries enforced by code conventions and architecture tests.

Modules own their domain logic, tables, and contracts. Cross-module communication is restricted to published contract interfaces.

---

## Alternatives Considered

**Flat monolith**: Simpler initially but leads to unmanageable cross-cutting dependencies as features grow. Every future feature becomes a refactor risk.

**Microservices**: Operationally expensive for a solo project. Requires service discovery, distributed tracing, network-level contracts, and independent deployments. Not justified at this scale or team size.

---

## Consequences

### Positive consequences
- Each domain capability can evolve independently
- New developers or contributors can reason about one module at a time
- A future migration to microservices (if ever needed) is straightforward: each module is already a self-contained service in waiting
- Architecture tests can enforce module boundaries automatically

### Negative consequences
- More upfront folder structure than a flat monolith
- Requires discipline to avoid cross-module import shortcuts
- Contracts must be maintained when a module's public interface changes

---

## Security and Privacy Implications
None specific to this structural decision.

---

## Operational Implications
No operational change. TWN remains a single Next.js application with a single deployment unit.

---

## Migration Implications
Existing code in `src/lib/services/` is migrated into `src/modules/<name>/infrastructure/` and `src/modules/<name>/application/` over the course of Milestone 9. Server Actions in `src/app/actions/` become thin transport adapters, not moved.

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
