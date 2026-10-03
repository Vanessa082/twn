import { createAdminClient, createClient } from "@/lib/db/server";
import { pageRange, totalPagesFor } from "@/lib/pagination";
import type { PaginatedResult } from "@/types";
import type { RelatedCandidatePool, TagRepository } from "../domain/ports";
import type { Category, NoteCard, Tag } from "../domain/types";
import { type DatabaseNoteRow, toNoteCard } from "./map-note";
import { NOTES_TABLE, NOTE_CARD_COLUMNS, NOTE_TAGS_TABLE } from "./tables";

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
      .select(NOTE_CARD_COLUMNS, { count: "exact" })
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
      items: ((data ?? []) as DatabaseNoteRow[]).map(toNoteCard),
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

const SHARED_TAG_ROW_LIMIT = 500;
const CHAPTER_CANDIDATE_LIMIT = 12;

interface TagJoinRow {
  article_id: string;
  tag_id: string;
}

const EMPTY_POOL: RelatedCandidatePool = {
  tagNames: {},
  tagFrequency: {},
  publishedTotal: 0,
  candidates: [],
};

/**
 * Candidates for "You may also like": published notes sharing a tag with this
 * one, plus recent notes from the same chapter. Scoring happens in the domain.
 */
async function getRelatedCandidates(
  noteId: string,
  category: string
): Promise<RelatedCandidatePool> {
  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const [ownTagsResult, chapterResult, totalResult] = await Promise.all([
      supabase.from(NOTE_TAGS_TABLE).select("tag_id, tags(id, name)").eq("article_id", noteId),
      supabase
        .from(NOTES_TABLE)
        .select("id")
        .eq("category", category)
        .eq("status", "published")
        .lte("published_at", now)
        .neq("id", noteId)
        .order("published_at", { ascending: false })
        .limit(CHAPTER_CANDIDATE_LIMIT),
      supabase
        .from(NOTES_TABLE)
        .select("id", { count: "exact", head: true })
        .eq("status", "published")
        .lte("published_at", now),
    ]);

    const tagNames: Record<string, string> = {};
    for (const row of (ownTagsResult.data ?? []) as unknown as {
      tag_id: string;
      tags: { name: string } | null;
    }[]) {
      if (row.tags?.name) tagNames[row.tag_id] = row.tags.name;
    }
    const tagIds = Object.keys(tagNames);

    let sharedRows: TagJoinRow[] = [];
    if (tagIds.length > 0) {
      const { data } = await supabase
        .from(NOTE_TAGS_TABLE)
        .select("article_id, tag_id")
        .in("tag_id", tagIds)
        .limit(SHARED_TAG_ROW_LIMIT);
      sharedRows = (data ?? []) as TagJoinRow[];
    }

    const chapterIds = ((chapterResult.data ?? []) as { id: string }[]).map((row) => row.id);
    const candidateIds = [
      ...new Set([...sharedRows.map((row) => row.article_id), ...chapterIds]),
    ].filter((id) => id !== noteId);
    if (candidateIds.length === 0) {
      return { ...EMPTY_POOL, tagNames, publishedTotal: totalResult.count ?? 0 };
    }

    const { data: cards, error } = await supabase
      .from(NOTES_TABLE)
      .select(NOTE_CARD_COLUMNS)
      .in("id", candidateIds)
      .eq("status", "published")
      .lte("published_at", now);
    if (error) throw error;

    const notes = ((cards ?? []) as DatabaseNoteRow[]).map(toNoteCard);
    const published = new Set(notes.map((note) => note.id));
    published.add(noteId);

    const tagFrequency: Record<string, number> = {};
    const sharedByNote = new Map<string, string[]>();
    for (const row of sharedRows) {
      if (!published.has(row.article_id)) continue;
      tagFrequency[row.tag_id] = (tagFrequency[row.tag_id] ?? 0) + 1;
      if (row.article_id === noteId) continue;
      sharedByNote.set(row.article_id, [...(sharedByNote.get(row.article_id) ?? []), row.tag_id]);
    }

    return {
      tagNames,
      tagFrequency,
      publishedTotal: totalResult.count ?? published.size,
      candidates: notes.map((note) => ({
        note,
        sharedTagIds: sharedByNote.get(note.id) ?? [],
      })),
    };
  } catch {
    return EMPTY_POOL;
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

  findRelatedCandidates(noteId: string, category: string) {
    return getRelatedCandidates(noteId, category);
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
