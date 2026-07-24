# Newsletter Module

## Purpose
Manages newsletter subscriber collection and consent tracking. Email delivery is intentionally disabled in Phase 2 because TWN does not yet have a verified custom sending domain. The module defines the full contract for future email delivery without coupling to a specific sending provider.

## Owned Capabilities
- Email address collection and validation
- Duplicate subscriber detection
- Subscriber administration (list, remove)
- Consent metadata tracking
- Email delivery port definition (currently disabled)

## Owned Tables
| Table | Aggregate Root | Notes |
|---|---|---|
| `subscribers` | Subscriber | Newsletter email signups with uniqueness constraint |

## Aggregate Roots
- **Subscriber**: A validated email address consent record. Immutable after creation except for unsubscribe.

## Public Commands
- `subscribeToNewsletter(email)` → validates and stores a new subscriber
- `removeSubscriber(email, actorId)` → removes a subscriber record (admin action)

## Public Queries
- `listSubscribers()` → full subscriber list for admin review (admin only)
- `subscriberExists(email)` → checks for existing subscription

## Published Contracts
- `EmailDeliveryPort`: interface defining send operations — currently implemented by `DisabledEmailAdapter`
- See `contracts/index.ts`

## Consumed Contracts
- `SubmissionProtectionPort` (Security): rate limiting and duplicate prevention on public subscribe

## Routes
- `/admin/subscribers` — admin subscriber list and management

## Permissions
- Public insert: anyone may subscribe (subject to rate limiting)
- Admin read: subscriber list requires `canManageSubscribers()` authorization
- Admin delete: subscriber removal requires `canManageSubscribers()` authorization

## Events
- `newsletter.subscribed`
- `newsletter.unsubscribed` (planned)

## Forbidden Dependencies
- Must not import from `@/modules/editorial`
- Must not import from `@/modules/community`
- Must never call Resend directly from application layer — always through `EmailDeliveryPort`

## Known Limitations
- **Email delivery is disabled.** A `DisabledEmailAdapter` is the active implementation. No confirmation emails, no campaign sends, and no welcome messages are delivered until a verified sending domain is configured.
- No unsubscribe token or self-service unsubscribe flow is implemented
- No double opt-in confirmation flow
- Subscriber list export is not implemented

## When to Re-enable
Email delivery can be re-enabled by:
1. Verifying a custom domain in Resend
2. Implementing `ResendEmailAdapter` that satisfies `EmailDeliveryPort`
3. Replacing `DisabledEmailAdapter` with `ResendEmailAdapter` in the infrastructure layer
