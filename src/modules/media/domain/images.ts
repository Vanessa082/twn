/**
 * Image rules shared by the browser (instant feedback) and the server (the
 * real gate). Keep both sides importing from here so the limits never drift.
 */

export const IMAGE_UPLOAD_PURPOSES = ["cover", "inline", "portrait"] as const;
export type ImageUploadPurpose = (typeof IMAGE_UPLOAD_PURPOSES)[number];

export const IMAGE_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export type AllowedImageType = (typeof IMAGE_ALLOWED_TYPES)[number];

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

/** Longest edge stored on Cloudinary. Larger originals are scaled down on upload. */
export const IMAGE_MAX_DIMENSION = 2400;

export const IMAGE_ACCEPT = IMAGE_ALLOWED_TYPES.join(",");
export const IMAGE_LIMITS_HINT = "JPG, PNG, WebP or AVIF · up to 5 MB";

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isAllowedImageType(type: string): type is AllowedImageType {
  return (IMAGE_ALLOWED_TYPES as readonly string[]).includes(type);
}

/** Returns a reader-friendly problem, or null when the file is acceptable. */
export function validateImageFile(file: { type: string; size: number }): string | null {
  if (!isAllowedImageType(file.type)) {
    return `That file type isn't supported. Use ${IMAGE_LIMITS_HINT.split(" · ")[0]}.`;
  }
  if (file.size === 0) return "That file is empty.";
  if (file.size > IMAGE_MAX_BYTES) {
    return `That image is ${formatBytes(file.size)}. Please keep it under ${formatBytes(IMAGE_MAX_BYTES)}.`;
  }
  return null;
}

/**
 * Detects the real format from the file's first bytes, so a renamed file
 * cannot pass as an image just by lying about its MIME type.
 */
export function sniffImageType(bytes: Uint8Array): AllowedImageType | null {
  const startsWith = (sig: number[], offset = 0) => sig.every((b, i) => bytes[offset + i] === b);
  if (startsWith([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8)) {
    return "image/webp";
  }
  if (startsWith([0x66, 0x74, 0x79, 0x70], 4)) {
    const brand = String.fromCharCode(...bytes.slice(8, 12));
    if (brand === "avif" || brand === "avis") return "image/avif";
  }
  return null;
}

interface OptimizeOptions {
  width?: number;
  /** "fill" crops to the width; "limit" only ever scales down. */
  crop?: "fill" | "limit";
}

/**
 * Asks the image CDN for a right-sized, modern-format copy. Unknown hosts pass
 * through untouched.
 */
export function optimizeImageUrl(src: string, { width, crop = "fill" }: OptimizeOptions = {}) {
  if (!src) return src;

  if (src.includes("res.cloudinary.com") && src.includes("/upload/")) {
    if (/\/upload\/[^/]*f_auto/.test(src)) return src;
    const transforms = [
      "f_auto",
      "q_auto:good",
      width ? `w_${width}` : null,
      width ? `c_${crop}` : null,
    ]
      .filter(Boolean)
      .join(",");
    return src.replace("/upload/", `/upload/${transforms}/`);
  }

  if (src.includes("images.unsplash.com") && URL.canParse(src)) {
    const url = new URL(src);
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", crop === "fill" ? "crop" : "max");
    url.searchParams.set("q", "80");
    if (width) url.searchParams.set("w", String(width));
    return url.toString();
  }

  return src;
}
