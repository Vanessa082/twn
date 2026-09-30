# Notebook Module

## Purpose
Manages TWN's curated notebook of ideas, reflections, and technical thoughts. The Notebook is the personal editorial layer: shorter-form thinking that sits between articles and community content. Today's Page is owned by the Editorial article flow, not this module.

## Owned Capabilities
- Notebook entry creation and management
- Entry dating and active/inactive toggling
- Entry linking to source articles
- Priority-based entry ordering

## Owned Tables
| Table | Aggregate Root | Notes |
|---|---|---|
| `notebooks` | Notebook | Named notebook containers (default: "The Notebook") |
| `notebook_entries` | Notebook | Entries are entities within the Notebook aggregate |

## Aggregate Roots
- **Notebook**: The container for a collection of entries. Controls which entries are active and how they are displayed. The `notebook_entries` table rows are entities within this aggregate   they are not independent aggregate roots.

## Public Commands
- `createEntry(notebookId, input)` → creates a new notebook thought
- `updateEntry(id, input)` → updates thought content, date, or priority
- `deleteEntry(id)` → removes a thought permanently
- `toggleEntryActive(id, isActive)` → activates or deactivates a thought for display

## Public Queries
- `getAllActiveEntries()` → all active entries for notebook-aware search
- `getEntriesAdmin()` → full entry list for admin management (includes inactive)
- `getEntryAdmin(id)` → single entry for admin editing

## Published Contracts
- `NotebookSearchProvider`: exposes `searchEntries(query)` consumed by the Search module
- See `contracts/index.ts`

## Consumed Contracts
- `AuditLogPort` (Platform/Audit): records entry lifecycle events

## Routes
- `/admin/content/notebook` — admin notebook entry management

## Permissions
- Public read: only `is_active = true` entries visible
- Admin write: all operations require `canManageNotebookEntries()` authorization check

## Events
- `notebook_entry.created`
- `notebook_entry.updated`
- `notebook_entry.deleted`
- `notebook_entry.activated`
- `notebook_entry.deactivated`

## Forbidden Dependencies
- Must not import from `@/modules/editorial` internals
- Must not import from `@/modules/community`
- Must not contain direct Clerk or Supabase client imports in domain or application layers

## Known Limitations
- Only one active notebook exists ("The Notebook")   multi-notebook support is not implemented
- No per-entry analytics or reader engagement tracking
