import Image from "next/image";

interface FramedPortraitProps {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  caption?: string;
  className?: string;
}

/**
 * Editorial portrait: a quiet paper mat with a thin inset frame drawn over the photograph.
 */
export default function FramedPortrait({
  src,
  alt,
  sizes,
  priority = false,
  caption,
  className = "",
}: FramedPortraitProps) {
  return (
    <figure className={className}>
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-paper-deep">
        <Image
          src={src}
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
      {caption && (
        <figcaption className="mt-4 flex items-center justify-between gap-4 text-[11px] text-muted-foreground">
          <span className="font-quote text-[15px] italic">{caption}</span>
          <span className="font-sans font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
            Yaoundé
          </span>
        </figcaption>
      )}
    </figure>
  );
}
