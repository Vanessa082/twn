# 18 — Technical Debt

| ID | Debt | Impact | Evidence |
|----|------|--------|----------|
| TD-01 | Incomplete dependency install (`resend`) | Blocks all local HTML | node_modules |
| TD-02 | Email coupled into root Footer | Blast radius | Footer.tsx |
| TD-03 | No automated tests | Regression risk | repo |
| TD-04 | No schema migrations | Drift / onboarding cost | schema.sql only |
| TD-05 | Orphan `categories` table | Dual source of truth | schema + UI |
| TD-06 | `Tag` type without implementation | Confusion | types |
| TD-07 | Oversized admin/UI components | Hard to review | line counts |
| TD-08 | Ad-hoc validation vs Zod domain schemas | Inconsistent rules | services |
| TD-09 | Fallbacks masking empty/error states | Editorial accuracy | getTodaysEntry |
| TD-10 | Cloudinary secrets required unused | Env friction / false security | env.ts |
| TD-11 | shadcn config without components | Misleading | components.json |
| TD-12 | Dead `CategoryCards` / unused db client | Noise | src |
| TD-13 | Biome a11y rules disabled | Quality escape | biome.json |
| TD-14 | README boilerplate | Ops friction | README.md |
| TD-15 | Hard-coded emails/URLs | Config debt | contact.ts, email.ts |
| TD-16 | No CI for build/lint | Broken main risk | .github |
| TD-17 | Shared pages without detail routes | Product debt vs AGENTS | routes |
| TD-18 | Newsletter flag incomplete | False sense of disable | feature-flags + Footer |

## Gap registers (condensed)

### Functional gaps
Shared page detail; tags; authors; journeys; media upload; curated featured flag; live newsletter; TOC/print/dark; double opt-in; privacy/terms pages; public notebook pages.

### Architecture risks
Service-role + weak action auth; global Footer coupling; no migrations; health layer bypass.

### Security risks
See `12-security-review.md` (S-01–S-04 primary).

### Accessibility gaps
No browser audit; skip link missing; a11y linters off.

### Performance risks
Client search; ambient JS; unbounded lists.

### Testing gaps
Total absence.

### Documentation gaps
README; no runbook; blueprint huge vs code reality undocumented until this audit.

### Operational gaps
No CI; domain inconsistency; keepalive secret setup UNVERIFIED.
