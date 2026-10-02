"use server";

import { entityIdSchema, fieldNoteSchema, updateFieldNoteSchema } from "@/lib/validation/schemas";
import {
  type FieldNoteInput,
  createFieldNote,
  deleteFieldNote,
  updateFieldNote,
} from "@/modules/editorial";
import { canManageFieldNotes, toAdminActionError } from "@/modules/identity";
import { recordAuditLog } from "@/platform/audit/audit-log";
import { revalidatePath } from "next/cache";

function revalidateFieldNotes() {
  revalidatePath("/");
  revalidatePath("/admin/content/field-notes");
}

export async function createFieldNoteAction(input: FieldNoteInput) {
  try {
    const { userId } = await canManageFieldNotes();
    const note = await createFieldNote(fieldNoteSchema.parse(input));

    await recordAuditLog({
      userId,
      action: "field_note.created",
      targetType: "field_note",
      targetId: note.id,
      details: { headline: note.headline, published: note.is_published },
    });

    revalidateFieldNotes();
    return { success: true, data: note, error: null };
  } catch (error: unknown) {
    console.error("[createFieldNoteAction] Error:", toAdminActionError(error));
    return {
      success: false,
      data: null,
      error: toAdminActionError(error) || "Failed to create field note",
    };
  }
}

export async function updateFieldNoteAction(id: string, input: Partial<FieldNoteInput>) {
  try {
    const { userId } = await canManageFieldNotes();
    const validatedId = entityIdSchema.parse(id);
    const note = await updateFieldNote(validatedId, updateFieldNoteSchema.parse(input));

    await recordAuditLog({
      userId,
      action: "field_note.updated",
      targetType: "field_note",
      targetId: note.id,
      details: { headline: note.headline, published: note.is_published },
    });

    revalidateFieldNotes();
    return { success: true, data: note, error: null };
  } catch (error: unknown) {
    console.error("[updateFieldNoteAction] Error:", toAdminActionError(error));
    return {
      success: false,
      data: null,
      error: toAdminActionError(error) || "Failed to update field note",
    };
  }
}

export async function deleteFieldNoteAction(id: string) {
  try {
    const { userId } = await canManageFieldNotes();
    const validatedId = entityIdSchema.parse(id);
    await deleteFieldNote(validatedId);

    await recordAuditLog({
      userId,
      action: "field_note.deleted",
      targetType: "field_note",
      targetId: validatedId,
    });

    revalidateFieldNotes();
    return { success: true, error: null };
  } catch (error: unknown) {
    console.error("[deleteFieldNoteAction] Error:", toAdminActionError(error));
    return { success: false, error: toAdminActionError(error) || "Failed to delete field note" };
  }
}
