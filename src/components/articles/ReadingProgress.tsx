"use client";

/**
 * ReadingProgress — a thin progress bar at the very top of the page
 * that fills as the user scrolls through the article.
 *
 * Medium uses this exact pattern. It:
 * 1. Gives readers a sense of how far through the article they are
 * 2. Provides subtle, non-intrusive visual feedback
 * 3. Encourages continued reading ("only 30% left!")
 *
 * Implementation: reads document.documentElement.scrollTop relative
 * to the scrollable height and sets a CSS width accordingly.
 */

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress(); // Initialise on mount
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-transparent pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-foreground transition-[width] duration-75 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
