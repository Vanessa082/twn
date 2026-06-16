// ─────────────────────────────────────────────────────────────────────────────
// Shared TypeScript types for The Notebook of a Tech Woman (TWN)
// Single source of truth — import from here, never redefine elsewhere.
// ─────────────────────────────────────────────────────────────────────────────

// ── Article ──────────────────────────────────────────────────────────────────

export type ArticleStatus = "draft" | "published" | "scheduled";

export type ArticleCategory =
  | "technology"
  | "leadership"
  | "learning"
  | "community"
  | "reflections";

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  category: ArticleCategory;
  status: ArticleStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  reading_time?: number; // computed, minutes
}

/** Minimal projection used in article lists (no full content) */
export type ArticleCard = Omit<Article, "content">;

/** Payload for creating a new article */
export type CreateArticleInput = Omit<
  Article,
  "id" | "created_at" | "updated_at" | "reading_time"
>;

/** Payload for updating an existing article */
export type UpdateArticleInput = Partial<CreateArticleInput>;

// ── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: ArticleCategory;
}

// ── Subscriber ───────────────────────────────────────────────────────────────

export interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export interface SubscribeInput {
  email: string;
}

// ── API Responses ─────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: string;
}

export type ApiResult<T> = ApiSuccess<T> | ApiError;

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Search ────────────────────────────────────────────────────────────────────

export interface SearchResult {
  article: ArticleCard;
  score: number;
}

// ── Navigation ────────────────────────────────────────────────────────────────

export interface NavLink {
  label: string;
  href: string;
}
