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
