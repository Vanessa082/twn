"use client";

/**
 * ScrollReveal — wraps any content and triggers a scroll-based entrance animation.
 *
 * How it works:
 *  1. The wrapper starts with the CSS class "reveal" (opacity:0, translateY(24px)).
 *  2. An IntersectionObserver watches when the element enters the viewport.
 *  3. When 15% of the element is visible, we add "in-view" which CSS transitions
 *     to opacity:1 / translateY(0) using a smooth cubic-bezier easing.
 *  4. We disconnect the observer after first trigger — no need to keep watching.
 *
 * The `stagger` prop adds "reveal-stagger" which auto-delays each direct child
 * child element by 80ms increments for a beautiful cascade effect.
 */

import { useEffect, useRef } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Use stagger variant — children cascade in one by one */
  stagger?: boolean;
  /** Delay before animation fires after element enters viewport (ms) */
  delay?: number;
}

export default function ScrollReveal({
  children,
  className = "",
  stagger = false,
  delay = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Optional delay before applying animation
          const timer = setTimeout(() => {
            el.classList.add("in-view");
          }, delay);
          observer.disconnect();
          return () => clearTimeout(timer);
        }
      },
      {
        threshold: 0.12, // Fires when 12% of element is visible
        rootMargin: "0px 0px -40px 0px", // Trigger slightly before reaching the element
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const baseClass = stagger ? "reveal-stagger" : "reveal";

  return (
    <div ref={ref} className={`${baseClass} ${className}`}>
      {children}
    </div>
  );
}
