import { createAdminClient, createClient } from "@/lib/db/server";
import { pageRange, totalPagesFor } from "@/lib/pagination";
import type { PaginatedResult } from "@/types";
import type { NoteRepository, NotesPageQuery, PublishedNoteRef } from "../domain/ports";
import type { Note } from "../domain/types";
import { FALLBACK_NOTES } from "./fallback-notes";
import { type DatabaseNoteRow, mapToNote } from "./map-note";
import { NOTES_TABLE } from "./tables";

export class SupabaseNoteRepository implements NoteRepository {
  async findLatestPublished(limit = 10): Promise<Note[]> {
    const safeLimit = Math.max(1, Math.min(limit, 100));
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from(NOTES_TABLE)
        .select("*")
        .eq("status", "published")
        .lte("published_at", new Date().toISOString())
        .order("published_at", { ascending: false })
        .limit(safeLimit);

      if (error) {
        console.warn("[NoteRepository] Database error, using local seed:", error.message);
        return FALLBACK_NOTES.slice(0, safeLimit);
      }
      return data ? (data as DatabaseNoteRow[]).map(mapToNote) : [];
    } catch (error) {
      console.warn("[NoteRepository] Service error, using local seed:", error);
      return FALLBACK_NOTES.slice(0, safeLimit);
    }
  }

  async findPublishedPage({
    page,
    pageSize,
    category,
  }: NotesPageQuery): Promise<PaginatedResult<Note>> {
    const size = Math.max(1, Math.min(pageSize, 48));
    const { from, to } = pageRange(page, size);
    const build = (items: Note[], total: number): PaginatedResult<Note> => ({
      items,
      total,
      page,
      pageSize: size,
      totalPages: totalPagesFor(total, size),
    });

    try {
      const supabase = await createClient();
      let query = supabase
        .from(NOTES_TABLE)
        .select("*", { count: "exact" })
        .eq("status", "published")
        .lte("published_at", new Date().toISOString());
      if (category) query = query.eq("category", category);
      const { data, error, count } = await query
        .order("published_at", { ascending: false })
        .range(from, to);

      if (error?.code === "PGRST103") return build([], count ?? 0);
      if (error) throw error;
      return build(((data ?? []) as DatabaseNoteRow[]).map(mapToNote), count ?? 0);
    } catch (error) {
      console.warn("[NoteRepository] Published page falling back to local seed:", error);
      const seed = category
        ? FALLBACK_NOTES.filter((note) => note.category === category)
        : FALLBACK_NOTES;
      return build(seed.slice(from, to + 1), seed.length);
    }
  }

  async findPublishedBySlug(slug: string): Promise<Note | null> {
    if (!slug || typeof slug !== "string") return null;
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from(NOTES_TABLE)
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .lte("published_at", new Date().toISOString())
        .maybeSingle();

      if (error) {
        console.warn("[NoteRepository] Database error, using local seed:", error.message);
        return FALLBACK_NOTES.find((note) => note.slug === slug) || null;
      }
      return data ? mapToNote(data as DatabaseNoteRow) : null;
    } catch (error) {
      console.warn("[NoteRepository] Service error, using local seed:", error);
      return FALLBACK_NOTES.find((note) => note.slug === slug) || null;
    }
  }

  async findPublishedById(id: string): Promise<Note | null> {
    if (!id) return null;
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from(NOTES_TABLE)
        .select("*")
        .eq("id", id)
        .eq("status", "published")
        .maybeSingle();
      if (error || !data) return null;
      return mapToNote(data as DatabaseNoteRow);
    } catch {
      return null;
    }
  }

  async findPublishedRefs(): Promise<PublishedNoteRef[]> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from(NOTES_TABLE)
        .select("slug, updated_at, published_at")
        .eq("status", "published")
        .lte("published_at", new Date().toISOString())
        .order("published_at", { ascending: false })
        .limit(5000);
      if (error) return [];
      return (data ?? []) as PublishedNoteRef[];
    } catch {
      return [];
    }
  }

  async toggleLike(slug: string, increment: boolean): Promise<number> {
    if (!slug || typeof slug !== "string") {
      throw new Error("Invalid note slug.");
    }
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from(NOTES_TABLE)
      .select("id, likes_count")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      throw new Error(`Note not found: ${error?.message || ""}`);
    }

    const newCount = Math.max(0, (data.likes_count || 0) + (increment ? 1 : -1));
    const { error: updateErr } = await adminSupabase
      .from(NOTES_TABLE)
      .update({ likes_count: newCount })
      .eq("id", data.id);

    if (updateErr) {
      throw new Error(`Failed to update like count: ${updateErr.message}`);
    }
    return newCount;
  }

  async responds(): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase.from(NOTES_TABLE).select("id").limit(1).maybeSingle();
    return !error;
  }
}
