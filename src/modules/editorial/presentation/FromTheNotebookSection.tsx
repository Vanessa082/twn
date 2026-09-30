"use client";

/**
 * FromTheNotebookSection — recent essays with editorial rhythm: one lead piece
 * with its cover, beside a quiet text-only list. Renders nothing without notes.
 */

import ImageWithSkeleton from "@/components/ui/ImageWithSkeleton";
import SectionHeading from "@/components/ui/SectionHeading";
import { useInView } from "@/hooks/useInView";
import type { Note } from "@/modules/editorial/contracts";
import Link from "next/link";

interface FromTheNotebookSectionProps {
  notes: Note[];
}

function formatDate(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Meta({ note }: { note: Note }) {
  return (
    <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-muted-foreground">
      <span className="text-ink-accent">{note.category}</span>
      <span aria-hidden="true"> · </span>
      {note.reading_time ?? 1} min read
    </p>
  );
}

export default function FromTheNotebookSection({ notes }: FromTheNotebookSectionProps) {
  const [ref, inView] = useInView<HTMLElement>();
  const [lead, ...rest] = notes;

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
          action={{ label: "All notes", href: "/notebook" }}
        />

        <div
          className={`grid grid-cols-1 gap-12 ${rest.length > 0 ? "lg:grid-cols-12 lg:gap-16" : ""}`}
        >
          <article className={rest.length > 0 ? "lg:col-span-7" : "max-w-3xl"}>
            <Link href={`/notebook/${lead.slug}`} data-cursor="link" className="group block">
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
              <Meta note={lead} />
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
              {rest.map((note) => (
                <li key={note.id} className="border-b border-border">
                  <Link
                    href={`/notebook/${note.slug}`}
                    data-cursor="link"
                    className="group block py-7"
                  >
                    <Meta note={note} />
                    <h3 className="mt-3 font-serif text-[1.35rem] font-bold leading-[1.25] text-foreground text-balance transition-opacity duration-300 group-hover:opacity-70">
                      {note.title}
                    </h3>
                    {note.published_at && (
                      <time
                        dateTime={note.published_at}
                        className="mt-3 block font-quote text-base italic text-muted-foreground"
                      >
                        {formatDate(note.published_at)}
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
