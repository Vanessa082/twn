# Editorial Module

## Purpose
Manages all authored content produced by TWN's editorial team. This module is responsible for the complete lifecycle of Articles, Collections, Tags, and Categories — from creation through scheduling, publication, and revision history.

## Owned Capabilities
- Article creation, editing, scheduling, and publication
- Article revision history and one-click restore
- Tag creation and article tagging
- Collection creation and article curation
- Category taxonomy (seeded, admin-managed)
- Article preview before publication
- SEO metadata management

## Owned Tables
| Table | Aggregate Root | Notes |
|---|---|---|
| `articles` | Article | Full lifecycle — draft / scheduled / published |
| `article_revisions` | Article | Append-only snapshot log |
| `article_tags` | Article | Join table for many-to-many tag relationship |
| `collections` | Collection | Curated editorial series |
| `collection_articles` | Collection | Ordered join table for articles within a collection |
| `tags` | Tag | Reusable content taxonomy labels |
| `categories` | Category | Fixed seeded categories |

## Aggregate Roots
- **Article**: An authored piece of content. Controls its own revisions and tag relationships.
- **Collection**: A curated sequence of Articles.
- **Tag**: A reusable content label attached to Articles.
- **Category**: A broad content category. Seeded and rarely changed.

## Public Commands
- `createArticle(input)` → creates a new draft article
- `updateArticle(id, input)` → updates article fields and saves a revision
- `publishArticle(id)` → sets status to published and sets published_at
- `deleteArticle(id)` → removes article and all associated revisions/tags
- `createTag(name)` → creates a new tag
- `deleteTag(id)` → removes a tag
- `setArticleTags(articleId, tagIds)` → replaces article tag relationships
- `createCollection(input)` → creates a new collection
- `updateCollection(id, input)` → updates collection metadata
- `deleteCollection(id)` → removes a collection
- `setCollectionArticles(collectionId, articleIds)` → replaces collection article order
- `restoreRevision(revisionId)` → restores article to a past revision snapshot

## Public Queries
- `getPublishedArticles()` → all publicly visible articles
- `getArticleBySlug(slug)` → single published article for public display
- `getArticleAdmin(id)` → full article for admin editing (includes draft)
- `getRelatedArticles(articleId)` → tag and category-based related articles
- `getRevisions(articleId)` → revision list for admin review
- `getAllTags()` → full tag list
- `getTagBySlug(slug)` → tag with filtered articles
- `getPublicCollections()` → published collections for public display
- `getCollectionBySlug(slug)` → single published collection

## Published Contracts
- `ArticleSearchProvider`: exposes `searchArticles(query)` consumed by the Search module
- See `contracts/index.ts`

## Consumed Contracts
- `AuditLogPort` (Platform/Audit): records article lifecycle events
- `MediaUploadPort` (Media): Cloudinary image upload for cover images

## Routes
- `/articles` — public article listing
- `/articles/[slug]` — public article detail
- `/topics/[slug]` — public tag-filtered article listing
- `/collections` — public collection listing
- `/collections/[slug]` — public collection detail
- `/admin/articles` — admin article management
- `/admin/articles/[id]` — admin article editor
- `/admin/articles/[id]/preview` — admin article preview
- `/admin/tags` — admin tag management
- `/admin/collections` — admin collection management

## Permissions
- Public read: published articles, published collections, tags, categories
- Admin write: all operations require `canManageArticles()` authorization check

## Events
- `article.created`
- `article.published`
- `article.updated`
- `article.deleted`
- `article.restored`
- `tag.created`
- `tag.deleted`
- `collection.created`
- `collection.updated`
- `collection.deleted`

## Forbidden Dependencies
- Must not import from `@/modules/community`
- Must not import from `@/modules/notebook`
- Must not import from `@/modules/search` (Search consumes Editorial contracts, not the reverse)
- Must not contain Clerk imports (identity is resolved via `requireAdmin`)

## Known Limitations
- Article authorship is not tracked per-user (all articles belong to TWN's editorial identity)
- Category list is seeded and cannot be created via the CMS without a database migration
- Search uses client-side filtering over a pre-fetched index — no full-text PostgreSQL search yet
