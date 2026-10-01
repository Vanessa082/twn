import { site } from "@/lib/site";

interface TwnMarkProps {
  className?: string;
  title?: string;
}

/**
 * The TWN wordmark. Colour is currentColor, so it follows the text around it
 * and flips automatically in dark mode. No plate, no second colour.
 */
export default function TwnMark({ className = "", title }: TwnMarkProps) {
  return (
    <span
      className={`font-serif font-black leading-none tracking-[0.12em] ${className}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {site.shortName}
    </span>
  );
}
