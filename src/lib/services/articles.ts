import { createClient } from "@/lib/db/server";
import { pageRange, totalPagesFor } from "@/lib/pagination";
import { calculateReadingTime } from "@/lib/utils/reading-time";
import type { Article, ArticleCategory, PaginatedResult } from "@/types";
import { FALLBACK_ARTICLES } from "./fallback-articles";

// ── Database Row Type ────────────────────────────────────────────────────────

export interface DatabaseArticleRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string | null;
  cover_image: string | null;
  category: string;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  likes_count?: number;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image?: string | null;
  canonical_url?: string | null;
}

/** Maps raw database row to our clean Article type, adding calculated fields */
export function mapToArticle(row: DatabaseArticleRow): Article {
  const content = row.content || "";
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: content,
    cover_image: row.cover_image,
    category: row.category as ArticleCategory,
    status: row.status as Article["status"],
    published_at: row.published_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    reading_time: calculateReadingTime(content),
    likes_count: row.likes_count || 0,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    og_image: row.og_image,
    canonical_url: row.canonical_url,
  };
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Fetching Data via Services (Separation of Concerns)
 * Instead of making inline database queries directly inside React components, we delegate
 * data access to this dedicated Service Layer.
 */
export async function getLatestArticles(limit = 10): Promise<Article[]> {
  const safeLimit = Math.max(1, Math.min(limit, 100));

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(safeLimit);

    if (error) {
      // Only fall back when DB is genuinely unreachable
      console.warn(
        "[getLatestArticles] Database error, falling back to local seed:",
        error.message
      );
      return FALLBACK_ARTICLES.slice(0, safeLimit);
    }

    // Return real data   empty array when DB has no published articles yet
    return data ? (data as DatabaseArticleRow[]).map(mapToArticle) : [];
  } catch (error) {
    console.warn("[getLatestArticles] Service error, falling back to local seed:", error);
    return FALLBACK_ARTICLES.slice(0, safeLimit);
  }
}

interface NotesPageQuery {
  page: number;
  pageSize: number;
  category?: ArticleCategory;
}

/** One page of published notes, newest first, with the total for pagination. */
export async function getPublishedNotesPage({
  page,
  pageSize,
  category,
}: NotesPageQuery): Promise<PaginatedResult<Article>> {
  const size = Math.max(1, Math.min(pageSize, 48));
  const { from, to } = pageRange(page, size);
  const build = (items: Article[], total: number): PaginatedResult<Article> => ({
    items,
    total,
    page,
    pageSize: size,
    totalPages: totalPagesFor(total, size),
  });

  try {
    const supabase = await createClient();
    let query = supabase
      .from("articles")
      .select("*", { count: "exact" })
      .eq("status", "published")
      .lte("published_at", new Date().toISOString());
    if (category) query = query.eq("category", category);
    const { data, error, count } = await query
      .order("published_at", { ascending: false })
      .range(from, to);

    // Asking past the last page is an error in PostgREST; report it as empty.
    if (error?.code === "PGRST103") return build([], count ?? 0);
    if (error) throw error;
    return build(((data ?? []) as DatabaseArticleRow[]).map(mapToArticle), count ?? 0);
  } catch (error) {
    console.warn("[getPublishedNotesPage] Falling back to local seed:", error);
    const seed = category
      ? FALLBACK_ARTICLES.filter((a) => a.category === category)
      : FALLBACK_ARTICLES;
    return build(seed.slice(from, to + 1), seed.length);
  }
}

/**
 * Fetches a single published article by its slug.
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!slug || typeof slug !== "string") return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .maybeSingle();

    if (error) {
      // Only fallback on DB error
      console.warn("[getArticleBySlug] Database error, falling back to local seed:", error.message);
      return FALLBACK_ARTICLES.find((a) => a.slug === slug) || null;
    }

    // Return the mapping or null if not found
    return data ? mapToArticle(data as DatabaseArticleRow) : null;
  } catch (error) {
    console.warn("[getArticleBySlug] Service error, falling back to local seed:", error);
    return FALLBACK_ARTICLES.find((a) => a.slug === slug) || null;
  }
}

export interface PublishedNoteRef {
  slug: string;
  updated_at: string;
  published_at: string | null;
}

/**
 * Slugs of every published note for the sitemap. Never falls back to seed
 * content: an unreachable database must not advertise URLs that do not exist.
 */
export async function getPublishedNoteRefs(): Promise<PublishedNoteRef[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select("slug, updated_at, published_at")
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(5000);
    if (error) return [];
    return (data ?? []) as PublishedNoteRef[];
  } catch {
    return [];
  }
}

/**
 * Toggles (increments or decrements) the likes_count of an article in the database.
 * Uses createAdminClient to bypass RLS.
 */
export async function toggleArticleLike(slug: string, increment: boolean): Promise<number> {
  if (!slug || typeof slug !== "string") {
    throw new Error("Invalid article slug.");
  }

  const { createAdminClient } = await import("@/lib/db/server");
  const adminSupabase = createAdminClient();

  // 1. Fetch current likes_count
  const { data, error } = await adminSupabase
    .from("articles")
    .select("id, likes_count")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    throw new Error(`Article not found: ${error?.message || ""}`);
  }

  // 2. Compute new count
  const newCount = Math.max(0, (data.likes_count || 0) + (increment ? 1 : -1));

  // 3. Update in database
  const { error: updateErr } = await adminSupabase
    .from("articles")
    .update({ likes_count: newCount })
    .eq("id", data.id);

  if (updateErr) {
    throw new Error(`Failed to update like count: ${updateErr.message}`);
  }

  return newCount;
}

// Re-export Admin Services for backward compatibility and clean importing
export * from "./articles-admin";
