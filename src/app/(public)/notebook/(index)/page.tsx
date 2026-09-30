import ArticleGrid from "@/components/articles/ArticleGrid";
import Pagination from "@/components/ui/Pagination";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { parsePageParam, withPageParam } from "@/lib/pagination";
import { getPublishedNotesPage } from "@/lib/services/articles";
import { routes } from "@/lib/site";
import { articleCategoryEnum } from "@/lib/validation/schemas";
import type { ArticleCategory } from "@/types";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ArticlesPageProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export const revalidate = 60; // ISR validation every minute

const NOTES_PER_PAGE = 12;

function parseCategory(value: string | undefined): ArticleCategory | undefined {
  const parsed = articleCategoryEnum.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export async function generateMetadata({ searchParams }: ArticlesPageProps): Promise<Metadata> {
  const params = await searchParams;
  const category = parseCategory(params.category);
  const page = parsePageParam(params.page);
  const label = category ? category.charAt(0).toUpperCase() + category.slice(1) : null;
  const base = category ? routes.notebookTopic(category) : routes.notebook;
  const pageSuffix = page > 1 ? ` · Page ${page}` : "";
  return {
    title: `${label ? `${label} notes` : "The Notebook"}${pageSuffix}`,
    description: label
      ? `Every note Vanessa has written on ${category}: essays and reflections from a life in tech.`
      : "Every note in the notebook: essays and reflections on writing code, leading teams and building a life in technology.",
    alternates: { canonical: withPageParam(base, page) },
  };
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const resolvedParams = await searchParams;
  const activeCategory = parseCategory(resolvedParams.category);
  const page = parsePageParam(resolvedParams.page);

  const t = await getTranslations("articles");

  const result = await getPublishedNotesPage({
    page,
    pageSize: NOTES_PER_PAGE,
    category: activeCategory,
  });
  if (page > result.totalPages) notFound();
  const articles = result.items;
  const baseHref = activeCategory ? routes.notebookTopic(activeCategory) : routes.notebook;
  const firstShown = (page - 1) * NOTES_PER_PAGE + 1;
  const lastShown = firstShown + articles.length - 1;

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
                href={cat.value ? routes.notebookTopic(cat.value) : routes.notebook}
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
          <>
            {result.totalPages > 1 && (
              <p className="-mt-6 mb-10 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Notes {firstShown}–{lastShown} of {result.total}
              </p>
            )}
            <ArticleGrid articles={articles} />
            <Pagination
              page={page}
              totalPages={result.totalPages}
              hrefForPage={(p) => withPageParam(baseHref, p)}
              label="notes"
              className="mt-16"
            />
          </>
        ) : (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl max-w-md mx-auto">
            <p className="text-muted-foreground text-sm mb-4">{t("noArticles")}</p>
            <Link
              href="/notebook"
              className="text-xs font-semibold text-foreground underline underline-offset-4"
            >
              See every note
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
