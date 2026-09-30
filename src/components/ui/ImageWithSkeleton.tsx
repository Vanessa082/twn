"use client";

/**
 * ImageWithSkeleton shows a shimmer while loading, requests a right-sized copy
 * from the image CDN, and falls back to the TWN monogram if the file is gone.
 */

import { optimizeImageUrl } from "@/modules/media";
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
  /** Display width to request from the image CDN */
  cloudinaryWidth?: number;
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

  const optimizedSrc = src ? optimizeImageUrl(src, { width: cloudinaryWidth ?? width }) : null;

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
