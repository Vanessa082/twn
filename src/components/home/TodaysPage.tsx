"use client";

import { TextLink } from "@/components/ui/SectionHeading";
import { useInView } from "@/hooks/useInView";
import type { NotebookEntry } from "@/types";

interface TodaysPageProps {
  entry: NotebookEntry;
}

export default function TodaysPage({ entry }: TodaysPageProps) {
  const [ref, inView] = useInView<HTMLElement>();

  const displayDate = (
    entry.display_date ? new Date(`${entry.display_date}T00:00:00`) : new Date()
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const seq = (delay: number): React.CSSProperties => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0)" : "translateY(8px)",
    transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  });

  return (
    <section
      ref={ref}
      id="todays-page"
      aria-label="Today's notebook page"
      className="border-b border-border bg-background"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-5 py-14 sm:px-10 sm:py-16 md:grid-cols-12 md:items-center md:gap-10 lg:px-20">
        <div className="md:col-span-3" style={seq(0)}>
          <span className="block text-[10px] font-sans font-semibold uppercase tracking-[0.28em] text-ink-accent">
            Today&apos;s page
          </span>
          <time
            dateTime={entry.display_date ?? undefined}
            className="mt-2 block font-quote text-lg italic text-muted-foreground"
          >
            {displayDate}
          </time>
        </div>

        <blockquote
          className="font-quote font-medium leading-[1.25] text-foreground text-balance md:col-span-6 md:border-l md:border-border md:pl-10"
          style={{ fontSize: "clamp(1.6rem, 3vw, 2.3rem)", ...seq(150) }}
        >
          &ldquo;{entry.thought}&rdquo;
        </blockquote>

        <div className="md:col-span-3 md:justify-self-end" style={seq(300)}>
          <TextLink href="/articles">Open the notebook</TextLink>
        </div>
      </div>
    </section>
  );
}
