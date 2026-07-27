"use server";

import { toAdminActionError } from "@/lib/auth/admin-errors";
import { canManageArticles } from "@/lib/auth/policies";
import { recordAuditLog } from "@/platform/audit/audit-log";
import {
  type CreateCollectionInput,
  createCollectionAdmin,
  deleteCollectionAdmin,
  setCollectionArticlesAdmin,
  updateCollectionAdmin,
} from "@/lib/services/collections";
import { revalidatePath } from "next/cache";

export async function createCollectionAction(input: CreateCollectionInput) {
  try {
    const { userId } = await canManageArticles();
    const collection = await createCollectionAdmin(input);

    await recordAuditLog({
      userId,
      action: "collection.created",
      targetType: "article",
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
    const { userId } = await canManageArticles();
    const collection = await updateCollectionAdmin(id, input);

    await recordAuditLog({
      userId,
      action: "collection.updated",
      targetType: "article",
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
    const { userId } = await canManageArticles();
    await deleteCollectionAdmin(id);

    await recordAuditLog({
      userId,
      action: "collection.deleted",
      targetType: "article",
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

export async function setCollectionArticlesAction(
  collectionId: string,
  articleIdsInOrder: string[]
) {
  try {
    const { userId } = await canManageArticles();
    await setCollectionArticlesAdmin(collectionId, articleIdsInOrder);

    await recordAuditLog({
      userId,
      action: "collection.items_updated",
      targetType: "article",
      targetId: collectionId,
      details: { article_count: articleIdsInOrder.length },
    });

    revalidatePath(`/admin/collections/${collectionId}`);
    revalidatePath("/collections");
    return { success: true, error: null };
  } catch (error: unknown) {
    return {
      success: false,
      error: toAdminActionError(error) || "Failed to update collection articles",
    };
  }
}
