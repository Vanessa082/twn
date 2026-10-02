"use server";

import { sanitizeNoteHtml } from "@/lib/security/sanitize-note-html";
import { createNoteSchema, entityIdSchema, updateNoteSchema } from "@/lib/validation/schemas";
import {
  createNoteAdmin,
  deleteNoteAdmin,
  getNoteByIdAdmin,
  toggleNoteLike,
  updateNoteAdmin,
} from "@/modules/editorial";
import { createRevision, getRevisionById } from "@/modules/editorial";
import type { CreateNoteInput, UpdateNoteInput } from "@/modules/editorial";
import { canManageNotes, toAdminActionError } from "@/modules/identity";
import { broadcastNewNote } from "@/modules/newsletter";
import { recordAuditLog } from "@/platform/audit/audit-log";
import { revalidatePath } from "next/cache";

export async function createNoteAction(input: CreateNoteInput) {
  try {
    const { userId } = await canManageNotes();
    const validated = createNoteSchema.parse(input);
    const notePayload: CreateNoteInput = {
      ...validated,
      content: sanitizeNoteHtml(validated.content),
      cover_image: validated.cover_image ?? null,
      published_at: validated.published_at ?? null,
    };
    const note = await createNoteAdmin(notePayload);

    await recordAuditLog({
      userId,
      action: note.status === "published" ? "note.published" : "note.created",
      targetType: "note",
      targetId: note.id,
      details: { title: note.title, status: note.status, category: note.category },
    });

    revalidatePath("/");
    revalidatePath("/notebook");
    revalidatePath("/admin/notes");

    if (note.status === "published") {
      broadcastNewNote({
        title: note.title,
        slug: note.slug,
        excerpt: note.excerpt,
        cover_image: note.cover_image,
        reading_time: note.reading_time ?? null,
        category: note.category,
      }).catch((err) => console.error("[createNoteAction] Broadcast failed silently:", err));
    }

    return { success: true, data: note, error: null };
  } catch (error: unknown) {
    console.error("[createNoteAction] Error:", toAdminActionError(error));
    return {
      success: false,
      data: null,
      error: toAdminActionError(error) || "Failed to create note",
    };
  }
}

export async function updateNoteAction(id: string, input: UpdateNoteInput) {
  try {
    const { userId } = await canManageNotes();
    const validatedId = entityIdSchema.parse(id);
    const validated = updateNoteSchema.parse(input);
    const updatePayload: UpdateNoteInput = {
      ...validated,
      ...(validated.content === undefined ? {} : { content: sanitizeNoteHtml(validated.content) }),
      cover_image:
        validated.cover_image === undefined ? undefined : (validated.cover_image ?? null),
    };
    const note = await updateNoteAdmin(validatedId, updatePayload);

    // Save a revision snapshot so the editor can restore any previous version.
    // Fire-and-forget: revision failure should never block the main save.
    createRevision(note, userId).catch((err) =>
      console.warn("[updateNoteAction] Revision snapshot failed silently:", err)
    );

    await recordAuditLog({
      userId,
      action: "note.updated",
      targetType: "note",
      targetId: note.id,
      details: { title: note.title, status: note.status },
    });

    revalidatePath("/");
    revalidatePath("/notebook");
    revalidatePath(`/notebook/${note.slug}`);
    revalidatePath("/admin/notes");
    return { success: true, data: note, error: null };
  } catch (error: unknown) {
    console.error("[updateNoteAction] Error:", toAdminActionError(error));
    return {
      success: false,
      data: null,
      error: toAdminActionError(error) || "Failed to update note",
    };
  }
}

/**
 * Restore an note to a previous revision snapshot.
 * Before restoring, saves the current state as a new revision so the
 * editor can always undo the restore itself.
 */
export async function restoreRevisionAction(revisionId: string) {
  try {
    const { userId } = await canManageNotes();
    const validatedRevisionId = entityIdSchema.parse(revisionId);
    const revision = await getRevisionById(validatedRevisionId);
    if (!revision) return { success: false, error: "Revision not found" };

    // Save current state before overwriting (safety net)
    const current = await getNoteByIdAdmin(revision.note_id);
    if (current) {
      createRevision(current, userId).catch(() => {});
    }

    // Restore the revision content
    const restored = await updateNoteAdmin(revision.note_id, {
      title: revision.title,
      excerpt: revision.excerpt,
      content: sanitizeNoteHtml(revision.content),
      cover_image: revision.cover_image,
      category: revision.category as UpdateNoteInput["category"],
      status: revision.status as UpdateNoteInput["status"],
    });

    await recordAuditLog({
      userId,
      action: "note.updated",
      targetType: "note",
      targetId: revision.note_id,
      details: { restored_from_revision: validatedRevisionId, title: revision.title },
    });

    revalidatePath("/");
    revalidatePath("/notebook");
    revalidatePath(`/notebook/${restored.slug}`);
    revalidatePath("/admin/notes");
    revalidatePath(`/admin/notes/${revision.note_id}/edit`);
    return { success: true, data: restored, error: null };
  } catch (error: unknown) {
    return {
      success: false,
      data: null,
      error: toAdminActionError(error) || "Failed to restore revision",
    };
  }
}

export async function deleteNoteAction(id: string) {
  try {
    const { userId } = await canManageNotes();
    const validatedId = entityIdSchema.parse(id);
    await deleteNoteAdmin(validatedId);

    await recordAuditLog({
      userId,
      action: "note.deleted",
      targetType: "note",
      targetId: validatedId,
    });

    revalidatePath("/");
    revalidatePath("/notebook");
    revalidatePath("/admin/notes");
    return { success: true, error: null };
  } catch (error: unknown) {
    console.error("[deleteNoteAction] Error:", toAdminActionError(error));
    return { success: false, error: toAdminActionError(error) || "Failed to delete note" };
  }
}

export async function toggleNoteLikeAction(slug: string, increment: boolean) {
  if (
    typeof slug !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    slug.length > 200 ||
    typeof increment !== "boolean"
  ) {
    return { success: false, count: 0, error: "That note could not be found." };
  }
  try {
    const count = await toggleNoteLike(slug, increment);
    revalidatePath(`/notebook/${slug}`);
    return { success: true, count, error: null };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[toggleNoteLikeAction] Error:", err.message);
    return { success: false, count: 0, error: err.message || "Failed to toggle like" };
  }
}
