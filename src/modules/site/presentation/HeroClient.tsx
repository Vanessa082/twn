"use client";

import { TextLink } from "@/components/ui/SectionHeading";
import type { Note } from "@/modules/editorial/contracts";
import { ArrowRight, Dot } from "lucide-react";
import Link from "next/link";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import InkLine from "./InkLine";
import NotebookSketch from "./NotebookSketch";

interface HeroClientProps {
  eyebrow: string;
  title: string;
  topics: string[];
  authorName: string;
  todaysNote: Note | null;
}

function formatNoteDate(note: Note) {
  const date = note.published_at ? new Date(note.published_at) : new Date();
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
}

/**
 * Splits an editorial headline at the word boundary nearest its visual centre.
 * Both lines stay intact; responsive container units then fit the longer line.
 */
function balanceHeadline(headline: string): string[] {
  const words = headline.trim().split(/\s+/);
  if (words.length < 2) return words;

  const weakLineEndings = new Set([
    "a",
    "an",
    "and",
    "but",
    "for",
    "from",
    "i",
    "in",
    "of",
    "or",
    "the",
    "to",
    "with",
  ]);
  let splitAt = 1;
  let bestScore = Number.POSITIVE_INFINITY;
  for (let index = 1; index < words.length; index += 1) {
    const firstLength = words.slice(0, index).join(" ").length;
    const secondLength = words.slice(index).join(" ").length;
    const difference = Math.abs(firstLength - secondLength);
    const endingPenalty = weakLineEndings.has(words[index - 1].toLowerCase()) ? 20 : 0;
    const score = difference + endingPenalty;
    if (score < bestScore) {
      bestScore = score;
      splitAt = index;
    }
  }

  return [words.slice(0, splitAt).join(" "), words.slice(splitAt).join(" ")];
}

export default function HeroClient({
  eyebrow,
  title,
  topics,
  authorName,
  todaysNote,
}: HeroClientProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // Mouse parallax on the sketch — fine pointers only, never when motion is reduced.
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section) return;
        const rect = section.getBoundingClientRect();
        setMouse({
          x: (e.clientX - rect.left - rect.width / 2) / (rect.width / 2),
          y: (e.clientY - rect.top - rect.height / 2) / (rect.height / 2),
        });
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const illustrationStyle: CSSProperties = {
    transform: `translate3d(${mouse.x * 5}px, ${mouse.y * 5}px, 0)`,
    transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
  };

  const rise = (delay: number): CSSProperties => ({
    animation: `softFadeIn 1s cubic-bezier(0.16,1,0.3,1) ${delay}ms both`,
  });

  const headline = todaysNote?.title ?? title;
  const headlineLines = balanceHeadline(headline);
  const longestLine = Math.max(...headlineLines.map((line) => line.length));
  const responsiveHeadlineSize = `clamp(1.15rem, ${100 / Math.max(longestLine * 0.5, 1)}cqw, 4rem)`;

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-labelledby="hero-title"
      className="relative flex min-h-[540px] items-center overflow-hidden border-b border-border bg-background sm:min-h-[600px] lg:min-h-[640px]"
    >
      <div className="twn-hero-atmosphere" aria-hidden="true" />
      <div className="twn-paper-grain" aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-16 sm:px-10 sm:py-20 lg:px-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="flex flex-col [container-type:inline-size] lg:col-span-8">
            {eyebrow && (
              <span
                className="text-[10px] font-sans font-semibold uppercase tracking-[0.28em] text-muted-foreground"
                style={rise(0)}
              >
                {eyebrow}
              </span>
            )}

            <h1
              id="hero-title"
              aria-label={headline}
              className="mt-6 w-full font-serif font-bold leading-[0.98] tracking-[-0.035em] text-foreground"
              style={{ fontSize: responsiveHeadlineSize, ...rise(120) }}
            >
              <span aria-hidden="true">
                {headlineLines.map((line) => (
                  <span key={line} className="block whitespace-nowrap">
                    {line}
                  </span>
                ))}
              </span>
            </h1>

            {todaysNote && (
              <figure
                className="mt-14 max-w-md border-l border-border pl-5"
                style={rise(480)}
                aria-labelledby="todays-page-caption"
              >
                <figcaption
                  id="todays-page-caption"
                  className="text-[10px] font-sans font-semibold uppercase tracking-[0.24em] text-ink-accent"
                >
                  Today&apos;s page · {todaysNote.category} ·{" "}
                  <time dateTime={todaysNote.published_at ?? undefined}>
                    {formatNoteDate(todaysNote)}
                  </time>
                </figcaption>
                <Link
                  href={`/notebook/${todaysNote.slug}`}
                  data-cursor="link"
                  className="group mt-2 block"
                  aria-label={`Read ${todaysNote.title}`}
                >
                  <blockquote className="line-clamp-2 font-quote text-xl leading-snug text-foreground/80 transition-colors group-hover:text-foreground">
                    &ldquo;{todaysNote.excerpt}&rdquo;
                  </blockquote>
                  <span className="mt-3 inline-flex items-center gap-2 text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors group-hover:text-foreground">
                    Read the full note
                    <ArrowRight
                      className="size-3 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </figure>
            )}

            {topics.length > 0 && (
              <p
                className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 font-quote text-lg italic text-muted-foreground sm:text-xl"
                style={rise(240)}
              >
                {topics.map((topic, index) => (
                  <span key={topic} className="inline-flex items-center gap-3">
                    {index > 0 && (
                      <span className="not-italic text-foreground/25" aria-hidden="true">
                        <Dot />
                      </span>
                    )}
                    {topic}
                  </span>
                ))}
              </p>
            )}
            <div className="mt-10 flex flex-wrap items-center gap-8" style={rise(360)}>
              <Link
                href={todaysNote ? `/notebook/${todaysNote.slug}` : "/notebook"}
                data-cursor="link"
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-[4px] bg-foreground px-6 text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-background transition-opacity duration-300 hover:opacity-85"
              >
                <span>Read More</span>
                <ArrowRight
                  className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
              <TextLink href="/about">Meet {authorName}</TextLink>
            </div>
          </div>

          <div
            className="relative hidden items-center justify-center sm:flex lg:col-span-4 lg:justify-end"
            style={{ animation: "softFadeIn 1.2s cubic-bezier(0.16,1,0.3,1) 300ms both" }}
            aria-hidden="true"
          >
            <div className="pointer-events-none absolute inset-0">
              <InkLine />
            </div>
            <div
              className="twn-notebook-drift w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[420px]"
              style={illustrationStyle}
            >
              <NotebookSketch mouseX={mouse.x} mouseY={mouse.y} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
