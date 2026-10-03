import { routes } from "@/lib/site";
import type {
  SeriesEntry,
  SeriesNavigation as SeriesNavigationData,
} from "@/modules/editorial/contracts";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

interface SeriesNavigationProps {
  series: SeriesNavigationData;
}

function EntryLink({ entry, direction }: { entry: SeriesEntry; direction: "previous" | "next" }) {
  const isNext = direction === "next";
  return (
    <Link
      href={routes.note(entry.note.slug)}
      rel={isNext ? "next" : "prev"}
      className={`group flex h-full flex-col gap-2 border border-border p-5 transition-colors duration-300 hover:border-foreground sm:p-6 ${
        isNext ? "sm:items-end sm:text-right" : ""
      }`}
    >
      <span className="flex items-center gap-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {!isNext && (
          <ArrowLeft className="size-3 transition-transform duration-300 group-hover:-translate-x-1" />
        )}
        {isNext ? "Next" : "Previous"} · {entry.label}
        {isNext && (
          <ArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-1" />
        )}
      </span>
      <span className="font-serif text-lg font-bold leading-snug text-foreground text-balance">
        {entry.note.title}
      </span>
    </Link>
  );
}

/** Previous/next within the note's series, shown after the note. */
export default function SeriesNavigation({ series }: SeriesNavigationProps) {
  const { previous, next, total } = series;

  return (
    <nav
      aria-label={`${series.series.title}: series navigation`}
      className="mx-auto w-full max-w-7xl px-5 pb-4 pt-12 sm:px-10 lg:px-20"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-t border-border pt-8">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          The series
        </p>
        <Link
          href={routes.collection(series.series.slug)}
          className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground underline-offset-4 hover:underline"
        >
          All {total} {total === 1 ? "entry" : "entries"} in {series.series.title} →
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>{previous && <EntryLink entry={previous} direction="previous" />}</div>
        <div>
          {next ? (
            <EntryLink entry={next} direction="next" />
          ) : (
            <p className="flex h-full items-center border border-dashed border-border p-5 font-quote text-lg italic text-muted-foreground sm:justify-end sm:p-6 sm:text-right">
              This is the latest entry.
            </p>
          )}
        </div>
      </div>
    </nav>
  );
}
