# Editorial Module

## Purpose
Owns every **note** Vanessa writes in The Notebook: long-form pages, field notes,
tags, chapters, collections, and revision history.

A **Note** is a page of writing. The public URL is `/notebook/[slug]`. The live
Postgres table is still named `articles` (and join tables still say
`article_id`) because renaming columns in production is a data migration. The
repository maps those physical names to the domain name **Note**.

## Owned capabilities
- Create, edit, schedule, and publish notes
- Revision snapshots and restore
- Tags and chapters (categories)
- Collections (ordered reading paths)
- Field notes (short numbered observations)
- Cover-image SEO fields

## Owned tables (physical name → domain)

| Table | Aggregate | Domain name |
|---|---|---|
| `articles` | Note | A page of writing |
| `article_revisions` | Note | Snapshot log |
| `article_tags` | Note | Tag join |
| `collections` | Collection | Curated path of notes |
| `collection_articles` | Collection | Ordered join (`article_id` = note id) |
| `tags` | Tag | Labels |
| `categories` | Chapter | Seeded chapters |
| `field_notes` | Field note | Short observations |

## Public API
Import only from `@/modules/editorial`.

Commands: `createNoteAdmin`, `updateNoteAdmin`, `deleteNoteAdmin`,
`setNoteTagsAdmin`, `createCollectionAdmin`, `setCollectionNotesAdmin`,
field-note writes.

Queries: `getLatestNotes`, `getNoteBySlug`, `getPublishedNotesPage`,
`getRelatedNotes`, `getTagsForNote`, `getPublicCollections`,
`getPublishedFieldNotes`.

Older `*Article*` names are deprecated aliases so existing admin screens keep
compiling while they are renamed.

## Forbidden
- Do not import this module's `application/`, `domain/`, or `infrastructure/`
  from outside. Architecture tests fail the build if you do.
- Do not import `@/app` from this module.
- Search and Community talk to notes through this public API, never by querying
  `articles` themselves.
