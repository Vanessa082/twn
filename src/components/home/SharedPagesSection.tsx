"use client";

/**
 * SharedPagesSection — "Pages from the Community" section.
 * Matches design image exactly:
 *
 * Layout: 2-column
 *   Left (col-span-4): "PAGES FROM THE COMMUNITY" label | "Voices from our community" (large serif)
 *                       | short description | "LEAVE A PAGE →"
 *   Right (col-span-8): Carousel of 3 white quote cards with large amber " and navigation arrows
 *
 * Cards: white, 16px radius, faint shadow, no avatars, no likes
 *        Large " quotation mark (Cormorant, amber #AE8D64)
 *        Quote text in Cormorant, ~20px
 *        "— Name" author line, tiny date
 *
 * Carousel arrows: top-right, circular border-only buttons, hover fills black
 */

import type { SharedPage } from "@/types";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import LeaveAPageForm from "./LeaveAPageForm";

interface SharedPagesSectionProps {
  initialPages: SharedPage[];
}

export default function SharedPagesSection({ initialPages }: SharedPagesSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardsInView, setCardsInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const pages = initialPages;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setCardsInView(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("leave-page=true")) {
      setIsModalOpen(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("leave-page");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const scroll = (dir: "left" | "right") => {
    sliderRef.current?.scrollBy({ left: dir === "left" ? -370 : 370, behavior: "smooth" });
  };

  return (
    <section
      id="community"
      aria-label="Pages from the Community"
      className="py-16 sm:py-24 bg-background border-b border-[#ECECEC]"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start" ref={sectionRef}>

          {/* ── LEFT: intro panel ── */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <span className="text-[9px] font-sans font-bold uppercase tracking-[0.28em] text-[#9B9B9B]">
              Pages from the Community
            </span>
            <h2 className="font-serif font-bold text-foreground leading-[1.1] tracking-tight text-[2rem] sm:text-[2.4rem]">
              Voices<br />from our<br />community
            </h2>
            <p className="text-sm text-[#6B6B6B] leading-[1.7] max-w-[280px]">
              Real reflections from women in technology.
            </p>
            <Link
              href="#"
              onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }}
              data-cursor="link"
              className="group inline-flex items-center gap-2 text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-foreground hover:opacity-60 transition-opacity mt-2"
            >
              <span>Leave a Page</span>
              <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
            </Link>
          </div>

          {/* ── RIGHT: carousel ── */}
          <div className="lg:col-span-8 relative">
            {/* Carousel arrows — top right */}
            <div className="flex justify-end gap-2 mb-5">
              <button
                onClick={() => scroll("left")}
                aria-label="Previous pages"
                data-cursor="button"
                className="w-9 h-9 rounded-full border border-[#CCCCCC] flex items-center justify-center text-[#6B6B6B]
                  hover:bg-foreground hover:border-foreground hover:text-background
                  transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                aria-label="Next pages"
                data-cursor="button"
                className="w-9 h-9 rounded-full border border-[#CCCCCC] flex items-center justify-center text-[#6B6B6B]
                  hover:bg-foreground hover:border-foreground hover:text-background
                  transition-all duration-200"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Cards slider */}
            <div
              ref={sliderRef}
              className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
              style={{ scrollbarWidth: "none" }}
            >
              {pages.map((page, i) => (
                <div
                  key={page.id}
                  className={[
                    "flex-shrink-0 w-[300px] sm:w-[320px] snap-start",
                    "bg-white border border-[#ECECEC] rounded-[16px] p-7",
                    "shadow-[0_2px_16px_rgba(0,0,0,0.04)]",
                    "flex flex-col justify-between gap-5",
                    "twn-paper-place",
                    cardsInView ? "in-view" : "",
                  ].join(" ")}
                  style={{
                    animationDelay: `${i * 80}ms`,
                    minHeight: "200px",
                  }}
                >
                  {/* Large amber quotation mark */}
                  <div>
                    <span
                      className="font-quote font-medium leading-none block mb-3"
                      style={{ fontSize: "4.5rem", color: "#AE8D64", lineHeight: 0.8 }}
                      aria-hidden="true"
                    >
                      &ldquo;
                    </span>
                    {/* Quote text */}
                    <p className="font-quote font-medium text-foreground leading-[1.55]" style={{ fontSize: "1.15rem" }}>
                      {page.content}
                    </p>
                  </div>

                  {/* Author + date */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-sans font-semibold text-foreground">
                      — {page.author_name}
                    </span>
                    <span className="text-[11px] text-[#9B9B9B]">
                      {formatDate(page.submitted_at)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Fallback if empty */}
              {pages.length === 0 && (
                <div className="flex-shrink-0 w-[300px] bg-white border border-[#ECECEC] rounded-[16px] p-7 flex items-center justify-center min-h-[200px]">
                  <p className="text-sm text-[#9B9B9B] text-center">
                    Be the first to leave a page.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Leave a Page Modal ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Leave a Page form"
        >
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-background border border-[#ECECEC] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] w-full max-w-lg p-8 z-10">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-[#9B9B9B] hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <LeaveAPageForm onSuccess={() => setIsModalOpen(false)} />
          </div>
        </div>
      )}
    </section>
  );
}
