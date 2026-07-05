"use client";

/**
 * NotebookSketch — The signature TWN Hero Notebook.
 *
 * Implements the Figma / Design Specification:
 *   - Rotated ~15° clockwise, subtle 3/4 camera perspective.
 *   - Matte ivory pages (#F8F6F2), spacing lines (#E7E1D8), rounded corners, visible thickness stack.
 *   - Spine Crease and spiral ring binding with soft shadow.
 *   - Faint handwritten notes & flowcharts (User -> API -> Database).
 *   - Matte black fountain pen crossing at 38° diagonally, silver nib, thin body, with a tiny fresh ink dot (#202020).
 *   - Floating paper dust particles around.
 *   - Soft shadow beneath (50px blur, rgba(0,0,0,0.08) base opacity).
 *   - Hover lift transitions, pen micro-rotation (1°), and shadow deepening to 14%.
 *   - Animated pen highlight reflection sweep.
 */

import { useEffect, useState } from "react";

export default function NotebookSketch({ mouseX = 0, mouseY = 0 }: { mouseX?: number; mouseY?: number }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full max-w-[500px] h-[340px] bg-transparent" />;
  }

  // Parallax tracking
  const parallaxX = mouseX * 3;
  const parallaxY = mouseY * 3;

  return (
    <div className="w-full select-none pointer-events-none relative flex items-center justify-center py-6">
      {/* Self-contained CSS for high performance GPU animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        .notebook-container {
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          animation: notebook-float 8s ease-in-out infinite;
        }
        .notebook-wrapper:hover .notebook-container {
          transform: translateY(-5px);
        }
        .notebook-pages-group {
          animation: notebook-breath 10s ease-in-out infinite;
          transform-origin: 300px 210px;
        }
        .notebook-shadow {
          opacity: 0.08;
          transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .notebook-wrapper:hover .notebook-shadow {
          opacity: 0.14;
        }
        .pen-group {
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: 310px 270px;
        }
        .notebook-wrapper:hover .pen-group {
          transform: rotate(1deg) translate(${parallaxX * 1.5}px, ${parallaxY * 1.5}px);
        }
        .pen-reflection {
          animation: pen-reflect-sweep 16s linear infinite;
        }

        @keyframes notebook-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes notebook-breath {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.004); }
        }
        @keyframes pen-reflect-sweep {
          0%, 85% { transform: translateY(-80px) rotate(45deg); opacity: 0; }
          90% { opacity: 0.4; }
          95%, 100% { transform: translateY(120px) rotate(45deg); opacity: 0; }
        }
      `}} />

      {/* Interactive Wrapper */}
      <div className="notebook-wrapper w-full max-w-[500px] pointer-events-auto cursor-default relative">
        <svg
          viewBox="0 0 600 420"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <defs>
            {/* Soft Shadow Filter (50px Blur) */}
            <filter id="notebook-shadow-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="22" />
            </filter>
            
            {/* Pen Soft Shadow Filter */}
            <filter id="pen-shadow-filter" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" />
            </filter>

            {/* Subtle paper grain texture pattern */}
            <pattern id="paper-texture" width="4" height="4" patternUnits="userSpaceOnUse">
              <rect width="4" height="4" fill="#F8F6F2" />
              <circle cx="2" cy="2" r="0.5" fill="#EAE8E2" opacity="0.4" />
            </pattern>

            {/* Gradient for Matte Black Pen Body */}
            <linearGradient id="pen-barrel-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1C1C1C" />
              <stop offset="35%" stopColor="#2D2D2D" />
              <stop offset="70%" stopColor="#161616" />
              <stop offset="100%" stopColor="#0B0B0B" />
            </linearGradient>

            {/* Gradient for Silver Metallic Nib */}
            <linearGradient id="silver-metal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E2E2E2" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#A8A8A8" />
            </linearGradient>
          </defs>

          {/* ── Layer 1: Floating Dust Particles (Background) ── */}
          <g opacity="0.3">
            <circle cx="80"  cy="120" r="1.5" fill="#AE8D64" opacity="0.6" />
            <circle cx="120" cy="80"  r="1.0" fill="#AE8D64" opacity="0.4" />
            <circle cx="510" cy="110" r="2.0" fill="#AE8D64" opacity="0.5" />
            <circle cx="490" cy="290" r="1.2" fill="#AE8D64" opacity="0.7" />
            <circle cx="160" cy="380" r="1.5" fill="#AE8D64" opacity="0.5" />
            <circle cx="340" cy="70"  r="1.0" fill="#AE8D64" opacity="0.4" />
          </g>

          {/* ── Layer 2: Main Soft Underlay Shadow ── */}
          <rect
            x="70"
            y="110"
            width="460"
            height="230"
            rx="45"
            fill="#000000"
            filter="url(#notebook-shadow-filter)"
            className="notebook-shadow"
          />

          {/* ── Layer 3: Floating Notebook Body (Rotated ~15° & Skewed) ── */}
          <g className="notebook-container" style={{ transform: `translate(${parallaxX}px, ${parallaxY}px)` }}>
            {/* The Notebook Wrapper Group with Perspective Skew and Rotation */}
            <g transform="rotate(14, 300, 210) skewX(-4)">
              
              {/* Pages stack breathing block */}
              <g className="notebook-pages-group">
                
                {/* ── Layer 3a: Under Cover and Pages Stack Depth (Visible Thickness) ── */}
                <g stroke="#E0DDD6" strokeWidth="1" opacity="0.9">
                  {/* Left stack border offsets */}
                  <path d="M 88 102 L 88 322 L 296 322" fill="none" />
                  <path d="M 86 104 L 86 324 L 296 324" fill="none" />
                  <path d="M 84 106 L 84 326 L 296 326" fill="none" />
                  
                  {/* Right stack border offsets */}
                  <path d="M 512 102 L 512 322 L 304 322" fill="none" />
                  <path d="M 514 104 L 514 324 L 304 324" fill="none" />
                  <path d="M 516 106 L 516 326 L 304 326" fill="none" />
                </g>

                {/* ── Layer 3b: Open Pages (Left and Right Sheets) ── */}
                {/* Left Sheet */}
                <path
                  d="M 90 100 C 90 95, 95 90, 100 90 L 296 90 L 296 320 L 100 320 C 95 320, 90 315, 90 310 Z"
                  fill="url(#paper-texture)"
                  stroke="#E4E1DA"
                  strokeWidth="1.2"
                />
                
                {/* Right Sheet */}
                <path
                  d="M 304 90 L 500 90 C 505 90, 510 95, 510 100 L 510 310 C 510 315, 505 320, 500 320 L 304 320 Z"
                  fill="url(#paper-texture)"
                  stroke="#E4E1DA"
                  strokeWidth="1.2"
                />

                {/* ── Layer 3c: Horizontal Rules (#E7E1D8) ── */}
                <g stroke="#E7E1D8" strokeWidth="0.8">
                  {/* Left Page Lines */}
                  {Array.from({ length: 11 }).map((_, i) => (
                    <line key={`left-line-${i}`} x1="110" y1={110 + i * 18} x2="280" y2={110 + i * 18} />
                  ))}
                  
                  {/* Right Page Lines */}
                  {Array.from({ length: 11 }).map((_, i) => (
                    <line key={`right-line-${i}`} x1="320" y1={110 + i * 18} x2="490" y2={110 + i * 18} />
                  ))}
                </g>

                {/* Spine crease shading */}
                <rect x="296" y="90" width="8" height="230" fill="rgba(0,0,0,0.03)" />
                <line x1="300" y1="90" x2="300" y2="320" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />

                {/* Spiral Binding Rings */}
                {Array.from({ length: 10 }).map((_, i) => {
                  const y = 100 + i * 22;
                  return (
                    <g key={`spiral-${i}`}>
                      <path
                        d={`M 294 ${y} C 294 ${y - 4}, 306 ${y - 4}, 306 ${y}`}
                        stroke="#B6B3AA"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <circle cx="295" cy={y} r="1.2" fill="#B6B3AA" />
                      <circle cx="305" cy={y} r="1.2" fill="#B6B3AA" />
                    </g>
                  );
                })}

                {/* ── Layer 3d: Faint Sketches & Handwriting (Left Page) ── */}
                {/* Pencil Flowchart sketch */}
                <g stroke="#C2BDB2" strokeWidth="0.8" fill="none" opacity="0.75">
                  {/* User box */}
                  <rect x="135" y="122" width="36" height="13" rx="2" />
                  <text x="141" y="131" fontFamily="monospace" fontSize="7" fill="#C2BDB2" stroke="none">User</text>
                  
                  {/* Down Arrow */}
                  <path d="M 153 135 L 153 145 M 151 143 L 153 145 L 155 143" />
                  
                  {/* API Box */}
                  <rect x="138" y="148" width="30" height="13" rx="2" />
                  <text x="146" y="157" fontFamily="monospace" fontSize="7" fill="#C2BDB2" stroke="none">API</text>

                  {/* Down Arrow */}
                  <path d="M 153 161 L 153 171 M 151 169 L 153 171 L 155 169" />

                  {/* DB Box (cylinder shape) */}
                  <path d="M 137 177 C 137 175, 169 175, 169 177 L 169 187 C 169 189, 137 189, 137 187 Z" />
                  <path d="M 137 180 C 137 182, 169 182, 169 180" />
                  <text x="147" y="185" fontFamily="monospace" fontSize="6.5" fill="#C2BDB2" stroke="none">DB</text>
                </g>

                {/* Faint Handwritten Marks (Right Page) */}
                <g fill="#AFAAA0" fontFamily="monospace" fontSize="9" opacity="0.65">
                  <text x="330" y="123">• API</text>
                  <text x="330" y="141">→ auth()</text>
                  <text x="330" y="159">✓ deployed</text>
                  <text x="330" y="177">cache?</text>
                  <text x="330" y="195">v2</text>
                  
                  {/* Faint handwritten wavy lines */}
                  <path d="M 330 228 Q 350 226, 370 229 T 410 227" stroke="#C2BDB2" strokeWidth="1" fill="none" />
                  <path d="M 330 246 Q 360 244, 380 247 T 420 245" stroke="#C2BDB2" strokeWidth="0.85" fill="none" />
                </g>

              </g>

            </g>

            {/* ── Layer 4: Matte Black Fountain Pen (Diagonally Placed) ── */}
            {/*
              Pen angle: ~38° diagonal position.
              Points from top-right down to bottom-left.
              Placed over the notebook crease to look extremely natural.
            */}
            <g className="pen-group">
              {/* Pen Shadow */}
              <line
                x1="380"
                y1="130"
                x2="280"
                y2="280"
                stroke="rgba(0,0,0,0.14)"
                strokeWidth="7"
                strokeLinecap="round"
                filter="url(#pen-shadow-filter)"
              />

              {/* Tilted Fountain Pen Group */}
              {/* Drawn straight, then rotated 38° to align */}
              <g transform="translate(330, 205) rotate(38)">
                
                {/* Pen Cap (top) */}
                <rect x="-4.5" y="-70" width="9" height="50" rx="2" fill="url(#pen-barrel-grad)" />
                {/* Silver clip */}
                <rect x="-1" y="-62" width="2" height="32" rx="0.5" fill="#E2E2E2" />
                <circle cx="0" cy="-30" r="1.5" fill="#FFFFFF" />
                {/* Gold accent band on cap */}
                <rect x="-4.7" y="-24" width="9.4" height="2" fill="url(#gold-trim)" />

                {/* Pen Body / Barrel */}
                <rect x="-4" y="-20" width="8" height="65" rx="1.5" fill="url(#pen-barrel-grad)" />
                {/* Gold accent band on barrel */}
                <rect x="-4.2" y="42" width="8.4" height="1.5" fill="url(#gold-trim)" />

                {/* Silver metallic nib sleeve */}
                <path d="M -3 45 L 3 45 L 2 54 L -2 54 Z" fill="url(#silver-metal)" />
                {/* Steel/Silver Nib */}
                <path d="M -2 54 L 2 54 L 1.2 68 L -1.2 68 Z" fill="#E2E2E2" />
                <line x1="0" y1="54" x2="0" y2="66" stroke="#999999" strokeWidth="0.5" />
                {/* Pen tip element */}
                <circle cx="0" cy="68" r="0.8" fill="#1C1C1C" />

                {/* Moving Highlight Reflection Layer */}
                <g opacity="0.3" clipPath="url(#cap-clip)">
                  <rect x="-4" y="-80" width="8" height="20" fill="#FFFFFF" className="pen-reflection" />
                </g>

              </g>

              {/* ── Layer 5: Fresh Ink Dot (#202020) ── */}
              {/* Located precisely at the tip of the pen (x: 279, y: 265 approx) */}
              <circle cx="277" cy="265" r="1.8" fill="#202020" />
            </g>

          </g>
        </svg>
      </div>
    </div>
  );
}
