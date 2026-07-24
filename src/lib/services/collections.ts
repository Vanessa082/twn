import { createAdminClient, createClient } from "@/lib/db/server";
import type { Collection, CollectionWithArticles } from "@/types";

function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ── Public Reads ──────────────────────────────────────────────────────────────

/** Fetch all published collections for public index. */
export async function getPublicCollections(): Promise<Collection[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Collection[];
  } catch {
    return [];
  }
}

/** Fetch a single published collection with its ordered articles by slug. */
export async function getCollectionBySlug(slug: string): Promise<CollectionWithArticles | null> {
  try {
    const supabase = await createClient();

    const { data: collection, error: colError } = await supabase
      .from("collections")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (colError || !collection) return null;

    const { data: items, error: itemError } = await supabase
      .from("collection_articles")
      .select(
        "article_id, position, articles(id, title, slug, excerpt, cover_image, category, status, published_at, created_at, updated_at, reading_time, likes_count, seo_title, seo_description, og_image, canonical_url)"
      )
      .eq("collection_id", collection.id)
      .order("position", { ascending: true });

    if (itemError) throw itemError;

    // biome-ignore lint/suspicious/noExplicitAny: Supabase relation typing
    const formattedItems = (items ?? []).map((row: any) => ({
      article_id: row.article_id,
      position: row.position,
      article: row.articles,
    }));

    return {
      ...(collection as Collection),
      items: formattedItems,
    };
  } catch {
    return null;
  }
}

// ── Admin Reads ───────────────────────────────────────────────────────────────

/** Fetch all collections (published and drafts) for admin list. */
export async function getAllCollectionsAdmin(): Promise<Collection[]> {
  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("collections")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Collection[];
  } catch {
    return [];
  }
}

/** Fetch collection by ID for admin editor. */
export async function getCollectionByIdAdmin(id: string): Promise<CollectionWithArticles | null> {
  try {
    const adminSupabase = createAdminClient();
    const { data: collection, error } = await adminSupabase
      .from("collections")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !collection) return null;

    const { data: items } = await adminSupabase
      .from("collection_articles")
      .select(
        "article_id, position, articles(id, title, slug, excerpt, cover_image, category, status, published_at, created_at, updated_at, reading_time, likes_count, seo_title, seo_description, og_image, canonical_url)"
      )
      .eq("collection_id", id)
      .order("position", { ascending: true });

    // biome-ignore lint/suspicious/noExplicitAny: Supabase relation typing
    const formattedItems = (items ?? []).map((row: any) => ({
      article_id: row.article_id,
      position: row.position,
      article: row.articles,
    }));

    return {
      ...(collection as Collection),
      items: formattedItems,
    };
  } catch {
    return null;
  }
}

// ── Admin Mutations ───────────────────────────────────────────────────────────

export interface CreateCollectionInput {
  title: string;
  slug?: string;
  description?: string | null;
  cover_image?: string | null;
  is_published?: boolean;
}

export async function createCollectionAdmin(input: CreateCollectionInput): Promise<Collection> {
  const adminSupabase = createAdminClient();
  const slug = input.slug?.trim() || slugify(input.title);

  const { data, error } = await adminSupabase
    .from("collections")
    .insert({
      title: input.title.trim(),
      slug,
      description: input.description?.trim() || null,
      cover_image: input.cover_image?.trim() || null,
      is_published: input.is_published ?? false,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Collection;
}

export async function updateCollectionAdmin(
  id: string,
  input: Partial<CreateCollectionInput>
): Promise<Collection> {
  const adminSupabase = createAdminClient();
  // biome-ignore lint/suspicious/noExplicitAny: Dynamic payload builder
  const payload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) payload.title = input.title.trim();
  if (input.slug !== undefined) payload.slug = input.slug.trim() || slugify(input.title || "");
  if (input.description !== undefined) payload.description = input.description?.trim() || null;
  if (input.cover_image !== undefined) payload.cover_image = input.cover_image?.trim() || null;
  if (input.is_published !== undefined) payload.is_published = input.is_published;

  const { data, error } = await adminSupabase
    .from("collections")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Collection;
}

export async function deleteCollectionAdmin(id: string): Promise<void> {
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.from("collections").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Sync ordered articles into a collection. */
export async function setCollectionArticlesAdmin(
  collectionId: string,
  articleIdsInOrder: string[]
): Promise<void> {
  const adminSupabase = createAdminClient();

  // Delete current items
  const { error: deleteError } = await adminSupabase
    .from("collection_articles")
    .delete()
    .eq("collection_id", collectionId);
  if (deleteError) throw new Error(deleteError.message);

  if (articleIdsInOrder.length === 0) return;

  const rows = articleIdsInOrder.map((article_id, idx) => ({
    collection_id: collectionId,
    article_id,
    position: idx + 1,
  }));

  const { error: insertError } = await adminSupabase.from("collection_articles").insert(rows);

  if (insertError) throw new Error(insertError.message);
}
