"use server";

import { createTagAdmin, deleteTagAdmin, setNoteTagsAdmin } from "@/modules/editorial";
import { canManageNotes, toAdminActionError } from "@/modules/identity";
import { recordAuditLog } from "@/platform/audit/audit-log";
import { revalidatePath } from "next/cache";

export async function createTagAction(name: string) {
  try {
    const { userId } = await canManageNotes();
    const tag = await createTagAdmin(name);

    await recordAuditLog({
      userId,
      action: "tag.created",
      targetType: "note",
      targetId: tag.id,
      details: { name: tag.name, slug: tag.slug },
    });

    revalidatePath("/admin/tags");
    return { success: true, data: tag, error: null };
  } catch (error: unknown) {
    return {
      success: false,
      data: null,
      error: toAdminActionError(error) || "Failed to create tag",
    };
  }
}

export async function deleteTagAction(id: string) {
  try {
    const { userId } = await canManageNotes();
    await deleteTagAdmin(id);

    await recordAuditLog({
      userId,
      action: "tag.deleted",
      targetType: "note",
      targetId: id,
    });

    revalidatePath("/admin/tags");
    revalidatePath("/admin/notes");
    return { success: true, error: null };
  } catch (error: unknown) {
    return {
      success: false,
      error: toAdminActionError(error) || "Failed to delete tag",
    };
  }
}

export async function setNoteTagsAction(noteId: string, tagIds: string[]) {
  try {
    const { userId } = await canManageNotes();
    await setNoteTagsAdmin(noteId, tagIds);

    await recordAuditLog({
      userId,
      action: "note.tags_updated",
      targetType: "note",
      targetId: noteId,
      details: { tag_count: tagIds.length },
    });

    revalidatePath(`/admin/notes/${noteId}`);
    revalidatePath("/notebook");
    return { success: true, error: null };
  } catch (error: unknown) {
    return {
      success: false,
      error: toAdminActionError(error) || "Failed to update note tags",
    };
  }
}
