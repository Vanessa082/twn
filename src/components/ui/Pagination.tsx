import { pageWindow } from "@/lib/pagination";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Builds the URL for a page; page 1 should return the clean base URL. */
  hrefForPage: (page: number) => string;
  /** What is being paged, for screen readers: "notes", "results". */
  label: string;
  className?: string;
}

const edgeClass =
  "inline-flex h-11 items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors";

/**
 * Link-based pagination: every page has a real, shareable, crawlable URL and
 * works without JavaScript. Phones get Previous / "2 of 5" / Next; wider
 * screens add the numbered window.
 */
export default function Pagination({
  page,
  totalPages,
  hrefForPage,
  label,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav
      aria-label={`Pages of ${label}`}
      className={`flex items-center justify-between gap-4 border-t border-border pt-6 ${className}`}
    >
      {hasPrevious ? (
        <Link
          href={hrefForPage(page - 1)}
          rel="prev"
          className={`${edgeClass} text-foreground hover:opacity-70`}
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Previous
        </Link>
      ) : (
        <span aria-hidden="true" className={`${edgeClass} text-muted-foreground/40`}>
          <ArrowLeft className="size-3.5" />
          Previous
        </span>
      )}

      <p className="font-quote text-base italic text-muted-foreground sm:hidden">
        {page} of {totalPages}
      </p>

      <ol className="hidden items-center gap-1 sm:flex">
        {pageWindow(page, totalPages).map((item, index) =>
          item === "gap" ? (
            <li
              key={`gap-${index}`}
              aria-hidden="true"
              className="w-8 text-center text-muted-foreground"
            >
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={hrefForPage(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                className={`inline-flex size-11 items-center justify-center font-serif text-lg transition-colors ${
                  item === page
                    ? "font-bold text-foreground underline decoration-ink-accent decoration-2 underline-offset-8"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item}
              </Link>
            </li>
          )
        )}
      </ol>

      {hasNext ? (
        <Link
          href={hrefForPage(page + 1)}
          rel="next"
          className={`${edgeClass} text-foreground hover:opacity-70`}
        >
          Next
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      ) : (
        <span aria-hidden="true" className={`${edgeClass} text-muted-foreground/40`}>
          Next
          <ArrowRight className="size-3.5" />
        </span>
      )}
    </nav>
  );
}
