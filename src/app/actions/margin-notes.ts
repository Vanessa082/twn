"use server";

import { toAdminActionError } from "@/lib/auth/admin-errors";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  deleteMarginNoteAdmin,
  submitMarginNote,
  updateMarginNotePinAdmin,
  updateMarginNoteStatusAdmin,
} from "@/lib/services/margin-notes";
import type { ModerationStatus } from "@/types";
import { revalidatePath } from "next/cache";

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
      userFriendlyError = "Something went wrong on our end. Please try again in a few moments.";
    } else if (
      userFriendlyError.toLowerCase().includes("row-level security") ||
      userFriendlyError.toLowerCase().includes("violates") ||
      userFriendlyError.toLowerCase().includes("policy")
    ) {
      userFriendlyError = "We couldn't save your note right now. Please try again in a moment.";
    }
    return { success: false, data: null, error: userFriendlyError };
  }
}

export async function moderateMarginNoteAction(id: string, status: ModerationStatus) {
  try {
    await requireAdmin();
    const note = await updateMarginNoteStatusAdmin(id, status);
    revalidatePath("/articles");
    revalidatePath("/admin/content/margin-notes");
    return { success: true, data: note, error: null };
  } catch (error: unknown) {
    console.error("[moderateMarginNoteAction] Error:", toAdminActionError(error));
    return {
      success: false,
      data: null,
      error: toAdminActionError(error) || "Failed to update note status.",
    };
  }
}

export async function pinMarginNoteAction(id: string, pinned: boolean) {
  try {
    await requireAdmin();
    const note = await updateMarginNotePinAdmin(id, pinned);
    revalidatePath("/articles");
    revalidatePath("/admin/content/margin-notes");
    return { success: true, data: note, error: null };
  } catch (error: unknown) {
    console.error("[pinMarginNoteAction] Error:", toAdminActionError(error));
    return {
      success: false,
      data: null,
      error: toAdminActionError(error) || "Failed to update pin status.",
    };
  }
}

export async function deleteMarginNoteAction(id: string) {
  try {
    await requireAdmin();
    await deleteMarginNoteAdmin(id);
    revalidatePath("/articles");
    revalidatePath("/admin/content/margin-notes");
    return { success: true, error: null };
  } catch (error: unknown) {
    console.error("[deleteMarginNoteAction] Error:", toAdminActionError(error));
    return { success: false, error: toAdminActionError(error) || "Failed to delete note." };
  }
}
