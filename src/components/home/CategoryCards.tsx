"use client";

/**
 * CategoryCards — Reimagined as an editorial "Table of Contents" row list.
 *
 * Instead of cards or grids, this uses the premium publication pattern:
 * full-width rows with large numbers, bold category names, and subtle
 * descriptions — like a magazine's "What's Inside" section.
 *
 * Design references: The Guardian, Le Monde, Monocle, Framer editorial templates.
 *
 * On hover, the entire row inverts — a bold, confident interaction that
 * feels far more intentional than a shadow or color change.
 */

import Link from "next/link";
import { useTranslations } from "next-intl";
import ScrollReveal from "@/components/ui/ScrollReveal";

const categories = [
  {
    key: "technology" as const,
    num: "01",
    description: "Software architecture, code quality, engineering at scale.",
  },
  {
    key: "leadership" as const,
    num: "02",
    description: "Mentoring teams, driving culture, and leading with empathy.",
  },
  {
    key: "learning" as const,
    num: "03",
    description: "Techniques, methodologies, and lifelong learning guides.",
  },
  {
    key: "community" as const,
    num: "04",
    description: "Open source, local tech groups, and ecosystem support.",
  },
  {
    key: "reflections" as const,
    num: "05",
    description: "Society, the African tech landscape, and career growth.",
  },
];

export default function CategoryCards() {
  const t = useTranslations("home.categories");

  return (
    <section className="py-20 bg-background border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <ScrollReveal className="mb-0">
          <div className="flex items-end justify-between pb-6 mb-0">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-muted-foreground mb-2">
                Explore
              </p>
              <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-foreground">
                {t("title")}
              </h2>
            </div>
            <Link
              href="/articles"
              className="hidden sm:inline-flex text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors items-center gap-1.5"
            >
              All articles
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </ScrollReveal>

        {/* Editorial row list */}
        <div className="border-t border-border">
          {categories.map(({ key, num, description }, i) => (
            <ScrollReveal key={key} delay={i * 60}>
              <Link
                href={`/articles?category=${key}`}
                className="group flex items-center justify-between border-b border-border py-6 sm:py-7 gap-6 hover:bg-foreground hover:text-background transition-all duration-300 cursor-pointer px-0 -mx-0"
              >
                {/* Left: number */}
                <span className="font-serif font-black text-3xl sm:text-4xl text-foreground/15 group-hover:text-background/15 transition-colors duration-300 w-14 shrink-0 select-none">
                  {num}
                </span>

                {/* Center: name + description */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl sm:text-2xl font-serif font-black tracking-tight leading-tight mb-0.5 uppercase">
                    {t(key)}
                  </h3>
                  <p className="text-xs text-muted-foreground group-hover:text-background/60 transition-colors duration-300 line-clamp-1">
                    {description}
                  </p>
                </div>

                {/* Right: arrow */}
                <div className="shrink-0 flex items-center">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-foreground/15 group-hover:border-background/25 text-muted-foreground group-hover:text-background transition-all duration-300 group-hover:translate-x-1">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
}
