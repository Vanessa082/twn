"use client";

import Link from "next/link";
import { useEffect } from "react";

interface EditorialErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

function describe(error: Error): { title: string; body: string } {
  const message = error.message?.toLowerCase() ?? "";
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return {
      title: "You seem to be offline.",
      body: "The notebook needs a connection to fetch this page. Reconnect and try again.",
    };
  }
  if (message.includes("fetch") || message.includes("network") || message.includes("timeout")) {
    return {
      title: "The page took too long to arrive.",
      body: "We couldn't reach the notebook's library just now. It's usually brief, so give it another try.",
    };
  }
  return {
    title: "This page smudged while loading.",
    body: "Something on our side stopped it from rendering. Nothing you did caused it, and trying again usually works.",
  };
}

export default function EditorialError({ error, reset }: EditorialErrorProps) {
  useEffect(() => {
    console.error("[TWN] Page failed to render", error.digest ?? "", error);
  }, [error]);

  const { title, body } = describe(error);

  return (
    <div className="mx-auto w-full max-w-7xl px-5 pb-24 pt-16 sm:px-10 sm:pt-24 lg:px-20">
      <div role="alert" className="max-w-2xl">
        <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          <span className="size-1 rounded-full bg-ink-accent" aria-hidden="true" />
          Something went wrong
        </p>
        <h1
          className="mt-6 font-serif font-bold leading-[1.05] tracking-[-0.02em] text-foreground text-balance"
          style={{ fontSize: "clamp(2.2rem, 5vw, 3.75rem)" }}
        >
          {title}
        </h1>
        <p className="mt-5 max-w-xl font-serif text-lg leading-relaxed text-muted-foreground">
          {body}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <button
            type="button"
            onClick={reset}
            className="inline-flex cursor-pointer items-center gap-2 bg-foreground px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-85"
          >
            Try again
          </button>
          <Link
            href="/"
            className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Back to the first page
          </Link>
        </div>
        {error.digest && (
          <p className="mt-12 font-mono text-[11px] text-muted-foreground/70">
            Reference: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
