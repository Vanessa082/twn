import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface SectionHeadingAction {
  label: string;
  href: string;
}

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  action?: SectionHeadingAction;
  /** Quiet metadata shown where the action would sit, e.g. a "last updated" date. */
  aside?: ReactNode;
  /** Inverts colours for sections that sit on a dark band. */
  tone?: "default" | "inverted";
  className?: string;
}

export function Eyebrow({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "inverted";
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-[10px] font-sans font-semibold uppercase tracking-[0.28em] ${
        tone === "inverted" ? "text-background/60" : "text-muted-foreground"
      }`}
    >
      <span className="size-1 rounded-full bg-ink-accent" aria-hidden="true" />
      {children}
    </span>
  );
}

export function TextLink({
  href,
  children,
  tone = "default",
  className = "",
}: {
  href: string;
  children: ReactNode;
  tone?: "default" | "inverted";
  className?: string;
}) {
  return (
    <Link
      href={href}
      data-cursor="link"
      className={`group inline-flex items-center gap-2 text-[11px] font-sans font-semibold uppercase tracking-[0.2em] transition-colors duration-300 ${
        tone === "inverted"
          ? "text-background/70 hover:text-background"
          : "text-muted-foreground hover:text-foreground"
      } ${className}`}
    >
      <span>{children}</span>
      <ArrowRight
        className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
        aria-hidden="true"
      />
    </Link>
  );
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  aside,
  tone = "default",
  className = "",
}: SectionHeadingProps) {
  return (
    <div
      className={`mb-12 flex flex-col gap-6 sm:mb-16 sm:flex-row sm:items-end sm:justify-between ${className}`}
    >
      <div className="max-w-2xl">
        <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        <h2
          className={`mt-4 font-serif font-bold leading-[1.1] tracking-[-0.02em] text-balance ${
            tone === "inverted" ? "text-background" : "text-foreground"
          }`}
          style={{ fontSize: "clamp(1.9rem, 3.6vw, 2.75rem)" }}
        >
          {title}
        </h2>
        {description && (
          <p
            className={`mt-4 max-w-xl text-[15px] leading-[1.75] text-pretty ${
              tone === "inverted" ? "text-background/65" : "text-muted-foreground"
            }`}
          >
            {description}
          </p>
        )}
      </div>

      {action && (
        <TextLink href={action.href} tone={tone} className="shrink-0">
          {action.label}
        </TextLink>
      )}
      {!action && aside && (
        <span className="shrink-0 font-quote text-base italic text-muted-foreground">{aside}</span>
      )}
    </div>
  );
}
