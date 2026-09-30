"use client";

/**
 * FieldNotesSection — short observations managed in Admin → Field Notes.
 *
 * Never renders placeholder cards: an empty notes array hides the section, and
 * the layout adapts to one, two or three genuine notes.
 */

import SectionHeading from "@/components/ui/SectionHeading";
import { useInView } from "@/hooks/useInView";
import type { FieldNote } from "@/types/cms";

interface FieldNotesSectionProps {
  notes: FieldNote[];
}

const COLUMNS: Record<number, string> = {
  1: "grid-cols-1 max-w-2xl",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-3",
};

export default function FieldNotesSection({ notes }: FieldNotesSectionProps) {
  const [ref, inView] = useInView<HTMLElement>();

  if (notes.length === 0) return null;

  return (
    <section
      ref={ref}
      aria-labelledby="field-notes-heading"
      className={`twn-reveal ${inView ? "is-visible" : ""} border-b border-border bg-background py-20 sm:py-28`}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-20">
        <SectionHeading
          eyebrow="Short things I’m thinking about"
          title={<span id="field-notes-heading">Field Notes</span>}
        />

        <ol className={`grid ${COLUMNS[Math.min(notes.length, 3)]} gap-x-10 gap-y-14`}>
          {notes.map((note) => (
            <li key={note.id} className="flex flex-col border-t border-foreground/80 pt-6">
              <div className="flex items-baseline justify-between gap-4 text-[10px] font-sans font-semibold uppercase tracking-[0.22em]">
                <span className="text-ink-accent">No. {note.note_number}</span>
                <span className="text-muted-foreground">{note.tag}</span>
              </div>

              <h3 className="mt-5 font-serif text-[1.4rem] font-bold leading-[1.25] text-foreground text-balance">
                {note.headline}
              </h3>

              <div className="mt-4 space-y-3 text-[15px] leading-[1.75] text-muted-foreground text-pretty">
                {note.body
                  .split(/\n{2,}/)
                  .filter(Boolean)
                  .map((paragraph) => (
                    <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                  ))}
              </div>

              {note.published_at && (
                <time
                  dateTime={note.published_at}
                  className="mt-auto pt-6 font-quote text-base italic text-muted-foreground/80"
                >
                  {new Date(note.published_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
