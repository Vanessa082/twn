import { createAdminClient, createClient } from "@/lib/db/server";
import type { Tag } from "@/types";

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ── Public reads ──────────────────────────────────────────────────────────────

/** Fetch all tags (for autocomplete / admin list). */
export async function getAllTags(): Promise<Tag[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return data as Tag[];
  } catch {
    return [];
  }
}

/** Fetch a single tag by slug. */
export async function getTagBySlug(slug: string): Promise<Tag | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("tags").select("*").eq("slug", slug).single();
    if (error) return null;
    return data as Tag;
  } catch {
    return null;
  }
}

/** Fetch tags attached to a single article. */
export async function getTagsForArticle(articleId: string): Promise<Tag[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("article_tags")
      .select("tags(*)")
      .eq("article_id", articleId);
    if (error) throw error;
    // biome-ignore lint/suspicious/noExplicitAny: Supabase join output typing
    return (data?.map((row: any) => row.tags).filter(Boolean) ?? []) as Tag[];
  } catch {
    return [];
  }
}

/** Fetch published articles for a given tag slug. */
export async function getArticlesByTag(
  tagSlug: string,
  limit = 20
): Promise<import("@/types").ArticleCard[]> {
  try {
    const supabase = await createClient();

    // First resolve the tag
    const { data: tag } = await supabase.from("tags").select("id").eq("slug", tagSlug).single();

    if (!tag) return [];

    // Then get article IDs via the join table
    const { data: joins, error: joinError } = await supabase
      .from("article_tags")
      .select("article_id")
      .eq("tag_id", tag.id)
      .limit(limit);

    if (joinError || !joins?.length) return [];

    // biome-ignore lint/suspicious/noExplicitAny: Supabase return typing
    const articleIds = joins.map((r: any) => r.article_id);

    const { data: articles, error: artError } = await supabase
      .from("articles")
      .select(
        "id, title, slug, excerpt, cover_image, category, status, published_at, created_at, updated_at, reading_time, likes_count, seo_title, seo_description, og_image, canonical_url"
      )
      .in("id", articleIds)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (artError) throw artError;
    return (articles ?? []) as import("@/types").ArticleCard[];
  } catch {
    return [];
  }
}

// ── Related articles ──────────────────────────────────────────────────────────

/** Fetch related published articles for a given article, by shared tags then category fallback. */
export async function getRelatedArticles(
  articleId: string,
  category: string,
  limit = 3
): Promise<import("@/types").ArticleCard[]> {
  try {
    const supabase = await createClient();

    // 1. Get this article's tag IDs
    const { data: tagRows } = await supabase
      .from("article_tags")
      .select("tag_id")
      .eq("article_id", articleId);

    // biome-ignore lint/suspicious/noExplicitAny: Supabase return typing
    const tagIds = tagRows?.map((r: any) => r.tag_id) ?? [];

    let relatedIds: string[] = [];

    if (tagIds.length > 0) {
      // 2. Find other articles that share any tag
      const { data: sharedTagArticles } = await supabase
        .from("article_tags")
        .select("article_id")
        .in("tag_id", tagIds)
        .neq("article_id", articleId)
        .limit(limit * 3); // over-fetch so we can de-duplicate

      // biome-ignore lint/suspicious/noExplicitAny: Supabase return typing
      const mappedIds = sharedTagArticles?.map((r: any) => r.article_id as string) ?? [];
      relatedIds = Array.from(new Set(mappedIds)).slice(0, limit);
    }

    // 3. Fallback: fill remaining slots from same category
    const needed = limit - relatedIds.length;
    if (needed > 0) {
      const { data: catArticles } = await supabase
        .from("articles")
        .select("id")
        .eq("category", category)
        .eq("status", "published")
        .neq("id", articleId)
        .not("id", "in", `(${relatedIds.join(",") || "00000000-0000-0000-0000-000000000000"})`)
        .limit(needed);

      // biome-ignore lint/suspicious/noExplicitAny: Supabase return typing
      const catIds = catArticles?.map((a: any) => a.id as string) ?? [];
      relatedIds = [...relatedIds, ...catIds];
    }

    if (relatedIds.length === 0) return [];

    const { data: articles } = await supabase
      .from("articles")
      .select(
        "id, title, slug, excerpt, cover_image, category, status, published_at, created_at, updated_at, reading_time, likes_count, seo_title, seo_description, og_image, canonical_url"
      )
      .in("id", relatedIds)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);

    return (articles ?? []) as import("@/types").ArticleCard[];
  } catch {
    return [];
  }
}

// ── Admin mutations ───────────────────────────────────────────────────────────

/** Create a new tag (auto-generates slug). */
export async function createTagAdmin(name: string): Promise<Tag> {
  const adminSupabase = createAdminClient();
  const slug = slugify(name);
  const { data, error } = await adminSupabase
    .from("tags")
    .insert({ name: name.trim(), slug })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Tag;
}

/** Delete a tag permanently. */
export async function deleteTagAdmin(id: string): Promise<void> {
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.from("tags").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Replace all tags on an article with the given tag IDs. */
export async function setArticleTagsAdmin(articleId: string, tagIds: string[]): Promise<void> {
  const adminSupabase = createAdminClient();

  // Delete existing associations
  const { error: deleteError } = await adminSupabase
    .from("article_tags")
    .delete()
    .eq("article_id", articleId);
  if (deleteError) throw new Error(deleteError.message);

  if (tagIds.length === 0) return;

  // Insert new associations
  const { error: insertError } = await adminSupabase
    .from("article_tags")
    .insert(tagIds.map((tag_id) => ({ article_id: articleId, tag_id })));
  if (insertError) throw new Error(insertError.message);
}
