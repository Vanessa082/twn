import { createAdminClient, createClient } from "@/lib/db/server";
import { pageRange, totalPagesFor } from "@/lib/pagination";
import type { PaginatedResult } from "@/types";
import type { TagRepository } from "../domain/ports";
import type { Category, NoteCard, Tag } from "../domain/types";
import { NOTES_TABLE, NOTE_TAGS_TABLE } from "./tables";

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ── Public reads ──────────────────────────────────────────────────────────────

/** Fetch all tags (for autocomplete / admin list). */
async function getAllTags(): Promise<Tag[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return data as Tag[];
  } catch {
    return [];
  }
}

/** Fetch a single tag by slug. */
async function getTagBySlug(slug: string): Promise<Tag | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("tags").select("*").eq("slug", slug).single();
    if (error) return null;
    return data as Tag;
  } catch {
    return null;
  }
}

/** Fetch tags attached to a single note. */
async function getTagsForNote(noteId: string): Promise<Tag[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(NOTE_TAGS_TABLE)
      .select("tags(*)")
      .eq("article_id", noteId);
    if (error) throw error;
    // biome-ignore lint/suspicious/noExplicitAny: Supabase join output typing
    return (data?.map((row: any) => row.tags).filter(Boolean) ?? []) as Tag[];
  } catch {
    return [];
  }
}


/** One page of published notes filed under a tag, newest first. */
async function getNotesByTagPage(
  tagSlug: string,
  { page, pageSize }: { page: number; pageSize: number }
): Promise<PaginatedResult<NoteCard>> {
  const size = Math.max(1, Math.min(pageSize, 48));
  const empty: PaginatedResult<NoteCard> = {
    items: [],
    total: 0,
    page,
    pageSize: size,
    totalPages: 1,
  };

  try {
    const supabase = await createClient();
    const { data: tag } = await supabase.from("tags").select("id").eq("slug", tagSlug).single();
    if (!tag) return empty;

    const { data: joins, error: joinError } = await supabase
      .from(NOTE_TAGS_TABLE)
      .select("article_id")
      .eq("tag_id", tag.id)
      .limit(1000);
    if (joinError || !joins?.length) return empty;

    const { from, to } = pageRange(page, size);
    const { data, error, count } = await supabase
      .from(NOTES_TABLE)
      .select(
        "id, title, slug, excerpt, cover_image, category, status, published_at, created_at, updated_at, reading_time, likes_count, seo_title, seo_description, og_image, canonical_url",
        { count: "exact" }
      )
      .in(
        "id",
        joins.map((row: { article_id: string }) => row.article_id)
      )
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .range(from, to);

    const total = count ?? 0;
    if (error && error.code !== "PGRST103") throw error;
    return {
      items: (data ?? []) as NoteCard[],
      total,
      page,
      pageSize: size,
      totalPages: totalPagesFor(total, size),
    };
  } catch {
    return empty;
  }
}

// ── Related notes ──────────────────────────────────────────────────────────

/** Fetch related published notes for a given note, by shared tags then category fallback. */
async function getRelatedNotes(
  noteId: string,
  category: string,
  limit = 3
): Promise<NoteCard[]> {
  try {
    const supabase = await createClient();

    // 1. Get this note's tag IDs
    const { data: tagRows } = await supabase
      .from(NOTE_TAGS_TABLE)
      .select("tag_id")
      .eq("article_id", noteId);

    // biome-ignore lint/suspicious/noExplicitAny: Supabase return typing
    const tagIds = tagRows?.map((r: any) => r.tag_id) ?? [];

    let relatedIds: string[] = [];

    if (tagIds.length > 0) {
      // 2. Find other notes that share any tag
      const { data: sharedTagNotes } = await supabase
        .from(NOTE_TAGS_TABLE)
        .select("article_id")
        .in("tag_id", tagIds)
        .neq("article_id", noteId)
        .limit(limit * 3); // over-fetch so we can de-duplicate

      // biome-ignore lint/suspicious/noExplicitAny: Supabase return typing
      const mappedIds = sharedTagNotes?.map((r: any) => r.article_id as string) ?? [];
      relatedIds = Array.from(new Set(mappedIds)).slice(0, limit);
    }

    // 3. Fallback: fill remaining slots from same category
    const needed = limit - relatedIds.length;
    if (needed > 0) {
      const { data: chapterNotes } = await supabase
        .from(NOTES_TABLE)
        .select("id")
        .eq("category", category)
        .eq("status", "published")
        .neq("id", noteId)
        .not("id", "in", `(${relatedIds.join(",") || "00000000-0000-0000-0000-000000000000"})`)
        .limit(needed);

      // biome-ignore lint/suspicious/noExplicitAny: Supabase return typing
      const catIds = chapterNotes?.map((a: any) => a.id as string) ?? [];
      relatedIds = [...relatedIds, ...catIds];
    }

    if (relatedIds.length === 0) return [];

    const { data: notes } = await supabase
      .from(NOTES_TABLE)
      .select(
        "id, title, slug, excerpt, cover_image, category, status, published_at, created_at, updated_at, reading_time, likes_count, seo_title, seo_description, og_image, canonical_url"
      )
      .in("id", relatedIds)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);

    return (notes ?? []) as NoteCard[];
  } catch {
    return [];
  }
}


// ── Admin mutations ───────────────────────────────────────────────────────────

/** Create a new tag (auto-generates slug). */
async function createTagAdmin(name: string): Promise<Tag> {
  const adminSupabase = createAdminClient();
  const slug = slugify(name);
  const { data, error } = await adminSupabase
    .from("tags")
    .insert({ name: name.trim(), slug })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Tag;
}

/** Delete a tag permanently. */
async function deleteTagAdmin(id: string): Promise<void> {
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.from("tags").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Replace all tags on a note with the given tag IDs. */
async function setNoteTagsAdmin(noteId: string, tagIds: string[]): Promise<void> {
  const adminSupabase = createAdminClient();

  const { error: deleteError } = await adminSupabase
    .from(NOTE_TAGS_TABLE)
    .delete()
    .eq("article_id", noteId);
  if (deleteError) throw new Error(deleteError.message);

  if (tagIds.length === 0) return;

  const { error: insertError } = await adminSupabase
    .from(NOTE_TAGS_TABLE)
    .insert(tagIds.map((tag_id) => ({ article_id: noteId, tag_id })));
  if (insertError) throw new Error(insertError.message);
}


// ── Categories ────────────────────────────────────────────────────────────────

/**
 * Fetch all editorial categories in their canonical display order.
 * Categories are seeded and stable: technology, leadership, learning,
 * community, reflections. Falls back to the seeded values if the DB is unreachable.
 */
async function getCategories(): Promise<Category[]> {
  const ORDER = ["technology", "leadership", "learning", "community", "reflections"];
  const FALLBACK: Category[] = [
    { id: "1", name: "Technology", slug: "technology" },
    { id: "2", name: "Leadership", slug: "leadership" },
    { id: "3", name: "Learning", slug: "learning" },
    { id: "4", name: "Community", slug: "community" },
    { id: "5", name: "Personal Reflections", slug: "reflections" },
  ];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("categories").select("id, name, slug");
    if (error || !data || data.length === 0) return FALLBACK;
    return (data as Category[]).sort((a, b) => ORDER.indexOf(a.slug) - ORDER.indexOf(b.slug));
  } catch {
    return FALLBACK;
  }
}

export class SupabaseTagRepository implements TagRepository {
  findAll() {
    return getAllTags();
  }

  findBySlug(slug: string) {
    return getTagBySlug(slug);
  }

  findForNote(noteId: string) {
    return getTagsForNote(noteId);
  }

  findNotesByTagPage(tagSlug: string, query: { page: number; pageSize: number }) {
    return getNotesByTagPage(tagSlug, query);
  }

  findRelatedNotes(noteId: string, category: string, limit = 3) {
    return getRelatedNotes(noteId, category, limit);
  }

  create(name: string) {
    return createTagAdmin(name);
  }

  delete(id: string) {
    return deleteTagAdmin(id);
  }

  setNoteTags(noteId: string, tagIds: string[]) {
    return setNoteTagsAdmin(noteId, tagIds);
  }

  findCategories() {
    return getCategories();
  }
}
