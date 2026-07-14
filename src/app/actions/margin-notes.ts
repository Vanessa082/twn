"use server";

import {
  deleteMarginNoteAdmin,
  submitMarginNote,
  updateMarginNotePinAdmin,
  updateMarginNoteStatusAdmin,
} from "@/lib/services/margin-notes";
import type { ModerationStatus } from "@/types";
import { revalidatePath } from "next/cache";

/**
 * Action: Visitor submits a margin note for an article.
 * Defaults status to 'pending'.
 */
export async function submitMarginNoteAction(
  articleId: string,
  authorName: string,
  content: string
) {
  try {
    const note = await submitMarginNote(articleId, authorName, content);
    revalidatePath("/articles");
    revalidatePath("/admin/content/margin-notes");
    return { success: true, data: note, error: null };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[submitMarginNoteAction] Error:", err.message);
    let userFriendlyError = err.message || "Failed to submit note.";
    if (
      userFriendlyError.includes("fetch failed") ||
      userFriendlyError.includes("TypeError") ||
      userFriendlyError.includes("failed to fetch")
    ) {
      userFriendlyError = "Unable to connect to the database right now. Please try again later.";
    }
    return { success: false, data: null, error: userFriendlyError };
  }
}

/**
 * Action: Admin moderates a margin note.
 */
export async function moderateMarginNoteAction(id: string, status: ModerationStatus) {
  try {
    const note = await updateMarginNoteStatusAdmin(id, status);
    revalidatePath("/articles");
    revalidatePath("/admin/content/margin-notes");
    return { success: true, data: note, error: null };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[moderateMarginNoteAction] Error:", err.message);
    return { success: false, data: null, error: err.message || "Failed to update note status." };
  }
}

/**
 * Action: Admin pins or unpins a margin note.
 */
export async function pinMarginNoteAction(id: string, pinned: boolean) {
  try {
    const note = await updateMarginNotePinAdmin(id, pinned);
    revalidatePath("/articles");
    revalidatePath("/admin/content/margin-notes");
    return { success: true, data: note, error: null };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[pinMarginNoteAction] Error:", err.message);
    return { success: false, data: null, error: err.message || "Failed to update pin status." };
  }
}

/**
 * Action: Admin deletes a margin note permanently.
 */
export async function deleteMarginNoteAction(id: string) {
  try {
    await deleteMarginNoteAdmin(id);
    revalidatePath("/articles");
    revalidatePath("/admin/content/margin-notes");
    return { success: true, error: null };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[deleteMarginNoteAction] Error:", err.message);
    return { success: false, error: err.message || "Failed to delete note." };
  }
}
