import type {
  Article,
  Collection,
  NotebookEntry,
  SearchResultType,
  SharedPage,
  UnifiedSearchResult,
} from "@/types";
import { describe, expect, it } from "vitest";

/**
 * Normalization helper mirroring SearchClient logic for headless testing.
 */
function buildUnifiedIndex(
  articles: Article[],
  notebookEntries: NotebookEntry[],
  sharedPages: SharedPage[],
  collections: Collection[]
): UnifiedSearchResult[] {
  const items: UnifiedSearchResult[] = [];

  for (const art of articles) {
    items.push({
      id: `art-${art.id}`,
      type: "article",
      title: art.title,
      excerpt: art.excerpt,
      url: `/articles/${art.slug}`,
      categoryOrBadge: art.category,
      date: art.published_at,
    });
  }

  for (const entry of notebookEntries) {
    items.push({
      id: `nb-${entry.id}`,
      type: "notebook",
      title: entry.title || "Notebook Thought",
      excerpt: entry.thought,
      url: "/notebook",
      categoryOrBadge: "Thought",
      date: entry.created_at,
    });
  }

  for (const page of sharedPages) {
    items.push({
      id: `sp-${page.id}`,
      type: "shared_page",
      title: page.title || `Reflection by ${page.author_name || "Anonymous"}`,
      excerpt: page.content,
      url: `/shared/${page.id}`,
      categoryOrBadge: page.author_name ? `By ${page.author_name}` : "Community",
      date: page.published_at || page.submitted_at,
    });
  }

  for (const col of collections) {
    items.push({
      id: `col-${col.id}`,
      type: "collection",
      title: col.title,
      excerpt: col.description || "Curated reading path & series",
      url: `/collections/${col.slug}`,
      categoryOrBadge: "Collection",
      date: col.created_at,
    });
  }

  return items;
}

function filterUnifiedResults(
  index: UnifiedSearchResult[],
  query: string,
  typeFilter: SearchResultType | "all" = "all"
): UnifiedSearchResult[] {
  const norm = query.trim().toLowerCase();
  if (!norm) return [];

  return index.filter((item) => {
    if (typeFilter !== "all" && item.type !== typeFilter) return false;

    const matchesTitle = item.title.toLowerCase().includes(norm);
    const matchesExcerpt = item.excerpt.toLowerCase().includes(norm);
    const matchesBadge = item.categoryOrBadge?.toLowerCase().includes(norm);

    return matchesTitle || matchesExcerpt || matchesBadge;
  });
}

describe("Multi-Content Search Logic", () => {
  const mockArticles: Article[] = [
    {
      id: "a1",
      slug: "react-19-server-actions",
      title: "Understanding React 19 Server Actions",
      excerpt: "Deep dive into fullstack React engineering.",
      content: "<p>Content</p>",
      cover_image: null,
      category: "technology",
      status: "published",
      reading_time: 5,
      likes_count: 10,
      seo_title: null,
      seo_description: null,
      og_image: null,
      canonical_url: null,
      published_at: "2026-07-01T00:00:00Z",
      created_at: "2026-07-01T00:00:00Z",
      updated_at: "2026-07-01T00:00:00Z",
    },
  ];

  const mockEntries: NotebookEntry[] = [
    {
      id: "n1",
      notebook_id: "default",
      title: "Daily Insight",
      thought: "Curiosity scales better than certainty in software development.",
      slug: null,
      source_article_id: null,
      is_active: true,
      priority: 1,
      display_date: null,
      created_at: "2026-07-02T00:00:00Z",
      updated_at: "2026-07-02T00:00:00Z",
    },
  ];

  const mockSharedPages: SharedPage[] = [
    {
      id: "s1",
      author_name: "Vanessa",
      title: "My First Production Release",
      content: "I shipped my first production build today. Small win, big feeling.",
      word_count: 12,
      status: "approved",
      submitted_at: "2026-07-03T00:00:00Z",
      published_at: "2026-07-03T00:00:00Z",
      updated_at: "2026-07-03T00:00:00Z",
    },
  ];

  const mockCollections: Collection[] = [
    {
      id: "c1",
      slug: "web-engineering-fundamentals",
      title: "Web Engineering Fundamentals",
      description: "A curated series on modern web development practices.",
      cover_image: null,
      is_published: true,
      created_at: "2026-07-04T00:00:00Z",
      updated_at: "2026-07-04T00:00:00Z",
    },
  ];

  const index = buildUnifiedIndex(mockArticles, mockEntries, mockSharedPages, mockCollections);

  it("builds a unified index with 4 content items", () => {
    expect(index).toHaveLength(4);
    expect(index.map((i) => i.type)).toEqual(["article", "notebook", "shared_page", "collection"]);
  });

  it("searches across articles, thoughts, community pages, and collections", () => {
    const results = filterUnifiedResults(index, "production");
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe("shared_page");
    expect(results[0].title).toContain("My First Production Release");
  });

  it("filters search results by content type tab", () => {
    const allResults = filterUnifiedResults(index, "engineering");
    expect(allResults).toHaveLength(2); // Article & Collection match

    const articleOnly = filterUnifiedResults(index, "engineering", "article");
    expect(articleOnly).toHaveLength(1);
    expect(articleOnly[0].type).toBe("article");

    const collectionOnly = filterUnifiedResults(index, "engineering", "collection");
    expect(collectionOnly).toHaveLength(1);
    expect(collectionOnly[0].type).toBe("collection");
  });

  it("returns empty array for non-matching query", () => {
    const results = filterUnifiedResults(index, "nonexistent-keyword-xyz");
    expect(results).toHaveLength(0);
  });
});
