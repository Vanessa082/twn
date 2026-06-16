"use client";

import { useState, useMemo } from "react";
import type { Article } from "@/types";
import ArticleCard from "@/components/articles/ArticleCard";
import { Search, BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";

interface SearchClientProps {
  articles: Article[];
}

export default function SearchClient({ articles }: SearchClientProps) {
  const t = useTranslations("search");
  const [query, setQuery] = useState("");

  // Clean, high-performance local fuzzy search
  const filteredArticles = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return [];

    return articles.filter((article) => {
      return (
        article.title.toLowerCase().includes(cleanQuery) ||
        article.excerpt.toLowerCase().includes(cleanQuery) ||
        article.category.toLowerCase().includes(cleanQuery)
      );
    });
  }, [query, articles]);

  return (
    <div className="space-y-12">
      {/* Search Input Bar */}
      <div className="relative max-w-xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("placeholder")}
          className="w-full h-14 pl-12 pr-4 rounded-xl border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all text-base shadow-sm"
          autoFocus
        />
      </div>

      {/* Results Section */}
      <div>
        {query.trim() === "" ? (
          /* Empty Search Prompt */
          <div className="text-center py-16 text-muted-foreground">
            <div className="p-4 rounded-full bg-muted text-muted-foreground w-fit mx-auto mb-4">
              <Search className="h-6 w-6" />
            </div>
            <p className="text-sm">{t("empty")}</p>
          </div>
        ) : filteredArticles.length > 0 ? (
          /* Search Results Grid */
          <div className="space-y-8">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">
              {t("results", { count: filteredArticles.length, query })}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        ) : (
          /* No Results Found */
          <div className="text-center py-16 text-muted-foreground">
            <div className="p-4 rounded-full bg-muted text-muted-foreground w-fit mx-auto mb-4">
              <BookOpen className="h-6 w-6" />
            </div>
            <p className="text-sm">
              {t("noResults", { query })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
