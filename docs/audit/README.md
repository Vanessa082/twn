# TWN Existing-Application Audit

**Audit date:** 2026-07-22 (UTC)  
**Repository commit:** `58ab2796b4697abfe3a563b12fd55dfc6565a54b`  
**Branch:** `main`  
**Scope:** Inspection only — no application code changes, no installs, no fixes.

## Purpose

Evidence-based report of what TWN currently is in source, what can run, what works in the browser, what is incomplete, broken, unverified, or only planned (including gaps vs `AGENTS.md`).

## How to read this pack

| Order | File                                                                               | Contents                      |
| ----: | ---------------------------------------------------------------------------------- | ----------------------------- |
|     1 | [`01-executive-summary.md`](./01-executive-summary.md)                             | Verdict and top risks         |
|     2 | [`09-runtime-validation.md`](./09-runtime-validation.md)                           | Commands and results          |
|     3 | [`11-bug-register.md`](./11-bug-register.md)                                       | Reproduced and suspected bugs |
|     4 | [`07-feature-inventory.md`](./07-feature-inventory.md)                             | Feature status matrix         |
|     5 | [`20-recommended-stabilization-order.md`](./20-recommended-stabilization-order.md) | What to fix first             |
|     — | Remaining `02`–`19`                                                                | Deep dives by topic           |
|     — | [`AUDIT_MANIFEST.md`](./AUDIT_MANIFEST.md)                                         | File checklist and method     |

## Machine-readable

- [`machine-readable/routes.json`](./machine-readable/routes.json)
- [`machine-readable/features.json`](./machine-readable/features.json)
- [`machine-readable/bugs.json`](./machine-readable/bugs.json)
- [`machine-readable/dependencies.json`](./machine-readable/dependencies.json)
- [`machine-readable/validation-results.json`](./machine-readable/validation-results.json)

## Confidence labels

Used throughout:

- **VERIFIED** — confirmed by file, command output, or HTTP observation
- **INFERRED** — reasonable conclusion from code structure without runtime proof
- **UNVERIFIED** — could not be confirmed in this audit
- **NOT_APPLICABLE** — outside scope or not present by design

## Critical blocker (read first)

Local type-check, production build, and essentially all HTML page routes fail because `resend` is declared in `package.json` / lockfile but **not present** under `node_modules`. Root `Footer` imports `subscribeAction`, so the missing module contaminates every page using the root layout.

Only `GET /api/health` returned HTTP 200 with `database: "ok"` during runtime probes.

Antigravity browser UI audit was **not available** in this Cursor agent environment; browser claims are limited to HTTP probes against `pnpm dev`.
