# Search Module

## Purpose
Provides unified, multi-content search across all public TWN content types. The Search module coordinates queries across Editorial, Notebook, and Community contracts on the server, normalizes the results into a unified shape, and delivers them to the public search interface.

## Owned Capabilities
- Unified public content search
- Result normalization across content types
- Server-side content provider coordination
- Search result type classification

## Owned Tables
None. Search does not own any tables. It queries other modules through their published search contracts.

## Aggregate Roots
None. Search is a coordination layer, not a domain.

## Architecture
```text
SearchPage (RSC)
    ↓
searchPublicContent(query)
    ↓
┌──────────────────────────────────────────┐
│  SearchableContentProvider contract      │
├──────────────────┬───────────────────────┤
│ Editorial        │ Notebook              │
│ searchArticles() │ searchEntries()       │
├──────────────────┼───────────────────────┤
│ Community        │ Editorial             │
│ searchSharedPages│ searchCollections()   │
└──────────────────┴───────────────────────┘
    ↓
UnifiedSearchResult[]
    ↓
SearchClient (client component — filter, tabs, badges)
```

## Public Queries
- `searchPublicContent(query)` → fetches and normalizes results from all providers

## Published Contracts
- None. Search is a consumer, not a provider.
- See `contracts/index.ts`

## Consumed Contracts
- `ArticleSearchProvider` (Editorial)
- `CollectionSearchProvider` (Editorial)
- `NotebookSearchProvider` (Notebook)
- `SharedPageSearchProvider` (Community)

## Routes
- `/search` — public unified search page

## Permissions
- Public: no authentication required
- Admin: no admin search interface in Phase 2

## Events
None.

## Forbidden Dependencies
- Must not import directly from `@/modules/editorial/infrastructure`
- Must not import directly from `@/modules/community/infrastructure`
- Must not import directly from `@/modules/notebook/infrastructure`
- Must only call other modules through their published `contracts/index.ts`
- Must not own or access any database tables directly

## Known Limitations
- Search uses simple substring matching at the application layer — no full-text PostgreSQL search or external search index
- Client-side filter tabs provide fast UX but the entire corpus is fetched server-side on each search page load
- No search result ranking or relevance scoring
- No search analytics or query tracking
