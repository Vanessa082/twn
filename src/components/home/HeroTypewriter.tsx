"use client";

/**
 * HeroTypewriter — The "ink drying on paper" hero animation.
 *
 * Animation sequence per entry:
 *   1. Entry fades in with blur dissolving (1.5s) — like ink absorbing into paper
 *   2. Cursor blinks for ~3s (the "pause" that makes it feel alive)
 *   3. Entry fades out with a soft blur (0.8s)
 *   4. After a brief gap, the next entry begins
 *
 * Rotation logic:
 *   - The server picks one random opening entry and passes it here
 *   - After it's shown, the client cycles through the rest in order
 *   - This prevents duplicates while still feeling surprising on each visit
 */

import type { NotebookEntry } from "@/types";
import { useEffect, useRef, useState } from "react";

type AnimationPhase = "entering" | "visible" | "exiting" | "gap";

interface HeroTypewriterProps {
  /** The initial entry chosen randomly on the server */
  initialEntry: NotebookEntry;
  /** All active entries — used for client-side cycling after the first */
  allEntries: NotebookEntry[];
}

// Timing constants (ms)
const ENTER_DURATION = 1500;
const VISIBLE_DURATION = 4500;
const EXIT_DURATION = 800;
const GAP_DURATION = 400;

export default function HeroTypewriter({ initialEntry, allEntries }: HeroTypewriterProps) {
  const [currentEntry, setCurrentEntry] = useState<NotebookEntry>(initialEntry);
  const [phase, setPhase] = useState<AnimationPhase>("entering");
  const indexRef = useRef<number>(
    // Start cycling from the entry AFTER the initial one
    allEntries.findIndex((e) => e.id === initialEntry.id)
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Advance to the next entry in the ordered list (wraps around)
  const advanceEntry = () => {
    const next = (indexRef.current + 1) % allEntries.length;
    indexRef.current = next;
    setCurrentEntry(allEntries[next]);
  };

  // Run the animation state machine
  useEffect(() => {
    const schedule = (fn: () => void, delay: number) => {
      timerRef.current = setTimeout(fn, delay);
    };

    const runCycle = () => {
      // Phase 1: entering
      setPhase("entering");
      schedule(() => {
        // Phase 2: visible (cursor blinks)
        setPhase("visible");
        schedule(() => {
          // Phase 3: exiting
          setPhase("exiting");
          schedule(() => {
            // Phase 4: gap (swap entry, restart)
            setPhase("gap");
            advanceEntry();
            schedule(runCycle, GAP_DURATION);
          }, EXIT_DURATION);
        }, VISIBLE_DURATION);
      }, ENTER_DURATION);
    };

    runCycle();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally runs once — the cycle self-manages via advanceEntry

  // CSS classes driven by phase
  const containerClasses = [
    "transition-all duration-700",
    phase === "entering" ? "opacity-100 [filter:blur(0px)]" : "",
    phase === "visible" ? "opacity-100 [filter:blur(0px)]" : "",
    phase === "exiting" ? "opacity-0 [filter:blur(6px)]" : "",
    phase === "gap" ? "opacity-0 [filter:blur(6px)]" : "",
    // Initial state before first enter
    phase === "entering" ? "" : "",
  ].join(" ");

  // On mount the element starts invisible, entering phase brings it in
  const mountStyle: React.CSSProperties =
    phase === "entering"
      ? {
          // Start state for the CSS transition
          animation: "twn-ink-reveal 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }
      : {};

  return (
    <div
      className="relative min-h-[6rem] flex flex-col items-start"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        key={currentEntry.id}
        style={mountStyle}
        className={containerClasses}
      >
        {/* Optional notebook-style title label */}
        {currentEntry.title && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
            {currentEntry.title}
          </p>
        )}

        {/* The thought — main hero text */}
        <p className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black leading-[1.25] tracking-tight text-foreground max-w-2xl">
          {currentEntry.thought}

          {/* Blinking cursor — only shown during the "visible" phase */}
          <span
            aria-hidden="true"
            className={[
              "inline-block w-[2px] h-[0.85em] ml-1 align-middle bg-foreground",
              "rounded-full",
              phase === "visible" ? "animate-twn-blink" : "opacity-0",
            ].join(" ")}
          />
        </p>
      </div>
    </div>
  );
}
