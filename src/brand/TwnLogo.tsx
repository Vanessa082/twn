import { site } from "@/lib/site";
import Link from "next/link";
import TwnMark from "./TwnMark";

interface TwnLogoProps {
  href?: string;
  descriptor?: "aside" | "below" | false;
  compact?: boolean;
  className?: string;
}

/**
 * Editorial lockup: Playfair “TWN” plus the long name.
 * Same structure magazines use — the letters are the logo.
 */
export default function TwnLogo({
  href,
  descriptor = "aside",
  compact = false,
  className = "",
}: TwnLogoProps) {
  const longName = descriptor && (
    <span
      aria-hidden="true"
      className={
        descriptor === "aside"
          ? "hidden flex-col justify-center border-l border-border pl-3 text-left leading-[1.4] sm:flex"
          : "mt-1.5 flex flex-col text-left leading-[1.4]"
      }
    >
      <span className="font-sans text-[8px] font-bold uppercase tracking-[0.28em] text-muted-foreground transition-colors group-hover:text-foreground">
        The Notebook
      </span>
      <span className="font-sans text-[8px] font-bold uppercase tracking-[0.28em] text-muted-foreground/70 transition-colors group-hover:text-muted-foreground">
        of a Tech Woman
      </span>
    </span>
  );

  const body = (
    <span
      className={`group inline-flex items-center gap-3 text-foreground transition-opacity duration-300 group-hover:opacity-70 ${className}`}
    >
      {descriptor === "below" ? (
        <span className="flex flex-col">
          <TwnMark className={compact ? "text-[26px]" : "text-[1.75rem] sm:text-[2rem]"} />
          {longName}
        </span>
      ) : (
        <>
          <TwnMark className={compact ? "text-[26px]" : "text-[1.75rem] sm:text-[2rem]"} />
          {longName}
        </>
      )}
    </span>
  );

  if (!href) return body;

  return (
    <Link href={href} className="w-fit" aria-label={`${site.name}, home`} data-cursor="link">
      {body}
    </Link>
  );
}
