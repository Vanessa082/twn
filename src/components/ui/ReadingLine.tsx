"use client";

import { useEffect, useRef } from "react";

/**
 * ReadingLine — a thin 2px vertical line on the left edge of the viewport.
 *
 * It grows from top to bottom as the user scrolls down the page.
 * It communicates: "You're moving through someone's notebook, one page at a time."
 *
 * Only rendered on lg+ screens. Hidden by CSS on mobile.
 * Uses requestAnimationFrame to avoid layout thrashing.
 */
export default function ReadingLine() {
  const lineRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const update = () => {
      const el = lineRef.current;
      if (!el) return;

      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      // Clamp to 0-1
      const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      el.style.height = `${progress * 100}vh`;
    };

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    // Set initial state
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={lineRef}
      className="twn-reading-line hidden lg:block"
      aria-hidden="true"
    />
  );
}
