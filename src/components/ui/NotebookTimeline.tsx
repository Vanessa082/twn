"use client";

/**
 * NotebookTimeline — A premium vertical scroll timeline.
 *
 * Placed on the far left (outside main container) at left-4.
 * Tracks the user's scroll progress through the notebook sections.
 *
 * Uses an IntersectionObserver/scroll listener to move the ink progress dot
 * and highlight the current section label.
 */

import { useEffect, useState } from "react";

const STOPS = [
  { id: "hero", label: "HERO" },
  { id: "todays-page", label: "TODAY" },
  { id: "featured-note", label: "FEATURED" },
  { id: "latest-notes", label: "LATEST" },
  { id: "community", label: "VOICES" },
  { id: "browse-by-topic", label: "TOPICS" },
  { id: "newsletter", label: "NEWS" },
];

export default function NotebookTimeline() {
  const [activeId, setActiveId] = useState("hero");
  const [dotTop, setDotTop] = useState(0); // percentage top (0% to 100% of the track)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      // Calculate overall scroll percentage
      const percent = docHeight > 0 ? scrollY / docHeight : 0;
      setDotTop(percent * 100);

      // Determine active section based on position
      let currentActive = "hero";
      for (const stop of STOPS) {
        const el = document.getElementById(stop.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // If the element's top is past 45% of the viewport height, it becomes active
          if (rect.top <= window.innerHeight * 0.45) {
            currentActive = stop.id;
          }
        }
      }
      setActiveId(currentActive);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run initial call
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className="hidden xl:block fixed left-4 top-0 bottom-0 w-36 z-30 pointer-events-none"
      aria-hidden="true"
      style={{ animation: "softFadeIn 1s cubic-bezier(0.16,1,0.3,1) 2s both" }}
    >
      {/* The Timeline Track Line */}
      <div className="absolute left-[34px] top-[15vh] bottom-[15vh] w-[1px] bg-[#ECECEC]">
        {/* Active Moving Dot */}
        <div
          className="absolute left-[-3px] w-1.5 h-1.5 rounded-full bg-foreground transition-all duration-300 ease-out"
          style={{ top: `${dotTop}%`, transform: "translateY(-50%)" }}
        />
      </div>

      {/* Stop Labels */}
      <div className="absolute left-[52px] top-[15vh] bottom-[15vh] flex flex-col justify-between pointer-events-auto py-1">
        {STOPS.map((stop) => {
          const isActive = activeId === stop.id;
          return (
            <button
              key={stop.id}
              onClick={() => handleClick(stop.id)}
              className={`text-left text-[9px] font-sans font-bold tracking-[0.25em] transition-all duration-300 cursor-pointer block ${
                isActive ? "text-foreground translate-x-1" : "text-muted hover:text-muted-foreground"
              }`}
            >
              {stop.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
