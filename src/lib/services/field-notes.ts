import { createAdminClient, createClient } from "@/lib/db/server";
import type { FieldNote, FieldNoteInput } from "@/types/cms";

export type { FieldNote, FieldNoteInput } from "@/types/cms";

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Published field notes, pinned order first, then newest. Returns [] (never a
 * fallback) so the homepage section disappears when there is nothing real to show.
 */
export async function getPublishedFieldNotes(limit = 3): Promise<FieldNote[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("field_notes")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .order("published_at", { ascending: false })
      .limit(limit);
    if (error) {
      console.warn("[getPublishedFieldNotes] DB error:", error.message);
      return [];
    }
    return (data ?? []) as FieldNote[];
  } catch {
    return [];
  }
}

// ── Admin API ─────────────────────────────────────────────────────────────────

export interface FieldNotesAdminResult {
  notes: FieldNote[];
  /** False when the field_notes table has not been created yet. */
  tableReady: boolean;
}

export async function getAllFieldNotesAdmin(): Promise<FieldNotesAdminResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("field_notes")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return { notes: [], tableReady: false };
  return { notes: (data ?? []) as FieldNote[], tableReady: true };
}

export async function createFieldNote(input: FieldNoteInput): Promise<FieldNote> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("field_notes")
    .insert({ ...input, published_at: input.is_published ? new Date().toISOString() : null })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as FieldNote;
}

export async function updateFieldNote(
  id: string,
  input: Partial<FieldNoteInput>
): Promise<FieldNote> {
  const supabase = createAdminClient();
  const payload: Partial<FieldNoteInput> & { published_at?: string | null } = { ...input };

  if (input.is_published === false) {
    payload.published_at = null;
  } else if (input.is_published === true) {
    const { data: current } = await supabase
      .from("field_notes")
      .select("published_at")
      .eq("id", id)
      .maybeSingle();
    if (!current?.published_at) payload.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("field_notes")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as FieldNote;
}

export async function deleteFieldNote(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("field_notes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
