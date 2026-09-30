"use client";

/**
 * FromTheNotebookSection — recent essays with editorial rhythm: one lead piece
 * with its cover, beside a quiet text-only list. Renders nothing without articles.
 */

import ImageWithSkeleton from "@/components/ui/ImageWithSkeleton";
import SectionHeading from "@/components/ui/SectionHeading";
import { useInView } from "@/hooks/useInView";
import type { Article } from "@/types";
import Link from "next/link";

interface FromTheNotebookSectionProps {
  articles: Article[];
}

function formatDate(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Meta({ article }: { article: Article }) {
  return (
    <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-muted-foreground">
      <span className="text-ink-accent">{article.category}</span>
      <span aria-hidden="true"> · </span>
      {article.reading_time ?? 1} min read
    </p>
  );
}

export default function FromTheNotebookSection({ articles }: FromTheNotebookSectionProps) {
  const [ref, inView] = useInView<HTMLElement>();
  const [lead, ...rest] = articles;

  if (!lead) return null;

  return (
    <section
      ref={ref}
      aria-labelledby="from-the-notebook-heading"
      className={`twn-reveal ${inView ? "is-visible" : ""} border-b border-border bg-background py-20 sm:py-28`}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-20">
        <SectionHeading
          eyebrow="Recent essays"
          title={<span id="from-the-notebook-heading">From the notebook</span>}
          action={{ label: "All notes", href: "/articles" }}
        />

        <div
          className={`grid grid-cols-1 gap-12 ${rest.length > 0 ? "lg:grid-cols-12 lg:gap-16" : ""}`}
        >
          <article className={rest.length > 0 ? "lg:col-span-7" : "max-w-3xl"}>
            <Link href={`/articles/${lead.slug}`} data-cursor="link" className="group block">
              {lead.cover_image && (
                <div className="relative mb-7 aspect-[3/2] overflow-hidden rounded-[4px] bg-muted">
                  <ImageWithSkeleton
                    src={lead.cover_image}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                  />
                </div>
              )}
              <Meta article={lead} />
              <h3
                className="mt-4 font-serif font-bold leading-[1.15] tracking-[-0.015em] text-foreground text-balance transition-opacity duration-300 group-hover:opacity-70"
                style={{ fontSize: "clamp(1.6rem, 2.6vw, 2.2rem)" }}
              >
                {lead.title}
              </h3>
              {lead.excerpt && (
                <p className="mt-4 max-w-2xl line-clamp-3 font-serif text-[1.075rem] leading-[1.7] text-muted-foreground">
                  {lead.excerpt}
                </p>
              )}
            </Link>
          </article>

          {rest.length > 0 && (
            <ol className="border-t border-foreground/80 lg:col-span-5">
              {rest.map((article) => (
                <li key={article.id} className="border-b border-border">
                  <Link
                    href={`/articles/${article.slug}`}
                    data-cursor="link"
                    className="group block py-7"
                  >
                    <Meta article={article} />
                    <h3 className="mt-3 font-serif text-[1.35rem] font-bold leading-[1.25] text-foreground text-balance transition-opacity duration-300 group-hover:opacity-70">
                      {article.title}
                    </h3>
                    {article.published_at && (
                      <time
                        dateTime={article.published_at}
                        className="mt-3 block font-quote text-base italic text-muted-foreground"
                      >
                        {formatDate(article.published_at)}
                      </time>
                    )}
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
