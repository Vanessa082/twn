// ─────────────────────────────────────────────────────────────────────────────
// Shared Pages — Service Layer
// Handles visitor submissions and admin moderation of community-submitted thoughts.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient, createAdminClient } from "@/lib/db/server";
import type { SharedPage, ModerationStatus } from "@/types";

// ── Fallback Data ─────────────────────────────────────────────────────────────
export const FALLBACK_SHARED_PAGES: SharedPage[] = [
  {
    id: "fp1",
    author_name: "Amina",
    title: "On the Joy of First Compiles",
    content: "The first time I saw my code run without errors, I felt like a wizard. Since then, I've realized that the real magic is in the debugging, the struggle, and the community that catches you when you fall.",
    word_count: 36,
    status: "approved",
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fp2",
    author_name: "Elena",
    title: "Transitioning at Thirty",
    content: "Transitioning to technology at thirty was terrifying. My notebooks are filled with terminology I didn't know last year, but today, I read my old notes and realized how far I've come. Never count yourself out.",
    word_count: 35,
    status: "approved",
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Public: Fetches all approved shared pages.
 * Falls back to FALLBACK_SHARED_PAGES if DB is unreachable.
 */
export async function getApprovedSharedPages(): Promise<SharedPage[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("shared_pages")
      .select("*")
      .eq("status", "approved")
      .order("published_at", { ascending: false });

    if (error) {
      console.warn("[getApprovedSharedPages] DB error, using fallbacks:", error.message);
      return FALLBACK_SHARED_PAGES;
    }

    return data && data.length > 0 ? (data as SharedPage[]) : FALLBACK_SHARED_PAGES;
  } catch (error) {
    console.warn("[getApprovedSharedPages] Service error, using fallbacks:", error);
    return FALLBACK_SHARED_PAGES;
  }
}

/**
 * Public: Submits a new shared page from a visitor.
 * Defaults to 'pending' moderation status.
 */
export async function submitSharedPage(
  authorName: string,
  title: string | null,
  content: string
): Promise<SharedPage> {
  const trimmedAuthor = authorName.trim() || "Anonymous";
  const trimmedTitle = title?.trim() || null;
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new Error("Content cannot be empty.");
  }

  // Basic word count calculation
  const wordCount = trimmedContent.split(/\s+/).filter(Boolean).length;

  if (wordCount < 10) {
    throw new Error("Shared thoughts should be reflective (minimum 10 words).");
  }
  if (wordCount > 300) {
    throw new Error("Shared thoughts must not exceed 300 words to maintain notebook layout.");
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("shared_pages")
      .insert({
        author_name: trimmedAuthor,
        title: trimmedTitle,
        content: trimmedContent,
        word_count: wordCount,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("[submitSharedPage] DB error:", error.message);
      throw new Error(error.message);
    }

    return data as SharedPage;
  } catch (error) {
    console.error("[submitSharedPage] Service error:", error);
    throw error;
  }
}

// ── Admin API ─────────────────────────────────────────────────────────────────

/**
 * Admin: Fetches all submitted shared pages (all statuses) bypassing RLS.
 */
export async function getAllSharedPagesAdmin(): Promise<SharedPage[]> {
  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("shared_pages")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("[getAllSharedPagesAdmin] DB error:", error.message);
      throw new Error(error.message);
    }

    return (data as SharedPage[]) || [];
  } catch (error) {
    console.error("[getAllSharedPagesAdmin] Service error:", error);
    throw error;
  }
}

/**
 * Admin: Moderates a shared page.
 * If status is set to 'approved', published_at is set to the current timestamp.
 */
export async function updateSharedPageStatusAdmin(
  id: string,
  status: ModerationStatus
): Promise<SharedPage> {
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
      .from("shared_pages")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[updateSharedPageStatusAdmin] DB error:", error.message);
      throw new Error(error.message);
    }

    return data as SharedPage;
  } catch (error) {
    console.error("[updateSharedPageStatusAdmin] Service error:", error);
    throw error;
  }
}

/**
 * Admin: Deletes a shared page submission.
 */
export async function deleteSharedPageAdmin(id: string): Promise<boolean> {
  if (!id) throw new Error("ID is required");

  try {
    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase
      .from("shared_pages")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[deleteSharedPageAdmin] DB error:", error.message);
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error("[deleteSharedPageAdmin] Service error:", error);
    throw error;
  }
}
