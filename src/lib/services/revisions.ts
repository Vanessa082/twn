import { createAdminClient } from "@/lib/db/server";
import type { Article, ArticleRevision } from "@/types";

/** Maximum revisions kept per article to avoid unbounded growth. */
const MAX_REVISIONS_PER_ARTICLE = 20;

/**
 * Saves a full snapshot of the article before or after a save.
 * Call this from the updateArticleAction server action so every save
 * is recorded and can be restored.
 */
export async function createRevision(
  article: Pick<
    Article,
    "id" | "title" | "excerpt" | "content" | "cover_image" | "category" | "status"
  >,
  savedByClerkId?: string | null
): Promise<void> {
  const adminSupabase = createAdminClient();

  await adminSupabase.from("article_revisions").insert({
    article_id: article.id,
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    cover_image: article.cover_image,
    category: article.category,
    status: article.status,
    saved_by_clerk_id: savedByClerkId ?? null,
  });

  // Prune old revisions to keep the table lean.
  // We keep the most recent MAX_REVISIONS_PER_ARTICLE rows.
  const { data: oldRevisions } = await adminSupabase
    .from("article_revisions")
    .select("id, created_at")
    .eq("article_id", article.id)
    .order("created_at", { ascending: false })
    .range(MAX_REVISIONS_PER_ARTICLE, 9999);

  if (oldRevisions && oldRevisions.length > 0) {
    const idsToDelete = oldRevisions.map((r) => r.id);
    await adminSupabase.from("article_revisions").delete().in("id", idsToDelete);
  }
}

/**
 * Fetch the last N revisions for an article (for the admin history panel).
 */
export async function getRevisionsForArticle(
  articleId: string,
  limit = 10
): Promise<ArticleRevision[]> {
  const adminSupabase = createAdminClient();

  const { data, error } = await adminSupabase
    .from("article_revisions")
    .select("*")
    .eq("article_id", articleId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as ArticleRevision[];
}

/**
 * Fetch a single revision by ID (used for the restore flow).
 */
export async function getRevisionById(id: string): Promise<ArticleRevision | null> {
  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from("article_revisions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as ArticleRevision;
}
