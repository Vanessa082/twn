/**
 * Hero — Server Component.
 *
 * Fetches notebook entries on the server, picks the opening entry randomly,
 * then hands both to the HeroTypewriter client component.
 * The static brand identity (TWN monogram, nav label) never animates.
 * Only the rotating "thought" below it does.
 */

import HeroTypewriter from "@/components/home/HeroTypewriter";
import { getAllActiveEntries, getRandomEntry } from "@/lib/services/notebook-entries";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function Hero() {
  const t = await getTranslations("home.hero");

  // Fetch both in parallel — neither blocks the other
  const [initialEntry, allEntries] = await Promise.all([
    getRandomEntry(),
    getAllActiveEntries(),
  ]);

  return (
    <section
      aria-label="Hero"
      className="relative bg-background overflow-hidden border-b border-border transition-colors duration-300"
    >
      {/* ── Subtle notebook paper texture overlay ─────────────────────────
          A thin repeating horizontal rule pattern at 2% opacity.
          Users don't consciously see it — they feel it.
      ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 27px, color-mix(in srgb, var(--border) 40%, transparent) 28px)",
          backgroundSize: "100% 28px",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl flex flex-col py-24 sm:py-32">
          {/* Static brand identity — never animates */}
          <div className="flex flex-col gap-8 animate-fade-up">
            {/* Issue label */}
            <div className="inline-flex items-center gap-2 w-fit border border-foreground/20 bg-foreground/[0.03] px-3 py-1 text-[10px] font-bold text-foreground uppercase tracking-[0.25em]">
              <span>Digital Notebook · Issue 01</span>
            </div>

            {/* Brand title — anchored, always visible */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight leading-[1.05] text-foreground">
              {t("title")}
            </h1>

            {/* ── Living notebook thought — rotates via HeroTypewriter ── */}
            <div className="mt-2 min-h-[8rem] sm:min-h-[6rem]">
              <HeroTypewriter initialEntry={initialEntry} allEntries={allEntries} />
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link
                href="/articles"
                className="inline-flex h-12 items-center justify-center border-2 border-foreground bg-foreground px-6 text-xs font-bold uppercase tracking-wider text-background hover:bg-background hover:text-foreground transition-all-premium cursor-pointer rounded-[var(--radius)]"
              >
                {t("cta")}
              </Link>
              <Link
                href="/about"
                className="inline-flex h-12 items-center justify-center border border-border px-6 text-xs font-bold uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors duration-200 rounded-[var(--radius)]"
              >
                About TWN
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
