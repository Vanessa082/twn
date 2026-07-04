import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Hero() {
  const t = useTranslations("home.hero");

  return (
    <section className="relative bg-background overflow-hidden py-24 sm:py-32 border-b border-border transition-colors duration-300">
      {/* Premium organic line drawing */}
      <div className="absolute inset-y-0 right-0 w-full md:w-1/2 flex items-center justify-end pr-8 pointer-events-none opacity-25 dark:opacity-30">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 600 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full max-w-[500px]"
        >
          <title>Decorative organic line drawing representing tech journeys</title>
          <path
            d="M50 350 C 120 200, 200 480, 320 300 C 440 120, 520 400, 580 220"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="animate-draw text-foreground"
          />
          <path
            d="M80 380 C 150 250, 180 440, 290 340 C 400 240, 480 360, 550 180"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeDasharray="4 4"
            className="animate-draw text-foreground/40"
          />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl flex flex-col gap-6 sm:gap-8 animate-fade-up">
          {/* Subtle premium label */}
          <div className="inline-flex items-center gap-2 w-fit border border-foreground/25 bg-foreground/[0.03] px-3 py-1 text-xs font-bold text-foreground uppercase tracking-widest">
            <span>Issue 01 • Digital Notebook</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight leading-[1.1] text-foreground">
            {t("title")}
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl font-sans text-muted-foreground leading-relaxed max-w-2xl font-normal">
            {t("tagline")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-2">
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
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
