"use client";

/**
 * FeaturedNote — one essay given room: a large cover beside a quiet reading panel,
 * under the current volume (season) of the notebook.
 */

import ImageWithSkeleton from "@/components/ui/ImageWithSkeleton";
import { Eyebrow, TextLink } from "@/components/ui/SectionHeading";
import { useInView } from "@/hooks/useInView";
import type { Note } from "@/modules/editorial/contracts";
import Link from "next/link";

export interface NotebookVolume {
  label: string;
  season: string;
  theme: string;
}

interface FeaturedNoteProps {
  note: Note;
  volume: NotebookVolume;
}

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function FeaturedNote({ note, volume }: FeaturedNoteProps) {
  const [ref, inView] = useInView<HTMLElement>();

  const imageStyle: React.CSSProperties = {
    transform: inView ? "scale(1)" : "scale(1.04)",
    transition: "transform 1.4s cubic-bezier(0.16,1,0.3,1)",
  };

  const href = `/notebook/${note.slug}`;

  return (
    <section
      ref={ref}
      id="featured-note"
      aria-label="Featured note"
      className={`twn-reveal ${inView ? "is-visible" : ""} border-b border-border bg-paper-deep py-20 sm:py-28`}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-20">
        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-border pb-5">
          <p className="flex flex-wrap items-baseline gap-x-3 text-[10px] font-sans font-semibold uppercase tracking-[0.28em] text-foreground">
            <span>{[volume.label, volume.season].filter(Boolean).join(" · ")}</span>
            {volume.theme && (
              <span className="font-quote text-base normal-case tracking-normal italic text-muted-foreground">
                {volume.theme}
              </span>
            )}
          </p>
          <Eyebrow>Featured note</Eyebrow>
        </div>

        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <Link
            href={href}
            className="group relative block aspect-[16/10] w-full overflow-hidden rounded-[4px] bg-muted lg:col-span-7"
            data-cursor="link"
            aria-label={note.title}
            tabIndex={-1}
          >
            {note.cover_image ? (
              <div className="absolute inset-0" style={imageStyle}>
                <ImageWithSkeleton
                  src={note.cover_image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-serif text-7xl font-black tracking-widest text-foreground/10">
                  TWN
                </span>
              </div>
            )}
          </Link>

          <div className="flex flex-col lg:col-span-5">
            <h2
              className="font-serif font-bold leading-[1.12] tracking-[-0.015em] text-foreground text-balance"
              style={{ fontSize: "clamp(1.9rem, 3.2vw, 2.75rem)" }}
            >
              <Link
                href={href}
                className="transition-opacity duration-300 hover:opacity-70"
                data-cursor="link"
              >
                {note.title}
              </Link>
            </h2>

            {note.excerpt && (
              <p className="mt-5 line-clamp-4 font-serif text-[1.1rem] leading-[1.65] text-muted-foreground">
                {note.excerpt}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
              <span className="text-[12px] text-muted-foreground">
                {[
                  `${note.reading_time ?? 1} min read`,
                  note.category,
                  formatDate(note.published_at),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
              <TextLink href={href}>Read note</TextLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
