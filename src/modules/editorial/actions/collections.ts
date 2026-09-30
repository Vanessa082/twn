"use server";

import {
  type CreateCollectionInput,
  createCollectionAdmin,
  deleteCollectionAdmin,
  setCollectionNotesAdmin,
  updateCollectionAdmin,
} from "@/modules/editorial";
import { canManageNotes, toAdminActionError } from "@/modules/identity";
import { recordAuditLog } from "@/platform/audit/audit-log";
import { revalidatePath } from "next/cache";

export async function createCollectionAction(input: CreateCollectionInput) {
  try {
    const { userId } = await canManageNotes();
    const collection = await createCollectionAdmin(input);

    await recordAuditLog({
      userId,
      action: "collection.created",
      targetType: "note",
      targetId: collection.id,
      details: { title: collection.title, slug: collection.slug },
    });

    revalidatePath("/admin/collections");
    revalidatePath("/collections");
    return { success: true, data: collection, error: null };
  } catch (error: unknown) {
    return {
      success: false,
      data: null,
      error: toAdminActionError(error) || "Failed to create collection",
    };
  }
}

export async function updateCollectionAction(id: string, input: Partial<CreateCollectionInput>) {
  try {
    const { userId } = await canManageNotes();
    const collection = await updateCollectionAdmin(id, input);

    await recordAuditLog({
      userId,
      action: "collection.updated",
      targetType: "note",
      targetId: id,
      details: { title: collection.title, is_published: collection.is_published },
    });

    revalidatePath("/admin/collections");
    revalidatePath(`/admin/collections/${id}`);
    revalidatePath("/collections");
    revalidatePath(`/collections/${collection.slug}`);
    return { success: true, data: collection, error: null };
  } catch (error: unknown) {
    return {
      success: false,
      data: null,
      error: toAdminActionError(error) || "Failed to update collection",
    };
  }
}

export async function deleteCollectionAction(id: string) {
  try {
    const { userId } = await canManageNotes();
    await deleteCollectionAdmin(id);

    await recordAuditLog({
      userId,
      action: "collection.deleted",
      targetType: "note",
      targetId: id,
    });

    revalidatePath("/admin/collections");
    revalidatePath("/collections");
    return { success: true, error: null };
  } catch (error: unknown) {
    return {
      success: false,
      error: toAdminActionError(error) || "Failed to delete collection",
    };
  }
}

export async function setCollectionNotesAction(collectionId: string, noteIdsInOrder: string[]) {
  try {
    const { userId } = await canManageNotes();
    await setCollectionNotesAdmin(collectionId, noteIdsInOrder);

    await recordAuditLog({
      userId,
      action: "collection.items_updated",
      targetType: "note",
      targetId: collectionId,
      details: { article_count: noteIdsInOrder.length },
    });

    revalidatePath(`/admin/collections/${collectionId}`);
    revalidatePath("/collections");
    return { success: true, error: null };
  } catch (error: unknown) {
    return {
      success: false,
      error: toAdminActionError(error) || "Failed to update collection notes",
    };
  }
}
