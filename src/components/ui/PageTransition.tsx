"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * PageTransition — white-sheet page turn on route navigation.
 *
 * A white overlay slides up from the bottom (entering), then slides up
 * and out the top (exiting) — like turning a page in a notebook.
 *
 * Mounts globally in layout.tsx. Watches pathname for changes.
 */
export default function PageTransition() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "entering" | "exiting">("idle");
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Don't animate on the very first mount
    if (prevPathRef.current === pathname) return;

    prevPathRef.current = pathname;

    // Wipe in
    setPhase("entering");
    const enterTimer = setTimeout(() => {
      // Hold briefly then wipe out
      setPhase("exiting");
      const exitTimer = setTimeout(() => setPhase("idle"), 450);
      return () => clearTimeout(exitTimer);
    }, 450);

    return () => clearTimeout(enterTimer);
  }, [pathname]);

  if (phase === "idle") return null;

  return <div className={`twn-page-wipe ${phase}`} aria-hidden="true" />;
}
