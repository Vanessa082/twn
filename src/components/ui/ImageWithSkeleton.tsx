"use client";

/**
 * ImageWithSkeleton — a premium image component that handles:
 *
 * 1. SKELETON LOADING: Shows a shimmer placeholder while the image loads.
 *    The user never sees a blank space or a broken image flash.
 *
 * 2. CLOUDINARY OPTIMIZATION: Transforms the src URL to request the exact
 *    size needed at the quality level needed. This dramatically reduces
 *    bandwidth and speeds up page loads.
 *
 *    Cloudinary URL transformation format:
 *    https://res.cloudinary.com/<cloud>/image/upload/<transforms>/<public_id>
 *    We inject: f_auto (best format), q_auto (auto quality), w_<width>, c_fill
 *
 * 3. GRACEFUL ERROR: If the image fails to load (network error, deleted file),
 *    we show a clean editorial placeholder with the TWN monogram instead of
 *    a broken-image icon.
 *
 * 4. UNSPLASH OPTIMIZATION: Unsplash images also accept URL parameters
 *    (w=, q=, fm=, auto=format) for similar optimization.
 */

import Image from "next/image";
import { useState } from "react";

interface ImageWithSkeletonProps {
  src: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Cloudinary display width to request — used to optimize the URL */
  cloudinaryWidth?: number;
}

/**
 * Transforms a Cloudinary URL to add auto-format, quality, and resize parameters.
 * If it's an Unsplash URL, we add their native query params for optimization.
 * Other URLs are passed through unchanged.
 */
function optimizeImageUrl(src: string, width?: number): string {
  // Guard: if no URL, return as-is
  if (!src) return src;

  // Handle Cloudinary URLs
  if (src.includes("res.cloudinary.com")) {
    // Cloudinary URLs look like: https://res.cloudinary.com/cloud/image/upload/v123/path.jpg
    // We inject transformations: f_auto (best format), q_auto:good (smart quality), w_<n>
    const transforms = [
      "f_auto", // Auto-select best format (WebP, AVIF, etc.)
      "q_auto:good", // Smart quality — balances file size and visual fidelity
      width ? `w_${width}` : null,
      width ? "c_fill" : null, // Crop to exact width maintaining aspect ratio
    ]
      .filter(Boolean)
      .join(",");

    // Inject transforms right after /upload/
    return src.replace("/upload/", `/upload/${transforms}/`);
  }

  // Handle Unsplash URLs — they accept standard query params
  if (src.includes("images.unsplash.com")) {
    const url = new URL(src);
    url.searchParams.set("auto", "format"); // Auto format (WebP, etc.)
    url.searchParams.set("fit", "crop");
    url.searchParams.set("q", "80"); // Quality 80 — good balance
    if (width) url.searchParams.set("w", String(width));
    return url.toString();
  }

  // All other URLs: pass through unchanged
  return src;
}

export default function ImageWithSkeleton({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  priority = false,
  className = "",
  cloudinaryWidth,
}: ImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Optimize the URL before passing to Next.js Image
  const optimizedSrc = src ? optimizeImageUrl(src, cloudinaryWidth ?? width) : null;

  // Error state — clean editorial placeholder instead of broken image icon
  if (hasError || !optimizedSrc) {
    return (
      <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-900 flex flex-col items-center justify-center gap-2">
        <span className="font-serif font-black text-5xl tracking-widest text-foreground/10">
          TWN
        </span>
      </div>
    );
  }

  return (
    <>
      {/* Shimmer skeleton — visible while image is loading */}
      {isLoading && <div className="absolute inset-0 skeleton z-10" aria-hidden="true" />}

      <Image
        src={optimizedSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        priority={priority}
        className={`${className} transition-opacity duration-500 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </>
  );
}
