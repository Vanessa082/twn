"use server";

import {
  collectionEntriesSchema,
  collectionSchema,
  entityIdSchema,
  updateCollectionSchema,
} from "@/lib/validation/schemas";
import {
  type CreateCollectionInput,
  type SaveCollectionEntriesInput,
  createCollectionAdmin,
  deleteCollectionAdmin,
  saveCollectionEntriesAdmin,
  updateCollectionAdmin,
} from "@/modules/editorial";
import { canManageNotes, toAdminActionError } from "@/modules/identity";
import { recordAuditLog } from "@/platform/audit/audit-log";
import { revalidatePath } from "next/cache";

export async function createCollectionAction(input: CreateCollectionInput) {
  try {
    const { userId } = await canManageNotes();
    const collection = await createCollectionAdmin(collectionSchema.parse(input));

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
    const collection = await updateCollectionAdmin(
      entityIdSchema.parse(id),
      updateCollectionSchema.parse(input)
    );

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
    revalidatePath("/notebook/[slug]", "page");
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
    await deleteCollectionAdmin(entityIdSchema.parse(id));

    await recordAuditLog({
      userId,
      action: "collection.deleted",
      targetType: "note",
      targetId: id,
    });

    revalidatePath("/admin/collections");
    revalidatePath("/collections", "layout");
    revalidatePath("/notebook/[slug]", "page");
    return { success: true, error: null };
  } catch (error: unknown) {
    return {
      success: false,
      error: toAdminActionError(error) || "Failed to delete collection",
    };
  }
}

export async function saveCollectionEntriesAction(
  collectionId: string,
  input: SaveCollectionEntriesInput
) {
  try {
    const { userId } = await canManageNotes();
    const id = entityIdSchema.parse(collectionId);
    const parsed = collectionEntriesSchema.parse(input);
    await saveCollectionEntriesAdmin(id, parsed);

    await recordAuditLog({
      userId,
      action: "collection.items_updated",
      targetType: "note",
      targetId: id,
      details: { kind: parsed.kind, article_count: parsed.entries.length },
    });

    revalidatePath(`/admin/collections/${id}`);
    revalidatePath("/collections", "layout");
    revalidatePath("/notebook/[slug]", "page");
    return { success: true, error: null };
  } catch (error: unknown) {
    return {
      success: false,
      error: toAdminActionError(error) || "Failed to save collection notes",
    };
  }
}
