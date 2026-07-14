"use client";

/**
 * TodaysPage — Matches design image exactly.
 *
 * Layout: full-width card, 3-column internal grid
 *   [Calendar icon 64px] | [TODAY'S PAGE · DATE + Quote] | [READ TODAY'S PAGE →]
 *
 * Card: white bg, 18px radius, 1px #ECECEC border, ~170px height
 * Quote: Cormorant Garamond, ~36px, medium weight, with guillemet quotes
 */

import type { NotebookEntry } from "@/types";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface TodaysPageProps {
  entry: NotebookEntry;
}

export default function TodaysPage({ entry }: TodaysPageProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

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

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const seq = (delay: number): React.CSSProperties => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0)" : "translateY(8px)",
    transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  });

  return (
    <section
      id="todays-page"
      aria-label="Today's notebook page"
      className="py-0 bg-background"
      ref={sectionRef}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-20 py-6">
        {/* Card */}
        <div className="bg-white border border-[#ECECEC] rounded-[18px] overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center gap-0">
            {/* Left — Calendar icon box */}
            <div
              className="flex-shrink-0 flex items-center justify-center md:border-r border-b md:border-b-0 border-[#ECECEC] px-6 py-6 md:py-0 md:h-[170px] md:w-[100px]"
              style={seq(100)}
            >
              <div className="w-[52px] h-[52px] bg-[#F9F9F7] border border-[#ECECEC] flex items-center justify-center rounded-[10px]">
                <svg
                  className="h-5 w-5 text-[#6B6B6B]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            {/* Center — Label + Quote */}
            <div className="flex-1 px-8 py-7 md:py-0 md:h-[170px] md:flex md:flex-col md:justify-center border-b md:border-b-0 border-[#ECECEC]">
              <span
                className="text-[9px] font-sans font-bold uppercase tracking-[0.28em] text-[#9B9B9B] block mb-3"
                style={seq(150)}
              >
                Today&apos;s Page &nbsp;·&nbsp; {displayDate}
              </span>
              <p
                className="font-quote font-medium text-foreground leading-[1.28]"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", ...seq(250) }}
              >
                &ldquo;{entry.thought}&rdquo;
              </p>
            </div>

            {/* Right — CTA */}
            <div
              className="flex-shrink-0 px-8 py-6 md:py-0 md:h-[170px] md:w-[220px] md:flex md:items-center md:justify-end"
              style={seq(400)}
            >
              <Link
                href="/articles"
                data-cursor="link"
                className="group inline-flex items-center gap-2 text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-foreground/60 hover:text-foreground transition-colors"
              >
                <span>Read Today&apos;s Page</span>
                <span className="group-hover:translate-x-1 transition-transform inline-block">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
