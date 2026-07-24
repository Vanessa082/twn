"use server";

import { toAdminActionError } from "@/lib/auth/admin-errors";
import { canManageArticles } from "@/lib/auth/policies";
import { recordAuditLog } from "@/platform/audit/audit-log";
import { createTagAdmin, deleteTagAdmin, setArticleTagsAdmin } from "@/lib/services/tags";
import { revalidatePath } from "next/cache";

export async function createTagAction(name: string) {
  try {
    const { userId } = await canManageArticles();
    const tag = await createTagAdmin(name);

    await recordAuditLog({
      userId,
      action: "tag.created",
      targetType: "article",
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
    const { userId } = await canManageArticles();
    await deleteTagAdmin(id);

    await recordAuditLog({
      userId,
      action: "tag.deleted",
      targetType: "article",
      targetId: id,
    });

    revalidatePath("/admin/tags");
    revalidatePath("/admin/articles");
    return { success: true, error: null };
  } catch (error: unknown) {
    return {
      success: false,
      error: toAdminActionError(error) || "Failed to delete tag",
    };
  }
}

export async function setArticleTagsAction(articleId: string, tagIds: string[]) {
  try {
    const { userId } = await canManageArticles();
    await setArticleTagsAdmin(articleId, tagIds);

    await recordAuditLog({
      userId,
      action: "article.tags_updated",
      targetType: "article",
      targetId: articleId,
      details: { tag_count: tagIds.length },
    });

    revalidatePath(`/admin/articles/${articleId}`);
    revalidatePath("/articles");
    return { success: true, error: null };
  } catch (error: unknown) {
    return {
      success: false,
      error: toAdminActionError(error) || "Failed to update article tags",
    };
  }
}
