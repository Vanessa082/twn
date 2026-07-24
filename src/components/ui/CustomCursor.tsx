"use client";

import { useEffect, useRef, useState } from "react";

/**
 * CustomCursor — desktop-only fine-pointer cursor replacement.
 *
 * Behavior:
 * - Default:  tiny 8px black dot
 * - data-cursor="button" on element: expands to 32px circle (open ring)
 * - data-cursor="link" on element:   expands to 28px ring with mix-blend-mode
 *
 * Hidden entirely on touch devices via CSS `@media (pointer: fine)`.
 * Skipped when `prefers-reduced-motion: reduce` is set.
 */
export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [cursorClass, setCursorClass] = useState("");

  useEffect(() => {
    // Only run on fine-pointer (mouse/trackpad) devices
    if (!window.matchMedia("(pointer: fine)").matches) return;
    // Respect reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Apply class to hide native cursor globally
    document.body.classList.add("hide-native-cursor");

    const el = cursorRef.current;
    if (!el) return;

    // Track raw mouse position without setState to keep it off React's render cycle
    let cx = -80;
    let cy = -80;

    const onMove = (e: MouseEvent) => {
      cx = e.clientX;
      cy = e.clientY;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        el.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      });

      // Detect what's under the cursor
      const target = e.target as HTMLElement | null;
      const cursorType = target?.closest("[data-cursor]")?.getAttribute("data-cursor") ?? "";
      if (cursorType === "button") setCursorClass("is-button");
      else if (cursorType === "link") setCursorClass("is-link");
      else setCursorClass("");
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.body.classList.remove("hide-native-cursor");
    };
  }, []);

  return <div ref={cursorRef} className={`twn-cursor ${cursorClass}`} aria-hidden="true" />;
}
