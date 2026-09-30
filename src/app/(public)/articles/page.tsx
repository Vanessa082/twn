import ArticleGrid from "@/components/articles/ArticleGrid";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { getArticlesByCategory, getLatestArticles } from "@/lib/services/articles";
import type { ArticleCategory } from "@/types";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

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
    <div className="bg-background pb-24 pt-16 sm:pt-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-20">
        <div className="max-w-2xl">
          <Eyebrow>All notes</Eyebrow>
          <h1
            className="mt-5 font-serif font-bold leading-[0.96] tracking-[-0.03em] text-foreground"
            style={{ fontSize: "clamp(2.8rem, 6vw, 4.5rem)" }}
          >
            {t("title")}
          </h1>
          <p className="mt-5 max-w-lg font-serif text-[1.1rem] leading-[1.7] text-muted-foreground">
            {t("description")}
          </p>
        </div>

        <nav
          aria-label="Filter notes by chapter"
          className="mb-14 mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-6"
        >
          {categories.map((cat) => {
            const isActive = (cat.value === "" && !activeCategory) || cat.value === activeCategory;
            return (
              <Link
                key={cat.label}
                href={cat.value ? `/articles?category=${cat.value}` : "/articles"}
                aria-current={isActive ? "page" : undefined}
                data-active={isActive ? "true" : undefined}
                className={`nav-ink-link text-[11px] font-sans font-semibold uppercase tracking-[0.2em] transition-colors ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </nav>

        {/* Results */}
        {articles.length > 0 ? (
          <ArticleGrid articles={articles} />
        ) : (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl max-w-md mx-auto">
            <p className="text-muted-foreground text-sm mb-4">{t("noArticles")}</p>
            <Link
              href="/articles"
              className="text-xs font-semibold text-foreground underline underline-offset-4"
            >
              Reset Filters
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
