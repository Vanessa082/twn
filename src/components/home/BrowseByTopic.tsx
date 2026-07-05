"use client";

/**
 * BrowseByTopic — 5 equal tiles matching design image exactly.
 *
 * Section header: "BROWSE BY TOPIC" label (tiny caps) | "EXPLORE ALL TOPICS →"
 * Grid: 5 equal tiles, each 170px min-height, 16px radius
 * Tile: white bg, border #ECECEC, hover → border darkens, icon moves up 3px
 * Icon: centered, 28px, line-weight 1.5
 * Title: serif, small
 * Description: tiny gray
 */

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const CATEGORIES = [
  {
    key: "technology" as const,
    description: "Architecture, scale, quality, engineering at scale.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    key: "leadership" as const,
    description: "Mentoring teams, driving culture, leading with empathy.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    key: "learning" as const,
    description: "Techniques, methodologies, and lifelong learning guides.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
        <path d="M12 7v14" />
        <path d="M3 18a1 1 0 01-1-1V4a1 1 0 011-1h5a4 4 0 014 4 4 4 0 014-4h5a1 1 0 011 1v13a1 1 0 01-1 1h-6a3 3 0 00-3 3 3 3 0 00-3-3z" />
      </svg>
    ),
  },
  {
    key: "community" as const,
    description: "Open source, local tech groups, and ecosystem support.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
  {
    key: "reflections" as const,
    description: "Society, the African tech landscape, and career growth.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
];

export default function BrowseByTopic() {
  const t = useTranslations("home.categories");
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="browse-by-topic"
      aria-label="Browse by topic"
      className="py-14 sm:py-20 bg-background border-b border-[#ECECEC]"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-20">

        {/* Header */}
        <div
          className="flex items-end justify-between mb-10"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(14px)",
            transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <div>
            <p className="text-[9px] font-sans font-bold uppercase tracking-[0.28em] text-[#9B9B9B] mb-2">
              Browse by topic
            </p>
            <h2 className="font-serif font-bold text-[2rem] sm:text-[2.4rem] tracking-tight text-foreground">
              {t("title")}
            </h2>
          </div>
          <Link
            href="/articles"
            data-cursor="link"
            className="group hidden sm:inline-flex items-center gap-1.5 text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-[#6B6B6B] hover:text-foreground transition-colors"
          >
            Explore all topics
            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </Link>
        </div>

        {/* 5-tile grid */}
        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 reveal-cards ${inView ? "in-view" : ""}`}>
          {CATEGORIES.map(({ key, description, icon }) => (
            <Link
              key={key}
              href={`/articles?category=${key}`}
              data-cursor="link"
              className="group flex flex-col gap-4 p-6 bg-white border border-[#ECECEC] rounded-[16px] min-h-[170px]
                hover:border-foreground/30 hover:-translate-y-[3px] hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)]
                transition-all duration-300"
            >
              {/* Icon — moves up 3px on hover */}
              <div className="text-[#6B6B6B] group-hover:text-foreground group-hover:-translate-y-[3px] transition-all duration-300">
                {icon}
              </div>

              {/* Label */}
              <div className="flex flex-col gap-1.5">
                <h3 className="font-serif font-bold text-[0.95rem] text-foreground">
                  {t(key)}
                </h3>
                <p className="text-[11px] text-[#9B9B9B] leading-[1.55]">
                  {description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
