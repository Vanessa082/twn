"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  useEffect(() => {
    console.error("[GlobalError] Runtime boundary caught error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center bg-background text-foreground transition-colors duration-300">
      <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-6">
        <AlertTriangle className="h-10 w-10" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-foreground mb-4">
        {t("error")}
      </h1>

      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xs sm:max-w-sm mb-8">
        We encountered a unexpected error rendering this view. Please try reloading or check back shortly.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="inline-flex h-12 items-center justify-center rounded-lg bg-deep-navy px-6 text-sm font-semibold text-white hover:bg-deep-navy/90 dark:bg-muted-gold dark:text-charcoal-black dark:hover:bg-muted-gold/90 shadow-md hover-lift transition-all cursor-pointer"
        >
          {t("retry")}
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-card px-6 text-sm font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          {t("backHome")}
        </button>
      </div>
    </div>
  );
}
