"use client";

/**
 * LatestNotesSection — 3-column, 2-row grid. Matches design image exactly.
 *
 * Section header: "Latest Notes" (serif left) | "VIEW ALL ARTICLES →" (tiny right)
 * Cards: white bg, 14px radius, subtle border, fixed image height 220px
 * Meta: CATEGORY · X min read (tiny uppercase)
 * Title: Playfair ~28px
 * Excerpt: 2-line clamp
 * Hover: image zooms 1.03x, card lifts 4px, shadow
 */

import ImageWithSkeleton from "@/components/ui/ImageWithSkeleton";
import type { Article } from "@/types";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface LatestNotesSectionProps {
  articles: Article[];
}

export default function LatestNotesSection({ articles }: LatestNotesSectionProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const formatDate = (d: string | null) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (articles.length === 0) return null;

  return (
    <section id="latest-notes" className="py-14 sm:py-20 bg-background border-b border-border">
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-20">
        {/* Section header */}
        <div className="flex items-baseline justify-between mb-10">
          <h2 className="font-serif font-bold text-[2rem] sm:text-[2.4rem] tracking-tight text-foreground">
            Latest Notes
          </h2>
          <Link
            href="/articles"
            data-cursor="link"
            className="group hidden sm:inline-flex items-center gap-1.5 text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>View All Articles</span>
            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </Link>
        </div>

        {/* 3-column grid */}
        <div
          ref={gridRef}
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-9 reveal-cards ${inView ? "in-view" : ""}`}
        >
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              data-cursor="link"
              className="group flex flex-col bg-card border border-[#F1F1F1] rounded-[14px] overflow-hidden
                hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.07)]
                transition-all duration-300"
            >
              {/* Cover image — fixed 220px height */}
              <div className="relative h-[220px] w-full overflow-hidden bg-neutral-100 flex-shrink-0">
                {article.cover_image ? (
                  <ImageWithSkeleton
                    src={article.cover_image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                    <span className="font-serif font-black text-4xl tracking-widest text-neutral-200">
                      TWN
                    </span>
                  </div>
                )}
              </div>

              {/* Card body */}
              <div className="flex flex-col gap-3 p-6">
                {/* Category · reading time */}
                <div className="flex items-center gap-2 text-[9px] font-sans font-bold uppercase tracking-[0.22em]">
                  <span className="text-foreground">{article.category}</span>
                  <span className="text-muted">·</span>
                  <span className="text-muted-foreground">
                    {article.reading_time ?? 1} min read
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-serif font-bold text-[1.35rem] leading-[1.2] tracking-tight text-foreground line-clamp-2">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-[13px] text-muted-foreground leading-[1.65] line-clamp-2 flex-1">
                  {article.excerpt}
                </p>

                {/* Date */}
                <span className="text-[11px] text-muted-foreground/70 mt-1">
                  {formatDate(article.published_at)}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile "View All" */}
        <div className="sm:hidden mt-8 text-center">
          <Link
            href="/articles"
            data-cursor="link"
            className="text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground transition-colors"
          >
            View All Articles →
          </Link>
        </div>
      </div>
    </section>
  );
}
