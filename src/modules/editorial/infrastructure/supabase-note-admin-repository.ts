import { createAdminClient } from "@/lib/db/server";
import { generateSlug } from "@/lib/utils/slug";
import type { CreateNoteInput, Note, UpdateNoteInput } from "../domain/types";
import type { NoteAdminRepository } from "../domain/ports";
import { type DatabaseNoteRow, mapToNote } from "./map-note";
import { NOTES_TABLE } from "./tables";

export class SupabaseNoteAdminRepository implements NoteAdminRepository {
  async findAllAdmin(): Promise<Note[]> {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from(NOTES_TABLE)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ((data as DatabaseNoteRow[]) || []).map(mapToNote);
  }

  async findTitlesByIds(ids: string[]): Promise<Record<string, string>> {
    const unique = [...new Set(ids.filter(Boolean))];
    if (unique.length === 0) return {};
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from(NOTES_TABLE)
      .select("id, title")
      .in("id", unique);
    if (error) throw new Error(error.message);
    const titles: Record<string, string> = {};
    for (const row of (data ?? []) as { id: string; title: string }[]) {
      titles[row.id] = row.title;
    }
    return titles;
  }

  async findByIdAdmin(id: string): Promise<Note | null> {
    if (!id) return null;
    try {
      const adminSupabase = createAdminClient();
      const { data, error } = await adminSupabase
        .from(NOTES_TABLE)
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) return null;
      return data ? mapToNote(data as DatabaseNoteRow) : null;
    } catch {
      return null;
    }
  }

  async create(input: CreateNoteInput): Promise<Note> {
    if (!input.title || !input.content || !input.category) {
      throw new Error("Missing required note fields: title, content, category");
    }
    const adminSupabase = createAdminClient();
    const slug = input.slug || generateSlug(input.title);
    const payload = {
      title: input.title.trim(),
      slug,
      excerpt: input.excerpt?.trim() || "",
      content: input.content,
      cover_image: input.cover_image,
      category: input.category,
      status: input.status || "draft",
      published_at: input.status === "published" ? new Date().toISOString() : input.published_at,
      seo_title: input.seo_title || null,
      seo_description: input.seo_description || null,
      og_image: input.og_image || null,
      canonical_url: input.canonical_url || null,
    };
    const { data, error } = await adminSupabase.from(NOTES_TABLE).insert(payload).select().single();
    if (error) throw new Error(error.message);
    return mapToNote(data as DatabaseNoteRow);
  }

  async update(id: string, input: UpdateNoteInput): Promise<Note> {
    if (!id) throw new Error("Note ID is required for updates");
    const adminSupabase = createAdminClient();
    const updatePayload: Partial<CreateNoteInput> & { published_at?: string | null } = { ...input };

    if (input.title) {
      updatePayload.title = input.title.trim();
      if (!input.slug) updatePayload.slug = generateSlug(input.title);
    }
    if (input.status === "published" && !updatePayload.published_at) {
      updatePayload.published_at = new Date().toISOString();
    }

    const { data, error } = await adminSupabase
      .from(NOTES_TABLE)
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapToNote(data as DatabaseNoteRow);
  }

  async delete(id: string): Promise<boolean> {
    if (!id) throw new Error("Note ID is required for deletion");
    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase.from(NOTES_TABLE).delete().eq("id", id);
    if (error) throw new Error(error.message);
    return true;
  }
}
