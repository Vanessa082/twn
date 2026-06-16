/**
 * ARTICLE GRID COMPONENT
 *
 * 🧠 LEARNING POINT: Presentational vs. Container Components
 * This is a pure "presentational" component — it only knows how to render articles.
 * It doesn't fetch data itself; data comes in via `props` from a parent Server Component.
 *
 * Pattern:
 *   Parent Server Component (page.tsx) → fetches data → passes to ArticleGrid
 *   ArticleGrid → loops over articles → renders ArticleCard for each
 *
 * Why this separation?
 *  - ArticleGrid is reusable: we can drop it into the homepage AND the /articles page.
 *  - Testing is easy: we just pass in mock article arrays.
 *  - The component is predictable: same input → same output, every time.
 */
import type { Article } from "@/types";
import ArticleCard from "./ArticleCard";
import { useTranslations } from "next-intl";
import { BookOpen } from "lucide-react";

interface ArticleGridProps {
  articles: Article[];
}

export default function ArticleGrid({ articles }: ArticleGridProps) {
  const t = useTranslations("home.latest");

  /**
   * 🧠 LEARNING POINT: Empty State Handling (Graceful Degradation)
   * "Never assume inputs are perfect." The articles array could be empty on launch day
   * or when a category has no posts. Instead of rendering an empty broken grid,
   * we show a friendly empty-state UI with an icon and message.
   *
   * This is called an "empty state" or "zero-data state" — a key UX pattern that tells
   * the user: "Nothing is broken, there's just nothing here yet."
   */
  if (!articles || articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-border rounded-[var(--radius)] max-w-xl mx-auto my-12 bg-card text-card-foreground">
        <div className="p-4 rounded-[var(--radius)] bg-muted text-muted-foreground mb-4">
          <BookOpen className="h-8 w-8" />
        </div>
        <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
          {t("empty")}
        </p>
      </div>
    );
  }

  /**
   * 🧠 LEARNING POINT: Array.map() for Rendering Lists
   * `.map()` transforms each item in the array into a React element.
   * The `key` prop is mandatory — React uses it internally to efficiently
   * re-render only the items that changed, not the entire list.
   * Always use a stable unique identifier (like a database `id`) as the key.
   * Never use the array index as a key if the list can be reordered.
   */
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 animate-fade-up">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
