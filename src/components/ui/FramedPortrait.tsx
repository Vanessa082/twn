import { optimizeImageUrl } from "@/modules/media";
import type { AuthorPortrait } from "@/modules/site/contracts";
import Image from "next/image";

interface FramedPortraitProps {
  portrait: AuthorPortrait;
  sizes: string;
  priority?: boolean;
  /** Show the caption and location beneath the photograph. */
  showCaption?: boolean;
  className?: string;
}

/**
 * Editorial portrait: a quiet paper mat with a thin inset frame drawn over the
 * photograph. Always 4:5, whatever shape the original upload was.
 */
export default function FramedPortrait({
  portrait,
  sizes,
  priority = false,
  showCaption = false,
  className = "",
}: FramedPortraitProps) {
  const { src, alt, caption, location } = portrait;
  const hasCaption = showCaption && (caption || location);

  return (
    <figure className={className}>
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-paper-deep">
        <Image
          src={optimizeImageUrl(src, { width: 1000 })}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover object-top"
        />
        <div
          className="pointer-events-none absolute inset-4 border border-white/75 sm:inset-6"
          aria-hidden="true"
        />
      </div>
      {hasCaption && (
        <figcaption className="mt-4 flex items-center justify-between gap-4 text-[11px] text-muted-foreground">
          {caption && <span className="font-quote text-[15px] italic">{caption}</span>}
          {location && (
            <span className="ml-auto shrink-0 font-sans font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
              {location}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
