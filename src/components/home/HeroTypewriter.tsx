"use client";

/**
 * HeroTypewriter — Cormorant Garamond ink-drying thought reveal.
 *
 * Typography from design image:
 *   - Font: Cormorant Garamond (--font-quote), ~50px, weight 500
 *   - Normal text: near-black (#111)
 *   - *italic* words: warm amber #AE8D64, italic style
 *   - Cursor: thin 1.5px, blinks gently
 *   - CTA: "READ THE LATEST NOTE →" — tiny uppercase Inter
 */

import type { NotebookEntry } from "@/types";
import Link from "next/link";

interface HeroTypewriterProps {
  currentEntry: NotebookEntry;
  phase: "entering" | "visible" | "exiting" | "gap";
}

function RichThought({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("*") && part.endsWith("*")) {
          const word = part.slice(1, -1);
          return (
            <em
              key={i}
              style={{
                fontStyle: "italic",
                color: "#AE8D64",
                fontWeight: 500,
              }}
            >
              {word}
            </em>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function HeroTypewriter({ currentEntry, phase }: HeroTypewriterProps) {
  const containerStyle: React.CSSProperties =
    phase === "entering"
      ? { animation: "twn-ink-reveal 1.5s cubic-bezier(0.16,1,0.3,1) forwards" }
      : phase === "exiting"
        ? { opacity: 0, filter: "blur(5px)", transition: "opacity 0.9s ease, filter 0.9s ease" }
        : phase === "gap"
          ? { opacity: 0 }
          : {};

  return (
    <div aria-live="polite" aria-atomic="true">
      <div key={currentEntry.id} className="flex flex-col gap-6" style={containerStyle}>
        {/*
          Cormorant Garamond, ~50px on desktop, weight 500.
          Line height 1.2 so it reads like a hand-written journal entry.
          max-w keeps it at 2–3 lines for editorial pacing.
        */}
        <p
          className="font-quote font-medium leading-[1.22] text-foreground"
          style={{ fontSize: "clamp(2rem, 4vw, 3.1rem)", maxWidth: "480px" }}
        >
          <RichThought text={currentEntry.thought} />
          {/* Blinking cursor — 1px thin, very subtle */}
          <span
            aria-hidden="true"
            className={[
              "inline-block w-[1.5px] h-[0.8em] ml-1 align-middle bg-foreground/70",
              phase === "visible" ? "animate-twn-blink" : "opacity-0",
            ].join(" ")}
          />
        </p>

        {/* READ THE LATEST NOTE → */}
        <Link
          href="/articles"
          data-cursor="link"
          className="group inline-flex items-center gap-2 text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-foreground/60 hover:text-foreground transition-colors w-fit"
        >
          <span>Read the latest note</span>
          <span className="group-hover:translate-x-1.5 transition-transform duration-300 inline-block">
            ——&gt;
          </span>
        </Link>
      </div>
    </div>
  );
}
