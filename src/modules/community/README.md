# Community Module

## Purpose
Manages reader-generated contributions to TWN. Community members can submit short reflections (Shared Pages) and annotate articles with brief margin notes. All community content passes through a moderation workflow before becoming publicly visible.

## Owned Capabilities
- Shared Page submission and validation
- Margin Note submission and validation
- Moderation queue management (approve / reject / delete)
- Margin note pinning and display ordering
- Bot and duplicate submission protection
- Community content public display

## Owned Tables
| Table | Aggregate Root | Notes |
|---|---|---|
| `shared_pages` | Shared Page | Visitor-submitted reflections (10–300 words) |
| `margin_notes` | Margin Note | Short reader comments on articles (max 120 chars) |

## Aggregate Roots
- **Shared Page**: A visitor-submitted reflection requiring moderation before publication.
- **Margin Note**: A short reader annotation attached to a specific article, requiring moderation.

## Public Commands
- `submitSharedPage(input)` → validates and stores a new visitor submission
- `approveSharedPage(id, actorId)` → transitions status to approved, sets published_at
- `rejectSharedPage(id, actorId)` → transitions status to rejected
- `deleteSharedPage(id, actorId)` → removes the submission entirely
- `submitMarginNote(articleId, input)` → validates and stores a new margin note
- `approveMarginNote(id, actorId)` → transitions status to approved
- `rejectMarginNote(id, actorId)` → transitions status to rejected
- `deleteMarginNote(id, actorId)` → removes the margin note
- `pinMarginNote(id, pinned)` → toggles pin status for prominent display

## Public Queries
- `getApprovedSharedPages()` → all approved community reflections for public display
- `getPendingSharedPages()` → pending queue for admin moderation
- `getApprovedMarginNotes(articleId)` → approved notes for a specific article
- `getPendingMarginNotes()` → pending notes queue for admin moderation

## Published Contracts
- `SharedPageSearchProvider`: exposes `searchSharedPages(query)` consumed by the Search module
- See `contracts/index.ts`

## Consumed Contracts
- `AuditLogPort` (Platform/Audit): records moderation actions
- `SubmissionProtectionPort` (Security): rate limiting, honeypot, and duplicate detection

## Routes
- `/community` — public community reflections page
- `/community/[slug]` — individual shared page detail
- `/admin/community` — admin shared pages moderation queue
- `/admin/community/margin-notes` — admin margin notes moderation queue

## Permissions
- Public insert: anyone may submit a Shared Page or Margin Note (subject to submission protection)
- Public read: only `status = 'approved'` entries visible
- Admin write: approve / reject / delete requires `canModerateSharedPages()` or `canModerateMarginNotes()`

## Events
- `shared_page.submitted`
- `shared_page.approved`
- `shared_page.rejected`
- `shared_page.deleted`
- `margin_note.submitted`
- `margin_note.approved`
- `margin_note.rejected`
- `margin_note.deleted`
- `margin_note.pinned`

## Forbidden Dependencies
- Must not import from `@/modules/editorial` internals
- Must not import from `@/modules/notebook`
- Must not contain direct Cloudinary or Resend calls
- Must not bypass submission protection on public write paths

## Known Limitations
- Anonymous submission only — no authenticated community member accounts yet
- No self-service appeal flow for rejected submissions (admin must be contacted directly)
- No notification system for contributors when their content is approved
