"use client";

import type {
  Article,
  Collection,
  NotebookEntry,
  SearchResultType,
  SharedPage,
  UnifiedSearchResult,
} from "@/types";
import { BookOpen, Layers, MessageSquareQuote, Search, Sparkles, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo, useState } from "react";

interface SearchClientProps {
  articles: Article[];
  notebookEntries: NotebookEntry[];
  sharedPages: SharedPage[];
  collections: Collection[];
}

export default function SearchClient({
  articles = [],
  notebookEntries = [],
  sharedPages = [],
  collections = [],
}: SearchClientProps) {
  const t = useTranslations("search");
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<SearchResultType | "all">("all");

  // ── Normalize & Index All Content Types ─────────────────────────────────────
  const unifiedIndex = useMemo<UnifiedSearchResult[]>(() => {
    const items: UnifiedSearchResult[] = [];

    // 1. Articles
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

    // 2. Notebook Entries
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

    // 3. Shared Pages (Community Reflections)
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

    // 4. Collections
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
  }, [articles, notebookEntries, sharedPages, collections]);

  // ── Filtered Search Results ─────────────────────────────────────────────────
  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    return unifiedIndex.filter((item) => {
      // Type tab filter check
      if (activeFilter !== "all" && item.type !== activeFilter) return false;

      // Text matching
      const matchesTitle = item.title.toLowerCase().includes(normalizedQuery);
      const matchesExcerpt = item.excerpt.toLowerCase().includes(normalizedQuery);
      const matchesBadge = item.categoryOrBadge?.toLowerCase().includes(normalizedQuery);

      return matchesTitle || matchesExcerpt || matchesBadge;
    });
  }, [query, activeFilter, unifiedIndex]);

  // Counts per tab
  const counts = useMemo(() => {
    const norm = query.trim().toLowerCase();
    if (!norm) return { all: 0, article: 0, notebook: 0, shared_page: 0, collection: 0 };

    const matches = unifiedIndex.filter(
      (item) =>
        item.title.toLowerCase().includes(norm) ||
        item.excerpt.toLowerCase().includes(norm) ||
        item.categoryOrBadge?.toLowerCase().includes(norm)
    );

    return {
      all: matches.length,
      article: matches.filter((i) => i.type === "article").length,
      notebook: matches.filter((i) => i.type === "notebook").length,
      shared_page: matches.filter((i) => i.type === "shared_page").length,
      collection: matches.filter((i) => i.type === "collection").length,
    };
  }, [query, unifiedIndex]);

  const getTypeBadge = (type: SearchResultType) => {
    switch (type) {
      case "article":
        return {
          label: "Article",
          icon: <BookOpen className="h-3 w-3" />,
          className: "bg-muted-gold/10 text-muted-gold border-muted-gold/20",
        };
      case "notebook":
        return {
          label: "Thought",
          icon: <Sparkles className="h-3 w-3" />,
          className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        };
      case "shared_page":
        return {
          label: "Community",
          icon: <MessageSquareQuote className="h-3 w-3" />,
          className:
            "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        };
      case "collection":
        return {
          label: "Collection",
          icon: <Layers className="h-3 w-3" />,
          className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        };
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Search Input Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("placeholder")}
          aria-label={t("placeholder")}
          className="w-full h-14 pl-12 pr-10 rounded-xl border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all text-base shadow-sm"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content Type Filter Tabs */}
      {query.trim() !== "" && (
        <div className="flex items-center justify-center gap-2 flex-wrap border-b border-border pb-4">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeFilter === "all"
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("filterAll")} ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("article")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeFilter === "article"
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("filterArticles")} ({counts.article})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("notebook")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeFilter === "notebook"
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("filterNotebook")} ({counts.notebook})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("shared_page")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeFilter === "shared_page"
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("filterSharedPages")} ({counts.shared_page})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("collection")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeFilter === "collection"
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("filterCollections")} ({counts.collection})
          </button>
        </div>
      )}

      {/* Results Section */}
      <div>
        {query.trim() === "" ? (
          /* Empty Search Prompt */
          <div className="text-center py-16 text-muted-foreground space-y-3">
            <div className="p-4 rounded-full bg-muted text-muted-foreground w-fit mx-auto">
              <Search className="h-6 w-6" />
            </div>
            <p className="text-sm max-w-md mx-auto">{t("empty")}</p>
          </div>
        ) : searchResults.length > 0 ? (
          /* Search Results List */
          <div className="space-y-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">
              {t("results", { count: searchResults.length, query })}
            </p>

            <div className="space-y-4">
              {searchResults.map((item) => {
                const badge = getTypeBadge(item.type);
                return (
                  <Link
                    key={item.id}
                    href={item.url}
                    className="block p-5 rounded-xl border border-border bg-card hover:border-muted-gold/50 transition-all hover:shadow-md group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.className}`}
                        >
                          {badge.icon} {badge.label}
                        </span>

                        {item.categoryOrBadge && (
                          <span className="text-[11px] text-muted-foreground capitalize font-semibold">
                            {item.categoryOrBadge}
                          </span>
                        )}
                      </div>

                      <h2 className="text-lg font-serif font-bold text-foreground group-hover:text-muted-gold transition-colors">
                        {item.title}
                      </h2>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.excerpt}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          /* No Results Found */
          <div className="text-center py-16 text-muted-foreground space-y-4">
            <div className="p-4 rounded-full bg-muted text-muted-foreground w-fit mx-auto">
              <BookOpen className="h-6 w-6" />
            </div>
            <p className="text-sm">{t("noResults", { query })}</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveFilter("all");
              }}
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Clear Search Query
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
