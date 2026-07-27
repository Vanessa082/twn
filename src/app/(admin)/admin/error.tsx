"use client";

import { AlertOctagon, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AdminError Boundary]", error);
  }, [error]);

  return (
    <div className="py-16 px-4 max-w-xl mx-auto text-center space-y-6">
      <div className="p-4 rounded-full bg-amber-500/10 text-amber-500 w-fit mx-auto">
        <AlertOctagon className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
          Admin Portal Exception
        </span>
        <h1 className="text-2xl font-serif font-black tracking-tight text-foreground sm:text-3xl">
          CMS Operation Interrupted
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
          {error.message || "An error occurred while communicating with backend administration services."}
        </p>
      </div>

      <div className="pt-2 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Retry Request
        </button>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground font-bold text-xs uppercase tracking-wider hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
