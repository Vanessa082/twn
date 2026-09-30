"use client";

import FramedPortrait from "@/components/ui/FramedPortrait";
import { Eyebrow, TextLink } from "@/components/ui/SectionHeading";
import { useInView } from "@/hooks/useInView";
import type { AuthorPortrait } from "@/modules/site/contracts";
import Link from "next/link";

export interface VersionItem {
  number: string;
  role: string;
  description: string;
}

interface VersionsOfMeSectionProps {
  versions: VersionItem[];
  authorName: string;
  portrait: AuthorPortrait | null;
  lead?: string;
}

export default function VersionsOfMeSection({
  versions,
  authorName,
  portrait,
  lead,
}: VersionsOfMeSectionProps) {
  const [ref, inView] = useInView<HTMLElement>();

  if (versions.length === 0) return null;

  return (
    <section
      ref={ref}
      aria-labelledby="versions-heading"
      className={`twn-reveal ${inView ? "is-visible" : ""} border-b border-border bg-background py-20 sm:py-28`}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-20">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-20">
          {portrait && (
            <div className="lg:col-span-5 lg:sticky lg:top-28">
              <FramedPortrait
                portrait={portrait}
                sizes="(max-width: 1024px) 90vw, 40vw"
                className="mx-auto max-w-[440px] lg:max-w-none"
              />
            </div>
          )}

          <div className={portrait ? "lg:col-span-7" : "lg:col-span-12 lg:max-w-4xl"}>
            <Eyebrow>The woman behind the notebook</Eyebrow>
            <h2
              id="versions-heading"
              className="mt-4 font-serif font-bold leading-[1.08] tracking-[-0.02em] text-foreground text-balance"
              style={{ fontSize: "clamp(2rem, 4vw, 3.1rem)" }}
            >
              A few versions of me
            </h2>
            {lead && (
              <p className="mt-5 font-quote text-2xl leading-snug text-foreground/80">
                &ldquo;{lead}&rdquo;
              </p>
            )}
            <ol className="mt-10 border-t border-border">
              {versions.map((v) => (
                <li
                  key={v.number}
                  className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-b border-border py-5 sm:grid-cols-[3rem_11rem_1fr] sm:gap-x-6"
                >
                  <span className="pt-1 font-mono text-[11px] text-ink-accent">{v.number}</span>
                  <h3 className="font-serif text-lg font-bold leading-snug text-foreground">
                    {v.role}
                  </h3>
                  <p className="col-start-2 mt-1 text-[14px] leading-[1.7] text-muted-foreground sm:col-start-3 sm:mt-0">
                    {v.description}
                  </p>
                </li>
              ))}
            </ol>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link
                href="/about"
                data-cursor="link"
                className="inline-flex h-11 items-center justify-center rounded-[4px] bg-foreground px-6 text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-background transition-opacity duration-300 hover:opacity-85"
              >
                Meet {authorName}
              </Link>
              <TextLink href="/notebook">Read her notes</TextLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
