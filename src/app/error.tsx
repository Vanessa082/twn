"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception for debugging
    console.error("[GlobalError Boundary]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-16 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive w-fit mx-auto">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-destructive">
            Unexpected Error
          </span>
          <h1 className="text-3xl font-serif font-black tracking-tight text-foreground sm:text-4xl">
            Something went wrong
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            An unexpected runtime error occurred while loading this page. You can try refreshing or returning to safety.
          </p>
        </div>

        <div className="pt-4 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" /> Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-foreground font-bold text-xs uppercase tracking-wider hover:bg-muted transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
