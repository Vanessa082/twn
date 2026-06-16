import { getLatestArticles, getArticlesByCategory } from "@/lib/services/articles";
import ArticleGrid from "@/components/articles/ArticleGrid";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ArticleCategory } from "@/types";

interface ArticlesPageProps {
  searchParams: Promise<{ category?: string }>;
}

export const revalidate = 60; // ISR validation every minute

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  // 1. Resolve searchParams (required in Next.js 15)
  const resolvedParams = await searchParams;
  const activeCategory = resolvedParams.category as ArticleCategory | undefined;

  const t = await getTranslations("articles");

  // 2. Fetch data based on active category filter
  const articles = activeCategory
    ? await getArticlesByCategory(activeCategory, 50)
    : await getLatestArticles(50);

  const categories: { label: string; value: ArticleCategory | "" }[] = [
    { label: "All Notes", value: "" },
    { label: "Technology", value: "technology" },
    { label: "Leadership", value: "leadership" },
    { label: "Learning", value: "learning" },
    { label: "Community", value: "community" },
    { label: "Reflections", value: "reflections" },
  ];

  return (
    <div className="py-16 sm:py-24 bg-background transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-foreground mb-4">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Reflections and records on writing code, leading teams, and building technology.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-16">
          {categories.map((cat) => {
            const isActive =
              (cat.value === "" && !activeCategory) || cat.value === activeCategory;
            return (
              <Link
                key={cat.label}
                href={cat.value ? `/articles?category=${cat.value}` : "/articles"}
                className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 border shadow-xs ${
                  isActive
                    ? "bg-deep-navy text-white border-deep-navy dark:bg-muted-gold dark:text-charcoal-black dark:border-muted-gold"
                    : "bg-card text-muted-foreground border-border hover:border-muted-gold hover:text-muted-gold"
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>

        {/* Results */}
        {articles.length > 0 ? (
          <ArticleGrid articles={articles} />
        ) : (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl max-w-md mx-auto">
            <p className="text-muted-foreground text-sm mb-4">
              {t("noArticles")}
            </p>
            <Link
              href="/articles"
              className="text-xs font-bold text-deep-navy dark:text-muted-gold hover:underline"
            >
              Reset Filters
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
