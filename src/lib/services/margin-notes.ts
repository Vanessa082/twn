// ─────────────────────────────────────────────────────────────────────────────
// Margin Notes — Service Layer
// Handles short reader reflections (max 120 chars) in article margins/footers.
// ─────────────────────────────────────────────────────────────────────────────

import { createAdminClient, createClient } from "@/lib/db/server";
import type { MarginNote, ModerationStatus } from "@/types";

// ── Fallback Data ─────────────────────────────────────────────────────────────
export const FALLBACK_MARGIN_NOTES: MarginNote[] = [
  {
    id: "mn1",
    article_id: "default-article",
    author_name: "Amy",
    content: "This paragraph resonates so deeply. Confidence is built in the daily, quiet work.",
    status: "approved",
    display_order: 999,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "mn2",
    article_id: "default-article",
    author_name: "Jess",
    content:
      "The part about 'designing for scale' is exactly what we struggle with in early startups.",
    status: "approved",
    display_order: 999,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Public: Fetches all approved margin notes for a specific article.
 * Sorted by display_order ASC (pinned first), then submitted_at DESC.
 * Falls back to FALLBACK_MARGIN_NOTES if database connection fails.
 */
export async function getApprovedMarginNotesForArticle(articleId: string): Promise<MarginNote[]> {
  if (!articleId) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("margin_notes")
      .select("*")
      .eq("article_id", articleId)
      .eq("status", "approved")
      .order("display_order", { ascending: true })
      .order("submitted_at", { ascending: false });

    if (error) {
      console.warn("[getApprovedMarginNotesForArticle] DB error, using fallbacks:", error.message);
      // Remap fallbacks to the current article id so they show up
      return FALLBACK_MARGIN_NOTES.map((n) => ({ ...n, article_id: articleId }));
    }

    return data && data.length > 0
      ? (data as MarginNote[])
      : FALLBACK_MARGIN_NOTES.map((n) => ({ ...n, article_id: articleId }));
  } catch (error) {
    console.warn("[getApprovedMarginNotesForArticle] Service error, using fallbacks:", error);
    return FALLBACK_MARGIN_NOTES.map((n) => ({ ...n, article_id: articleId }));
  }
}

/**
 * Public: Submits a reader reflection (max 120 chars) for an article.
 * Always defaults status to 'pending'.
 */
export async function submitMarginNote(
  articleId: string,
  authorName: string,
  content: string
): Promise<MarginNote> {
  const trimmedAuthor = authorName.trim() || "Anonymous";
  const trimmedContent = content.trim();

  if (!articleId) {
    throw new Error("Article ID is required.");
  }
  if (!trimmedContent) {
    throw new Error("Reflection content cannot be empty.");
  }
  if (trimmedContent.length > 120) {
    throw new Error("Margin notes must be brief (maximum 120 characters).");
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("margin_notes")
      .insert({
        article_id: articleId,
        author_name: trimmedAuthor,
        content: trimmedContent,
        status: "pending",
        display_order: 999, // default unpinned
      })
      .select()
      .single();

    if (error) {
      console.error("[submitMarginNote] DB error:", error.message);
      throw new Error(error.message);
    }

    return data as MarginNote;
  } catch (error) {
    console.error("[submitMarginNote] Service error:", error);
    throw error;
  }
}

// ── Admin API ─────────────────────────────────────────────────────────────────

/**
 * Admin: Fetches all margin notes (active + inactive) bypassing RLS.
 * Includes joined article information where possible.
 */
export async function getAllMarginNotesAdmin(): Promise<
  (MarginNote & { article_title?: string })[]
> {
  try {
    const adminSupabase = createAdminClient();
    // Fetch margin notes and select article title
    const { data, error } = await adminSupabase
      .from("margin_notes")
      .select(`
        *,
        articles (
          title
        )
      `)
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("[getAllMarginNotesAdmin] DB error:", error.message);
      throw new Error(error.message);
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      article_id: row.article_id,
      author_name: row.author_name,
      content: row.content,
      status: row.status,
      display_order: row.display_order,
      submitted_at: row.submitted_at,
      published_at: row.published_at,
      updated_at: row.updated_at,
      article_title: row.articles?.title || "Unknown Article",
    }));
  } catch (error) {
    console.error("[getAllMarginNotesAdmin] Service error:", error);
    throw error;
  }
}

/**
 * Admin: Updates moderation status for a margin note.
 * If status is approved, published_at is set to the current timestamp.
 */
export async function updateMarginNoteStatusAdmin(
  id: string,
  status: ModerationStatus
): Promise<MarginNote> {
  if (!id) throw new Error("ID is required");

  try {
    const adminSupabase = createAdminClient();
    const updatePayload: Record<string, any> = { status };

    if (status === "approved") {
      updatePayload.published_at = new Date().toISOString();
    } else {
      updatePayload.published_at = null;
    }

    const { data, error } = await adminSupabase
      .from("margin_notes")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[updateMarginNoteStatusAdmin] DB error:", error.message);
      throw new Error(error.message);
    }

    return data as MarginNote;
  } catch (error) {
    console.error("[updateMarginNoteStatusAdmin] Service error:", error);
    throw error;
  }
}

/**
 * Admin: Pins/unpins a margin note by setting its display order.
 * Pinned is display_order = 0, default is 999.
 */
export async function updateMarginNotePinAdmin(id: string, pinned: boolean): Promise<MarginNote> {
  if (!id) throw new Error("ID is required");

  try {
    const adminSupabase = createAdminClient();
    const displayOrder = pinned ? 0 : 999;

    const { data, error } = await adminSupabase
      .from("margin_notes")
      .update({ display_order: displayOrder })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[updateMarginNotePinAdmin] DB error:", error.message);
      throw new Error(error.message);
    }

    return data as MarginNote;
  } catch (error) {
    console.error("[updateMarginNotePinAdmin] Service error:", error);
    throw error;
  }
}

/**
 * Admin: Deletes a margin note submission permanently.
 */
export async function deleteMarginNoteAdmin(id: string): Promise<boolean> {
  if (!id) throw new Error("ID is required");

  try {
    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase.from("margin_notes").delete().eq("id", id);

    if (error) {
      console.error("[deleteMarginNoteAdmin] DB error:", error.message);
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error("[deleteMarginNoteAdmin] Service error:", error);
    throw error;
  }
}
