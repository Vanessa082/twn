import { createAdminClient, createClient } from "@/lib/db/server";
import type { CollectionRepository } from "../domain/ports";
import type { SeriesRecord } from "../domain/series";
import type {
  Collection,
  CollectionItem,
  CollectionKind,
  CollectionWithNotes,
  CreateCollectionInput,
  SaveCollectionEntriesInput,
} from "../domain/types";
import { type DatabaseNoteRow, toNoteCard } from "./map-note";
import { COLLECTION_NOTES_TABLE, NOTES_TABLE, NOTE_CARD_COLUMNS } from "./tables";

const ENTRY_COLUMNS = `article_id, position, label, ${NOTES_TABLE}(${NOTE_CARD_COLUMNS})`;
const ONE_SERIES_CONSTRAINT = "collection_articles_one_series_per_note";
const MIGRATION_HINT =
  "Series need a database update. Run src/lib/db/migration_series.sql in the Supabase SQL Editor, then try again.";

interface EntryRow {
  article_id: string;
  position: number;
  label: string | null;
  articles: DatabaseNoteRow | null;
}

interface PostgrestLikeError {
  code?: string;
  message: string;
  details?: string | null;
}

function toCollection(row: Record<string, unknown>): Collection {
  return {
    ...(row as unknown as Collection),
    kind: (row.kind as CollectionKind | undefined) ?? "collection",
  };
}

function entryRows(data: unknown): EntryRow[] {
  return (data ?? []) as EntryRow[];
}

/** Entries whose note the caller cannot see (drafts under RLS) are dropped. */
function mapCollectionItems(rows: EntryRow[]): CollectionItem[] {
  return rows.flatMap((row) =>
    row.articles
      ? [
          {
            note_id: row.article_id,
            position: row.position,
            label: row.label,
            note: toNoteCard(row.articles),
          },
        ]
      : []
  );
}

function isMissingMigration(error: PostgrestLikeError): boolean {
  return (
    error.code === "PGRST202" ||
    error.code === "42703" ||
    /save_collection_entries|column .*(kind|label)/.test(error.message)
  );
}

/** Turns the one-series-per-note violation into a message naming the note and its series. */
async function explainSaveError(error: PostgrestLikeError, collectionId: string): Promise<Error> {
  if (isMissingMigration(error)) return new Error(MIGRATION_HINT);
  if (error.code !== "23505" || !error.message.includes(ONE_SERIES_CONSTRAINT)) {
    return new Error(error.message);
  }

  const noteId = error.details?.match(/\(article_id\)=\(([0-9a-f-]{36})\)/i)?.[1];
  if (!noteId) return new Error("A note can only belong to one series.");

  const adminSupabase = createAdminClient();
  const { data } = await adminSupabase
    .from(COLLECTION_NOTES_TABLE)
    .select(`collections(title), ${NOTES_TABLE}(title)`)
    .eq("article_id", noteId)
    .eq("collection_kind", "series")
    .neq("collection_id", collectionId)
    .maybeSingle();
  const row = data as unknown as {
    collections: { title: string } | null;
    articles: { title: string } | null;
  } | null;

  const note = row?.articles?.title ? `"${row.articles.title}"` : "One of these notes";
  const series = row?.collections?.title ? `"${row.collections.title}"` : "another series";
  return new Error(
    `${note} is already part of ${series}. A note can only belong to one series, so remove it there first.`
  );
}

function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ── Public Reads ──────────────────────────────────────────────────────────────

/** Fetch all published collections for public index. */
async function getPublicCollections(): Promise<Collection[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toCollection);
  } catch {
    return [];
  }
}

/** Fetch a single published collection with its ordered notes by slug. */
async function getCollectionBySlug(slug: string): Promise<CollectionWithNotes | null> {
  try {
    const supabase = await createClient();

    const { data: collection, error: colError } = await supabase
      .from("collections")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (colError || !collection) return null;

    const { data: items, error: itemError } = await supabase
      .from(COLLECTION_NOTES_TABLE)
      .select(ENTRY_COLUMNS)
      .eq("collection_id", collection.id)
      .order("position", { ascending: true });

    if (itemError) throw itemError;

    return {
      ...toCollection(collection),
      items: mapCollectionItems(entryRows(items)),
    };
  } catch {
    return null;
  }
}

/** The published series a note belongs to, with every entry in order. */
async function getSeriesForNote(noteId: string): Promise<SeriesRecord | null> {
  try {
    const supabase = await createClient();
    const { data: membership, error } = await supabase
      .from(COLLECTION_NOTES_TABLE)
      .select("collection_id, collections(title, slug, is_published)")
      .eq("article_id", noteId)
      .eq("collection_kind", "series")
      .maybeSingle();
    if (error || !membership) return null;

    const series = (
      membership as unknown as {
        collections: { title: string; slug: string; is_published: boolean } | null;
      }
    ).collections;
    if (!series?.is_published) return null;

    const { data: rows, error: rowsError } = await supabase
      .from(COLLECTION_NOTES_TABLE)
      .select(ENTRY_COLUMNS)
      .eq("collection_id", membership.collection_id)
      .order("position", { ascending: true });
    if (rowsError) return null;

    const now = Date.now();
    return {
      title: series.title,
      slug: series.slug,
      entries: entryRows(rows).map((row) => {
        const note = row.articles ? toNoteCard(row.articles) : null;
        const visible =
          note?.status === "published" &&
          (!note.published_at || Date.parse(note.published_at) <= now);
        return { noteId: row.article_id, label: row.label, note: visible ? note : null };
      }),
    };
  } catch {
    return null;
  }
}

// ── Admin Reads ───────────────────────────────────────────────────────────────

/** Fetch all collections (published and drafts) for admin list. */
async function getAllCollectionsAdmin(): Promise<Collection[]> {
  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("collections")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toCollection);
  } catch {
    return [];
  }
}

/** Fetch collection by ID for admin editor. */
async function getCollectionByIdAdmin(id: string): Promise<CollectionWithNotes | null> {
  try {
    const adminSupabase = createAdminClient();
    const { data: collection, error } = await adminSupabase
      .from("collections")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !collection) return null;

    const { data: items, error: itemError } = await adminSupabase
      .from(COLLECTION_NOTES_TABLE)
      .select(ENTRY_COLUMNS)
      .eq("collection_id", id)
      .order("position", { ascending: true });
    if (itemError) throw itemError;

    return {
      ...toCollection(collection),
      items: mapCollectionItems(entryRows(items)),
    };
  } catch {
    return null;
  }
}

// ── Admin Mutations ───────────────────────────────────────────────────────────

async function createCollectionAdmin(input: CreateCollectionInput): Promise<Collection> {
  const adminSupabase = createAdminClient();
  const slug = input.slug?.trim() || slugify(input.title);

  const { data, error } = await adminSupabase
    .from("collections")
    .insert({
      title: input.title.trim(),
      slug,
      description: input.description?.trim() || null,
      cover_image: input.cover_image?.trim() || null,
      is_published: input.is_published ?? false,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toCollection(data);
}

async function updateCollectionAdmin(
  id: string,
  input: Partial<CreateCollectionInput>
): Promise<Collection> {
  const adminSupabase = createAdminClient();
  // biome-ignore lint/suspicious/noExplicitAny: Dynamic payload builder
  const payload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) payload.title = input.title.trim();
  if (input.slug !== undefined) payload.slug = input.slug.trim() || slugify(input.title || "");
  if (input.description !== undefined) payload.description = input.description?.trim() || null;
  if (input.cover_image !== undefined) payload.cover_image = input.cover_image?.trim() || null;
  if (input.is_published !== undefined) payload.is_published = input.is_published;

  const { data, error } = await adminSupabase
    .from("collections")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toCollection(data);
}

async function deleteCollectionAdmin(id: string): Promise<void> {
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.from("collections").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Replace a collection's kind and ordered entries atomically (see migration_series.sql). */
async function saveCollectionEntriesAdmin(
  collectionId: string,
  { kind, entries }: SaveCollectionEntriesInput
): Promise<void> {
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.rpc("save_collection_entries", {
    p_collection_id: collectionId,
    p_kind: kind,
    p_entries: entries.map((entry) => ({ note_id: entry.note_id, label: entry.label })),
  });
  if (error) throw await explainSaveError(error, collectionId);
}

export class SupabaseCollectionRepository implements CollectionRepository {
  findAllPublished() {
    return getPublicCollections();
  }

  findPublishedBySlug(slug: string) {
    return getCollectionBySlug(slug);
  }

  findAllAdmin() {
    return getAllCollectionsAdmin();
  }

  findByIdAdmin(id: string) {
    return getCollectionByIdAdmin(id);
  }

  create(input: CreateCollectionInput) {
    return createCollectionAdmin(input);
  }

  update(id: string, input: Partial<CreateCollectionInput>) {
    return updateCollectionAdmin(id, input);
  }

  delete(id: string) {
    return deleteCollectionAdmin(id);
  }

  saveEntries(collectionId: string, input: SaveCollectionEntriesInput) {
    return saveCollectionEntriesAdmin(collectionId, input);
  }

  findSeriesForNote(noteId: string) {
    return getSeriesForNote(noteId);
  }
}
