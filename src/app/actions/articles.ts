"use server";

import { toAdminActionError } from "@/lib/auth/admin-errors";
import { canManageArticles } from "@/lib/auth/policies";
import {
  createArticleAdmin,
  deleteArticleAdmin,
  updateArticleAdmin,
} from "@/lib/services/articles";
import { recordAuditLog } from "@/platform/audit/audit-log";
import { createRevision, getRevisionById } from "@/lib/services/revisions";
import { broadcastNewArticle } from "@/lib/services/subscribers";
import { createArticleSchema, updateArticleSchema } from "@/lib/validation/schemas";
import type { CreateArticleInput, UpdateArticleInput } from "@/types";
import { revalidatePath } from "next/cache";

export async function createArticleAction(input: CreateArticleInput) {
  try {
    const { userId } = await canManageArticles();
    const validated = createArticleSchema.parse(input);
    const articlePayload: CreateArticleInput = {
      ...validated,
      cover_image: validated.cover_image ?? null,
      published_at: validated.published_at ?? null,
    };
    const article = await createArticleAdmin(articlePayload);

    await recordAuditLog({
      userId,
      action: article.status === "published" ? "article.published" : "article.created",
      targetType: "article",
      targetId: article.id,
      details: { title: article.title, status: article.status, category: article.category },
    });

    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath("/admin/articles");

    if (article.status === "published") {
      broadcastNewArticle({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        cover_image: article.cover_image,
        reading_time: article.reading_time ?? null,
        category: article.category,
      }).catch((err) => console.error("[createArticleAction] Broadcast failed silently:", err));
    }

    return { success: true, data: article, error: null };
  } catch (error: unknown) {
    console.error("[createArticleAction] Error:", toAdminActionError(error));
    return {
      success: false,
      data: null,
      error: toAdminActionError(error) || "Failed to create article",
    };
  }
}

export async function updateArticleAction(id: string, input: UpdateArticleInput) {
  try {
    const { userId } = await canManageArticles();
    const validated = updateArticleSchema.parse(input);
    const updatePayload: UpdateArticleInput = {
      ...validated,
      cover_image:
        validated.cover_image === undefined ? undefined : (validated.cover_image ?? null),
    };
    const article = await updateArticleAdmin(id, updatePayload);

    // Save a revision snapshot so the editor can restore any previous version.
    // Fire-and-forget: revision failure should never block the main save.
    createRevision(article, userId).catch((err) =>
      console.warn("[updateArticleAction] Revision snapshot failed silently:", err)
    );

    await recordAuditLog({
      userId,
      action: "article.updated",
      targetType: "article",
      targetId: article.id,
      details: { title: article.title, status: article.status },
    });

    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath(`/articles/${article.slug}`);
    revalidatePath("/admin/articles");
    return { success: true, data: article, error: null };
  } catch (error: unknown) {
    console.error("[updateArticleAction] Error:", toAdminActionError(error));
    return {
      success: false,
      data: null,
      error: toAdminActionError(error) || "Failed to update article",
    };
  }
}

/**
 * Restore an article to a previous revision snapshot.
 * Before restoring, saves the current state as a new revision so the
 * editor can always undo the restore itself.
 */
export async function restoreRevisionAction(revisionId: string) {
  try {
    const { userId } = await canManageArticles();
    const revision = await getRevisionById(revisionId);
    if (!revision) return { success: false, error: "Revision not found" };

    // Save current state before overwriting (safety net)
    const current = await import("@/lib/services/articles").then((m) =>
      m.getArticleByIdAdmin(revision.article_id)
    );
    if (current) {
      createRevision(current, userId).catch(() => {});
    }

    // Restore the revision content
    const restored = await updateArticleAdmin(revision.article_id, {
      title: revision.title,
      excerpt: revision.excerpt,
      content: revision.content,
      cover_image: revision.cover_image,
      category: revision.category as UpdateArticleInput["category"],
      status: revision.status as UpdateArticleInput["status"],
    });

    await recordAuditLog({
      userId,
      action: "article.updated",
      targetType: "article",
      targetId: revision.article_id,
      details: { restored_from_revision: revisionId, title: revision.title },
    });

    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath(`/articles/${restored.slug}`);
    revalidatePath("/admin/articles");
    revalidatePath(`/admin/articles/${revision.article_id}/edit`);
    return { success: true, data: restored, error: null };
  } catch (error: unknown) {
    return {
      success: false,
      data: null,
      error: toAdminActionError(error) || "Failed to restore revision",
    };
  }
}

export async function deleteArticleAction(id: string) {
  try {
    const { userId } = await canManageArticles();
    await deleteArticleAdmin(id);

    await recordAuditLog({
      userId,
      action: "article.deleted",
      targetType: "article",
      targetId: id,
    });

    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath("/admin/articles");
    return { success: true, error: null };
  } catch (error: unknown) {
    console.error("[deleteArticleAction] Error:", toAdminActionError(error));
    return { success: false, error: toAdminActionError(error) || "Failed to delete article" };
  }
}

export async function toggleArticleLikeAction(slug: string, increment: boolean) {
  try {
    const { toggleArticleLike } = await import("@/lib/services/articles");
    const count = await toggleArticleLike(slug, increment);
    revalidatePath(`/articles/${slug}`);
    return { success: true, count, error: null };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[toggleArticleLikeAction] Error:", err.message);
    return { success: false, count: 0, error: err.message || "Failed to toggle like" };
  }
}
