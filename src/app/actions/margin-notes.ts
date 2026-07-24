"use server";

import { toAdminActionError } from "@/lib/auth/admin-errors";
import { canModerateMarginNotes } from "@/lib/auth/policies";
import {
  enforceRateLimit,
  isBotSubmission,
  isDuplicateSubmission,
} from "@/lib/security/submission-protection";
import { recordAuditLog } from "@/platform/audit/audit-log";
import {
  deleteMarginNoteAdmin,
  submitMarginNote,
  updateMarginNotePinAdmin,
  updateMarginNoteStatusAdmin,
} from "@/lib/services/margin-notes";
import { submitMarginNoteSchema } from "@/lib/validation/schemas";
import type { ModerationStatus } from "@/types";
import { revalidatePath } from "next/cache";

export async function submitMarginNoteAction(
  articleId: string,
  authorName: string,
  content: string,
  honeypot?: string
) {
  try {
    // 1. Honeypot Check
    if (isBotSubmission(honeypot)) {
      return { success: true, data: null, error: null };
    }

    // 2. Rate Limiting
    const rateLimit = await enforceRateLimit("submit_margin_note", 5);
    if (!rateLimit.success) {
      return { success: false, data: null, error: rateLimit.error! };
    }

    // 3. Duplicate Suppression
    if (await isDuplicateSubmission(content)) {
      return {
        success: false,
        data: null,
        error: "You have already submitted this note recently.",
      };
    }

    const validated = submitMarginNoteSchema.parse({ articleId, authorName, content });
    const note = await submitMarginNote(
      validated.articleId,
      validated.authorName,
      validated.content
    );
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
    const { userId } = await canModerateMarginNotes();
    const note = await updateMarginNoteStatusAdmin(id, status);

    await recordAuditLog({
      userId,
      action: `margin_note.${status}`,
      targetType: "margin_note",
      targetId: note.id,
      details: { author_name: note.author_name, status },
    });

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
    const { userId } = await canModerateMarginNotes();
    const note = await updateMarginNotePinAdmin(id, pinned);

    await recordAuditLog({
      userId,
      action: pinned ? "margin_note.pinned" : "margin_note.unpinned",
      targetType: "margin_note",
      targetId: note.id,
    });

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
    const { userId } = await canModerateMarginNotes();
    await deleteMarginNoteAdmin(id);

    await recordAuditLog({
      userId,
      action: "margin_note.deleted",
      targetType: "margin_note",
      targetId: id,
    });

    revalidatePath("/articles");
    revalidatePath("/admin/content/margin-notes");
    return { success: true, error: null };
  } catch (error: unknown) {
    console.error("[deleteMarginNoteAction] Error:", toAdminActionError(error));
    return { success: false, error: toAdminActionError(error) || "Failed to delete note." };
  }
}
