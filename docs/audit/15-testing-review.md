# 15 — Testing Review

## Current state — VERIFIED

| Item | Status |
|------|--------|
| Unit tests | None |
| Integration tests | None |
| E2E tests | None |
| `package.json` test script | Absent |
| CI test job | Absent |
| Coverage tooling | Absent |
| Informal | `scratch-test.mjs` only |

## Gaps vs project rules

Project rules ask for happy path + edge case tests per feature. **None of the service/actions layers have tests.**

## Highest-value tests to add (recommendation — not implemented)

1. Service pure validation: shared page word count, margin note length, email validation  
2. Article public query filters (published only)  
3. Middleware admin matcher behavior (unit)  
4. Playwright smoke: home, article, leave-a-page, margin note, admin login  

## Label

Testing posture: **CRITICAL GAP** for a production editorial product.
