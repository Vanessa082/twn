"use client";

/**
 * HeroClient — The soul of TWN.
 *
 * Layout (pixel-perfect match to design image):
 *   - Far-left margin: 01 / 06 page numbers (book atmosphere)
 *   - Left col (55%): WELCOME label → H1 → Typewriter thought → CTA
 *   - Right col (45%): NotebookSketch with subtle drift + InkLine overlay
 *
 * Hero height: min 700px. Almost 90% whitespace.
 * H1: Playfair Display 74px, line-height 0.95.
 * Thought: Cormorant Garamond 50px weight 500.
 */

import HeroTypewriter from "@/components/home/HeroTypewriter";
import InkLine from "@/components/home/InkLine";
import NotebookSketch from "@/components/home/NotebookSketch";
import type { NotebookEntry } from "@/types";
import { useEffect, useRef, useState } from "react";

interface HeroClientProps {
  initialEntry: NotebookEntry;
  allEntries: NotebookEntry[];
  title: string;
}

type AnimationPhase = "entering" | "visible" | "exiting" | "gap";

const ENTER_DURATION = 1500;
const VISIBLE_DURATION = 5000;
const EXIT_DURATION = 900;
const GAP_DURATION = 400;

export default function HeroClient({ initialEntry, allEntries, title }: HeroClientProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [currentIdx, setCurrentIdx] = useState<number>(() => {
    const idx = allEntries.findIndex((e) => e.id === initialEntry.id);
    return idx !== -1 ? idx : 0;
  });
  const [phase, setPhase] = useState<AnimationPhase>("entering");

  // ── Mouse parallax for the illustration ────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section) return;
        const rect = section.getBoundingClientRect();
        setMouseX((e.clientX - rect.left - rect.width / 2) / (rect.width / 2));
        setMouseY((e.clientY - rect.top - rect.height / 2) / (rect.height / 2));
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── Thought rotation cycle ─────────────────────────────────────────────────
  useEffect(() => {
    const schedule = (fn: () => void, delay: number) => {
      timerRef.current = setTimeout(fn, delay);
    };
    const runCycle = () => {
      setPhase("entering");
      schedule(() => {
        setPhase("visible");
        schedule(() => {
          setPhase("exiting");
          schedule(() => {
            setPhase("gap");
            setCurrentIdx((prev) => (prev + 1) % Math.max(allEntries.length, 1));
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
  }, []);

  const formatNum = (n: number) => String(n + 1).padStart(2, "0");
  const totalEntries = Math.max(allEntries.length, 1);
  const currentEntry = allEntries[currentIdx] ?? initialEntry;

  const illustrationStyle: React.CSSProperties = {
    transform: `translate(${mouseX * 5}px, ${mouseY * 5}px)`,
    transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
    willChange: "transform",
  };

  // Lines behind the title — ruled-paper effect
  const lineBg = {
    backgroundImage:
      "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(0,0,0,0.04) 28px)",
    backgroundSize: "100% 28px",
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-label="Hero — The Notebook of a Tech Woman"
      className="relative bg-background overflow-hidden border-b border-[#ECECEC] min-h-[700px] flex items-center"
    >
      {/* Ruled paper background */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        style={lineBg}
        aria-hidden="true"
      />

      {/* ── Far-left margin numbers ── */}
      <div
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-2 select-none"
        aria-hidden="true"
        style={{ animation: "softFadeIn 0.6s cubic-bezier(0.16,1,0.3,1) 1.8s both" }}
      >
        <span className="text-[10px] font-mono font-bold text-foreground leading-none">
          {formatNum(currentIdx)}
        </span>
        <div className="w-px h-[80px] bg-foreground/20 relative overflow-hidden">
          <div
            className="absolute left-0 right-0 bg-foreground/60 transition-all duration-700"
            style={{
              top: `${totalEntries > 1 ? (currentIdx / totalEntries) * 100 : 0}%`,
              height: `${100 / totalEntries}%`,
              minHeight: "10px",
            }}
          />
        </div>
        <span className="text-[10px] font-mono font-bold text-foreground/35 leading-none">
          {formatNum(totalEntries - 1)}
        </span>
      </div>

      {/* Main content grid */}
      <div className="relative z-10 mx-auto max-w-7xl w-full px-5 sm:px-10 lg:px-20 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* ── Left content col (55%) ── */}
          <div className="lg:col-span-7 flex flex-col gap-7">
            {/* Label */}
            <span
              className="text-[10px] font-sans font-bold uppercase tracking-[0.28em] text-[#9B9B9B]"
              style={{ animation: "softFadeIn 0.7s cubic-bezier(0.16,1,0.3,1) 200ms both" }}
            >
              Welcome to my notebook
            </span>

            {/* H1 — Playfair, ~74px, line-height 0.95 */}
            <h1
              className="font-serif font-bold text-foreground leading-[0.96] tracking-[-0.02em] text-[3.5rem] sm:text-[4rem] lg:text-[4.6rem]"
              style={{ animation: "softFadeInUp 1s cubic-bezier(0.16,1,0.3,1) 350ms both" }}
            >
              {title}
            </h1>

            {/* ── Cormorant Typewriter thought ── */}
            <div
              className="mt-1"
              style={{ animation: "softFadeIn 0.8s cubic-bezier(0.16,1,0.3,1) 1000ms both" }}
            >
              <HeroTypewriter currentEntry={currentEntry} phase={phase} />
            </div>
          </div>

          {/* ── Right illustration col (45%) ── */}
          <div
            className="lg:col-span-5 flex items-center justify-center lg:justify-end mt-8 lg:mt-0 relative"
            style={{ animation: "softFadeIn 1.2s cubic-bezier(0.16,1,0.3,1) 600ms both" }}
          >
            {/* Ink line overlay — draws once across the hero */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <InkLine />
            </div>

            {/* Notebook illustration with subtle drift animation */}
            <div className="w-full max-w-[420px] twn-notebook-drift" style={illustrationStyle}>
              <NotebookSketch mouseX={mouseX} mouseY={mouseY} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
