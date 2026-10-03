/**
 * Persistence names for the Editorial module.
 *
 * Domain language is Note. The live Postgres tables were created as `articles`
 * and are referenced by foreign keys (margin_notes, notebook_entries, collections).
 * Renaming those tables is a production migration; repositories map the names.
 */
export const NOTES_TABLE = "articles";
export const NOTE_TAGS_TABLE = "article_tags";
export const NOTE_REVISIONS_TABLE = "article_revisions";
export const COLLECTION_NOTES_TABLE = "collection_articles";

/**
 * Columns needed to build a NoteCard. Reading time is not stored, so the body
 * is read to compute it and then dropped by `toNoteCard`.
 */
export const NOTE_CARD_COLUMNS =
  "id, title, slug, excerpt, content, cover_image, category, status, published_at, created_at, updated_at, likes_count, seo_title, seo_description, og_image, canonical_url";
