import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";
import {
  buildSharedPageSlug,
  getApprovedSharedPageBySlug,
  getApprovedSharedPages,
} from "@/modules/community";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 60;

interface SharedPageDetailProps {
  params: Promise<{ slug: string }>;
}

function formatDate(dateString: string | null) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function estimateReadingMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function generateMetadata({ params }: SharedPageDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getApprovedSharedPageBySlug(slug);
  if (!page) return { title: "Shared page not found", robots: { index: false } };

  const title = page.title?.trim() || `A page from ${page.author_name}`;
  const text = page.content.replace(/\s+/g, " ").trim();
  return pageMetadata({
    title,
    description: text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text,
    path: `/pages/${buildSharedPageSlug(page)}`,
    type: "article",
    publishedTime: page.published_at,
    eyebrow: "Shared page",
  });
}

export default async function SharedPageDetailPage({ params }: SharedPageDetailProps) {
  const { slug } = await params;
  const page = await getApprovedSharedPageBySlug(slug);
  if (!page) notFound();

  const related = (await getApprovedSharedPages())
    .filter((item) => item.id !== page.id)
    .slice(0, 3);

  const title = page.title?.trim() || null;
  const minutes = estimateReadingMinutes(page.content);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <article className="mx-auto max-w-7xl px-5 py-12 sm:px-10 sm:py-20 lg:px-20">
        <div className="max-w-3xl">
          <Link
            href={routes.community}
            className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Shared Pages
          </Link>

          <header className="mt-10 mb-12 border-b border-border pb-10">
            <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-balance sm:text-5xl">
              {title ?? `A page from ${page.author_name}`}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">By {page.author_name}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={page.published_at || page.submitted_at}>
                {formatDate(page.published_at || page.submitted_at)}
              </time>
              <span aria-hidden="true">·</span>
              <span>{minutes} min read</span>
            </div>
          </header>

          <div className="font-quote text-xl sm:text-[1.35rem] leading-[1.75] text-foreground whitespace-pre-wrap">
            {page.content}
          </div>

          <section className="mt-16 pt-10 border-t border-border">
            <h2 className="text-[10px] font-sans font-bold uppercase tracking-[0.22em] text-muted-foreground mb-5">
              Other Pages
            </h2>
            {related.length === 0 ? (
              <Link
                href={routes.community}
                className="text-sm text-foreground underline-offset-4 hover:underline"
              >
                Leave a page of your own →
              </Link>
            ) : (
              <ul className="flex flex-col gap-3">
                {related.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/pages/${buildSharedPageSlug(item)}`}
                      className="text-sm text-foreground hover:opacity-70 transition-opacity"
                    >
                      {item.title?.trim() || item.content.slice(0, 72)}
                      {(!item.title || item.title.trim().length === 0) && item.content.length > 72
                        ? "…"
                        : ""}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </article>
    </div>
  );
}
