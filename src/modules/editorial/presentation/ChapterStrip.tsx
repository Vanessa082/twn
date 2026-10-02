/**
 * ChapterStrip — Server Component
 *
 * Editorial chapter navigation at the bottom of the homepage.
 * Categories come from the `categories` table, with seeded fallbacks.
 */

import { Eyebrow, TextLink } from "@/components/ui/SectionHeading";
import type { Category } from "@/modules/editorial/contracts";
import Link from "next/link";

interface ChapterStripProps {
  categories: Category[];
}

export default function ChapterStrip({ categories }: ChapterStripProps) {
  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="chapters-heading" className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-20">
        <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <Eyebrow>Explore by chapter</Eyebrow>
            <h2
              id="chapters-heading"
              className="mt-4 font-serif font-bold leading-[1.1] tracking-[-0.02em] text-foreground"
              style={{ fontSize: "clamp(1.9rem, 3.6vw, 2.75rem)" }}
            >
              The notebook continues.
            </h2>
          </div>
          <TextLink href="/archive">Enter the archive</TextLink>
        </div>

        <ul className="grid grid-cols-1 border-t border-border sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((cat, index) => (
            <li
              key={cat.id}
              className="border-b border-border sm:odd:border-r lg:border-r lg:last:border-r-0"
            >
              <Link
                href={`/notebook?category=${cat.slug}`}
                data-cursor="link"
                className="group flex h-full flex-col gap-3 px-1 py-7 transition-colors duration-300 hover:bg-paper-deep sm:px-6"
              >
                <span className="font-mono text-[11px] text-ink-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-serif text-xl font-bold text-foreground transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">
                  {cat.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
