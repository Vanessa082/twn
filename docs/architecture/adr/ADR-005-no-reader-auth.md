# ADR-005: No Reader Authentication in Phase 2

- **Status**: Accepted
- **Date**: 2026-07-24
- **Decision owners**: TWN Engineering (Vanessa)
- **Related blueprint volumes**: Volume 1 — Vision, Volume 7 — System Architecture

---

## Context

Reader authentication would allow TWN to offer personalized features: saved articles, reading history, member-only content, direct messaging, contributor profiles, and authenticated community submissions. These features are aligned with TWN's long-term vision.

However, building reader authentication also introduces:
- Significant infrastructure: account creation, password management, email verification, sessions
- Privacy obligations: GDPR/data minimisation, right to erasure, data portability
- Security responsibilities: protecting personal data, preventing account takeover
- UX complexity: onboarding flow, forgotten password, account settings

---

## Decision

**No reader authentication in Phase 2.**

All public-facing TWN features in Phase 2 — article reading, margin note submission, shared page submission, newsletter subscription, and search — operate without requiring readers to create accounts.

Community contributions (margin notes and shared pages) use anonymous submission with name fields. They are protected by rate limiting, honeypot fields, and duplicate detection.

The only authentication in Phase 2 is admin authentication via Clerk for the CMS.

---

## Alternatives Considered

**Clerk for readers too**: Would extend the existing Clerk setup to readers. However, Clerk pricing scales with monthly active users, and public reader volume cannot be predicted. Also introduces the full privacy and UX obligations noted above.

**Supabase Auth for readers**: Native to the existing stack. Feasible technically but requires the same design work as any reader auth system. Not prioritised for Phase 2.

**Anonymous sessions (fingerprinting)**: Provides some personalization without accounts. But creates privacy obligations and is unreliable across devices.

---

## Consequences

### Positive consequences
- No PII beyond newsletter email addresses is stored in Phase 2
- Privacy obligations remain minimal (newsletter email only)
- No account security surface for public users to attack
- Community submissions are genuinely anonymous — lower barrier to contribution

### Negative consequences
- No personalization for readers
- No ability to notify contributors when their content is approved
- Cannot prevent a single user from submitting many margin notes (mitigated by rate limiting and content deduplication)
- Cannot offer member-only content or subscriber-exclusive features in Phase 2

---

## Security and Privacy Implications
- No reader credentials to protect
- No reader session tokens to manage
- Newsletter email addresses are the only PII stored, held in the `subscribers` table under Newsletter module ownership

---

## Operational Implications
- Moderation of community content is the only human-involved quality gate
- Rate limiting and honeypot fields serve as the primary abuse prevention layer

---

## Migration Implications
Adding reader authentication in a future phase requires:
1. Choosing an identity provider for readers (or extending Clerk)
2. Adding reader session infrastructure
3. Updating Community module submission flows to optionally attach a reader identity
4. Defining consent, data retention, and deletion procedures

No existing Phase 2 code prevents this migration. The modular architecture keeps the reader auth surface isolated when it is introduced.

---

## Review Conditions

This decision should be reconsidered when:
- A specific Phase 3 or later feature explicitly requires reader identity (e.g., contributor profiles, bookmarks)
- The product needs to enforce per-reader rate limits more reliably than IP-based rate limiting
- Monetisation or member-only content requires authenticated readers
- Newsletter subscribers request self-service account management

---

## Supersedes / Superseded By
None.
