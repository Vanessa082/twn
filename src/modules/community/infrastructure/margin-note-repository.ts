import { createAdminClient, createClient } from "@/lib/db/server";
import type { MarginNoteRepository } from "../domain/ports";
import type { MarginNote, ModerationStatus } from "../domain/types";

export class SupabaseMarginNoteRepository implements MarginNoteRepository {
  async findApprovedForNote(noteId: string): Promise<MarginNote[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("margin_notes")
      .select("*")
      .eq("article_id", noteId)
      .eq("status", "approved")
      .order("display_order", { ascending: true })
      .order("submitted_at", { ascending: false });

    if (error) {
      console.warn("[MarginNoteRepository] findApprovedForNote error:", error.message);
      return [];
    }
    return (data as MarginNote[]) ?? [];
  }

  async insert(noteId: string, authorName: string, content: string): Promise<MarginNote> {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("margin_notes")
      .insert({
        article_id: noteId,
        author_name: authorName,
        content,
        status: "approved",
        display_order: 999,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as MarginNote;
  }

  async findAllAdmin(): Promise<MarginNote[]> {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("margin_notes")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data as MarginNote[]) ?? [];
  }

  async updateStatus(id: string, status: ModerationStatus): Promise<MarginNote> {
    const adminSupabase = createAdminClient();
    const payload: Record<string, string | null> = { status };
    payload.published_at = status === "approved" ? new Date().toISOString() : null;

    const { data, error } = await adminSupabase
      .from("margin_notes")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as MarginNote;
  }

  async updatePin(id: string, pinned: boolean): Promise<MarginNote> {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("margin_notes")
      .update({ display_order: pinned ? 0 : 999 })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as MarginNote;
  }

  async delete(id: string): Promise<boolean> {
    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase.from("margin_notes").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return true;
  }
}
