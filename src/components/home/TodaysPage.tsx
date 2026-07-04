import type { NotebookEntry } from "@/types";
import Link from "next/link";

interface TodaysPageProps {
  entry: NotebookEntry;
}

/**
 * TodaysPage — a thin editorial strip between the hero and the featured article.
 *
 * Shows only when the admin has assigned an entry to today's date.
 * The parent server component passes null when none exists, in which case
 * this component is never rendered — no empty state, no fallback text.
 *
 * Design: reads like an excerpt from a printed journal.
 */
export default function TodaysPage({ entry }: TodaysPageProps) {
  // Format the display_date as "July 4, 2026" or fall back to today
  const displayDate = entry.display_date
    ? new Date(`${entry.display_date}T00:00:00`).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

  return (
    <section
      aria-label="Today's notebook page"
      className="border-y border-border bg-card transition-colors duration-300"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          {/* Left: label + date */}
          <div className="flex flex-col gap-1 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
              Today&apos;s Page
            </span>
            <time
              dateTime={entry.display_date ?? new Date().toISOString().split("T")[0]}
              className="text-xs text-muted-foreground"
            >
              {displayDate}
            </time>
          </div>

          {/* Centre: the thought */}
          <blockquote className="flex-1 sm:px-8">
            {entry.title && (
              <p className="text-xs font-semibold text-muted-foreground mb-1 italic">
                {entry.title}
              </p>
            )}
            <p className="font-serif text-lg sm:text-xl font-bold leading-snug tracking-tight text-foreground">
              &ldquo;{entry.thought}&rdquo;
            </p>
          </blockquote>

          {/* Right: optional link to source article */}
          {entry.source_article_id && (
            <div className="shrink-0 self-end sm:self-center">
              <Link
                href={`/articles`}
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                Read more →
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
