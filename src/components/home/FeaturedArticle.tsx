"use client";

/**
 * FeaturedArticle — Matches design image exactly.
 *
 * Layout: "FEATURED NOTE" label → 2-column grid
 *   Left (col-span-7): large dark cover image, 16:9, rounded-[16px]
 *   Right (col-span-5): TECHNOLOGY · 8 min read | title (42px serif) | excerpt | date | READ NOTE →
 *
 * Gap between columns: 60px
 * Whitespace: massive — no cramming
 */

import ImageWithSkeleton from "@/components/ui/ImageWithSkeleton";
import type { Article } from "@/types";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface FeaturedArticleProps {
  article: Article;
}

export default function FeaturedArticle({ article }: FeaturedArticleProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const formatDate = (d: string | null) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const imageStyle: React.CSSProperties = {
    transform: inView ? "scale(1)" : "scale(1.06)",
    opacity: inView ? 1 : 0,
    transition:
      "transform 1.2s cubic-bezier(0.16,1,0.3,1), opacity 0.9s cubic-bezier(0.16,1,0.3,1)",
  };

  const text = (delay: number): React.CSSProperties => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0)" : "translateY(18px)",
    transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  });

  return (
    <section
      ref={sectionRef}
      id="featured-note"
      aria-label="Featured article"
      className="py-14 sm:py-20 border-b border-[#ECECEC] bg-background"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-20">
        {/* "FEATURED NOTE" label */}
        <span
          className="text-[9px] font-sans font-bold uppercase tracking-[0.28em] text-[#9B9B9B] block mb-7"
          style={text(0)}
        >
          Featured Note
        </span>

        {/* 2-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Cover image — col-span-7, aspect 16/9, 16px radius, overflow clip */}
          <Link
            href={`/articles/${article.slug}`}
            className="lg:col-span-7 block relative aspect-[16/9] w-full overflow-hidden bg-neutral-900 rounded-[16px] group"
            data-cursor="link"
            aria-label={article.title}
          >
            {article.cover_image ? (
              <div className="absolute inset-0" style={imageStyle}>
                <ImageWithSkeleton
                  src={article.cover_image}
                  alt={article.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center" style={imageStyle}>
                <span className="font-serif font-black text-7xl tracking-widest text-white/10">
                  TWN
                </span>
              </div>
            )}
          </Link>

          {/* Right text panel — col-span-5 */}
          <div className="lg:col-span-5 flex flex-col gap-5 lg:pt-2">
            {/* Meta: CATEGORY · reading time */}
            <div
              className="flex items-center gap-2 text-[9px] font-sans font-bold uppercase tracking-[0.22em]"
              style={text(100)}
            >
              <span className="text-foreground">{article.category}</span>
              <span className="text-[#CCCCCC]">·</span>
              <span className="text-[#6B6B6B]">{article.reading_time ?? 1} min read</span>
            </div>

            {/* Title — Playfair, ~42px */}
            <h2
              className="font-serif font-bold leading-[1.12] tracking-[-0.01em] text-foreground"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", ...text(180) }}
            >
              <Link
                href={`/articles/${article.slug}`}
                className="hover:opacity-75 transition-opacity"
                data-cursor="link"
              >
                {article.title}
              </Link>
            </h2>

            {/* Excerpt — 2 lines max */}
            <p className="text-sm text-[#6B6B6B] leading-[1.7] line-clamp-3" style={text(260)}>
              {article.excerpt}
            </p>

            {/* Date + Read Note */}
            <div
              className="flex items-center justify-between pt-5 border-t border-[#ECECEC]"
              style={text(340)}
            >
              <span className="text-[11px] text-[#9B9B9B]">{formatDate(article.published_at)}</span>
              <Link
                href={`/articles/${article.slug}`}
                data-cursor="link"
                className="group inline-flex items-center gap-2 text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-foreground/60 hover:text-foreground transition-colors"
              >
                <span>Read Note</span>
                <span className="group-hover:translate-x-1 transition-transform inline-block">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
