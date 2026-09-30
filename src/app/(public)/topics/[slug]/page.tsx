import ArticleCard from "@/components/articles/ArticleCard";
import Pagination from "@/components/ui/Pagination";
import { Eyebrow, TextLink } from "@/components/ui/SectionHeading";
import { parsePageParam, withPageParam } from "@/lib/pagination";
import { pageMetadata } from "@/lib/seo";
import { getNotesByTagPage, getTagBySlug } from "@/lib/services/tags";
import { routes } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface TopicPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

const NOTES_PER_PAGE = 12;

export async function generateMetadata({
  params,
  searchParams,
}: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = parsePageParam((await searchParams).page);
  const tag = await getTagBySlug(slug);
  if (!tag) return { title: "Topic not found", robots: { index: false } };

  return pageMetadata({
    title: `Notes on ${tag.name}${page > 1 ? ` · Page ${page}` : ""}`,
    description: `Every note Vanessa has written about ${tag.name}, from The Notebook of a Tech Woman.`,
    path: withPageParam(routes.topic(tag.slug), page),
    eyebrow: "Topic",
  });
}

export default async function TopicPage({ params, searchParams }: TopicPageProps) {
  const { slug } = await params;
  const page = parsePageParam((await searchParams).page);
  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const result = await getNotesByTagPage(slug, { page, pageSize: NOTES_PER_PAGE });
  if (page > result.totalPages) notFound();
  const baseHref = routes.topic(tag.slug);

  return (
    <div className="bg-background pb-24 pt-16 sm:pt-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-20">
        <nav aria-label="Breadcrumb">
          <Link
            href={routes.notebook}
            className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
          >
            ← The Notebook
          </Link>
        </nav>

        <header className="mt-8 max-w-2xl border-b border-border pb-10">
          <Eyebrow>Topic</Eyebrow>
          <h1
            className="mt-5 font-serif font-bold leading-[0.98] tracking-[-0.03em] text-foreground text-balance"
            style={{ fontSize: "clamp(2.6rem, 6vw, 4.5rem)" }}
          >
            {tag.name}
          </h1>
          <p className="mt-5 font-serif text-[1.1rem] leading-[1.7] text-muted-foreground">
            {result.total > 0
              ? `${result.total} ${result.total === 1 ? "note" : "notes"} about ${tag.name}.`
              : `Nothing has been filed under ${tag.name} yet.`}
          </p>
        </header>

        {result.items.length === 0 ? (
          <div className="py-20">
            <p className="font-quote text-2xl italic text-muted-foreground">
              This topic is waiting for its first note.
            </p>
            <div className="mt-8">
              <TextLink href={routes.notebook}>Read every note instead</TextLink>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={result.totalPages}
              hrefForPage={(p) => withPageParam(baseHref, p)}
              label={`notes about ${tag.name}`}
              className="mt-16"
            />
          </>
        )}
      </div>
    </div>
  );
}
