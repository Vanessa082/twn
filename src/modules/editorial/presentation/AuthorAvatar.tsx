import { optimizeImageUrl } from "@/modules/media";
import type { AuthorPortrait } from "@/modules/site/contracts";
import Image from "next/image";

interface AuthorAvatarProps {
  name: string;
  portrait: AuthorPortrait | null;
  /** Tailwind size and shape classes, e.g. "size-11 rounded-full". */
  className?: string;
  sizes?: string;
}

/** The author's portrait, or her initial when no portrait is published. */
export default function AuthorAvatar({
  name,
  portrait,
  className = "size-11 rounded-full",
  sizes = "44px",
}: AuthorAvatarProps) {
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-muted ${className}`}
    >
      {portrait ? (
        <Image
          src={optimizeImageUrl(portrait.src, { width: 200 })}
          alt=""
          fill
          sizes={sizes}
          className="object-cover object-top"
        />
      ) : (
        <span aria-hidden="true" className="font-serif text-base font-black text-foreground/60">
          {name.charAt(0)}
        </span>
      )}
    </span>
  );
}
