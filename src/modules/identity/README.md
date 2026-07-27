# Identity Module

## Purpose
Resolves authenticated actors and enforces authorization policies across the TWN platform. Identity defines *who* a user is and *what* they are permitted to do — without coupling any business module directly to Clerk or any other authentication provider.

## Owned Capabilities
- Authenticated actor resolution
- Administrator role mapping and allowlist enforcement
- Authorization policy definitions
- Session identity typing
- Clerk adapter (infrastructure layer only)

## Owned Tables
None. Identity resolves authentication state from external providers. Actor identity fields in audit logs are *supplied* by Identity contracts, but the `audit_logs` table is owned by Platform/Audit.

## Architecture: Ports and Adapters
```text
Business Modules (Editorial, Community, Notebook, etc.)
    ↓
Identity contracts (UserIdentity, AuthorizationPort)
    ↓
Infrastructure: ClerkAdapter
    ↓
Clerk (@clerk/nextjs/server)
```

Clerk is an implementation detail, not a dependency of any business rule.

## Public Commands
- `requireAdmin()` → resolves current session and throws if not an authorized administrator

## Public Queries
- `isAuthorizedAdmin(input)` → pure predicate for unit-testable authorization logic
- `parseAdminUserIds(raw)` → parses comma-separated Clerk user ID allowlist

## Published Contracts
- `UserIdentity`: `{ userId: string; role: string | null }`
- `AuthorizationPort`: interface for permission checks
- See `contracts/index.ts`

## Consumed Contracts
None. Identity is a foundational module consumed by others.

## Routes
None. Identity does not own any routes.

## Permissions
This module defines permissions. It does not itself require authorization to operate.

## Events
None in Phase 2.

## Forbidden Dependencies
- Domain and application layers must not import `@clerk/nextjs` directly
- Clerk must only appear in `identity/infrastructure/clerk-adapter.ts`
- Must not import from `@/modules/editorial`, `@/modules/community`, or `@/modules/notebook`

## Known Limitations
- No reader identity — all public users are anonymous in Phase 2
- No role hierarchy — identity is binary: admin or not admin
- No fine-grained permissions per resource (e.g., per-article ownership)
- Clerk is the only supported identity provider in Phase 2
