"use client";

import { CheckCircle2, Circle, Loader2 } from "lucide-react";

export type SaveStatus = "idle" | "saving" | "saved" | "unsaved";

interface SaveStatusIndicatorProps {
  status: SaveStatus;
}

/**
 * SaveStatusIndicator
 *
 * A small badge shown in the article editor toolbar that gives the author
 * continuous feedback on whether their work is saved.
 *
 * States:
 *   idle     — no changes have been made since the page loaded
 *   unsaved  — the author has typed something but not saved
 *   saving   — the save action is in flight (isPending from useTransition)
 *   saved    — the save action completed successfully
 */
export default function SaveStatusIndicator({ status }: SaveStatusIndicatorProps) {
  if (status === "idle") return null;

  const config = {
    saving: {
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />,
      label: "Saving…",
      className: "text-muted-foreground bg-muted border-border",
    },
    saved: {
      icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
      label: "Saved",
      className: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    unsaved: {
      icon: <Circle className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />,
      label: "Unsaved changes",
      className: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
  } as const;

  const { icon, label, className } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all duration-300 ${className}`}
    >
      {icon}
      {label}
    </span>
  );
}
