"use client";

/**
 * InkLine — The TWN brand signature ink line.
 *
 * This path is designed to match the Figma image exactly:
 *   - Starts from the left side (under the typewriter thought).
 *   - Sweeps down and curves right under/behind the notebook.
 *   - Sweeps up dramatically on the right side and exits the screen.
 *
 * Animates drawing itself once on page load (2.2s).
 */
export default function InkLine() {
  return (
    <svg
      viewBox="0 0 600 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d="M -10 260 C 120 260, 180 380, 270 360 C 360 340, 480 320, 500 200 C 510 130, 530 110, 610 80"
        stroke="#111111"
        strokeWidth="1.2"
        strokeLinecap="round"
        className="twn-ink-line"
        style={{ opacity: 0.18 }}
      />
    </svg>
  );
}
