import { routes } from "@/lib/site";
import type { SeriesNavigation } from "@/modules/editorial/contracts";
import Link from "next/link";

interface SeriesBannerProps {
  series: SeriesNavigation;
}

/** "Part of …" line above the note body, linking to the full series. */
export default function SeriesBanner({ series }: SeriesBannerProps) {
  return (
    <aside
      aria-label="Series"
      className="mb-8 flex flex-col gap-1.5 border-l-2 border-foreground py-1 pl-4 sm:flex-row sm:items-baseline sm:gap-3"
    >
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        {series.currentLabel}
        <span aria-hidden="true"> · </span>
        <span className="sr-only">, entry </span>
        {series.position} of {series.total}
      </p>
      <p className="font-serif text-base text-foreground">
        <span className="text-muted-foreground">Part of </span>
        <Link
          href={routes.collection(series.series.slug)}
          className="font-bold underline-offset-4 transition-opacity hover:opacity-70 hover:underline"
        >
          {series.series.title}
        </Link>
      </p>
    </aside>
  );
}
