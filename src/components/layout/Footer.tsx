"use client";

/**
 * Footer   5-column editorial layout. Contact details and social links come from
 * Admin → Homepage; only configured links render.
 * Newsletter form is dynamically loaded only when NEWSLETTER_ENABLED is true,
 * so a Resend/email failure cannot take down every page via the root layout.
 */

import { NEWSLETTER_ENABLED } from "@/lib/feature-flags";
import type { SocialLink } from "@/types/cms";
import { Clock } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

const FooterSubscribeForm = NEWSLETTER_ENABLED
  ? dynamic(() => import("./FooterSubscribeForm"), { ssr: false })
  : null;

interface FooterProps {
  contactEmail: string | null;
  location: string | null;
  socialLinks: SocialLink[];
}

export default function Footer({ contactEmail, location, socialLinks }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const exploreLinks = [
    { label: "Notebook", href: "/notebook" },
    { label: "Workbench", href: "/workbench" },
    { label: "Archive", href: "/archive" },
    { label: "Collections", href: "/collections" },
  ];

  const infoLinks = [
    { label: "About Vanessa", href: "/about" },
    { label: "Newsletter", href: "/newsletter" },
    { label: "Leave a page", href: "/community" },
    { label: "Search", href: "/search" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-10 lg:px-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 pb-12 border-b border-border">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex flex-col gap-1 w-fit group">
              <span className="font-serif text-[26px] font-black tracking-[0.12em] text-foreground group-hover:opacity-75 transition-opacity leading-none">
                TWN
              </span>
              <span className="text-[8px] font-bold uppercase tracking-[0.22em] text-muted-foreground/70 leading-tight">
                The Notebook
                <br />
                of a Tech Woman
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[220px] mt-1 font-sans">
              Written, built &amp; kept by Vanessa. Some things are worth remembering.
            </p>
            {socialLinks.length > 0 && (
              <ul className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
                {socialLinks.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-[10px] font-sans font-bold uppercase tracking-[0.22em] text-foreground">
              Explore
            </h3>
            <ul className="flex flex-col gap-2.5">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-[10px] font-sans font-bold uppercase tracking-[0.22em] text-foreground">
              Information
            </h3>
            <ul className="flex flex-col gap-2.5">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-[10px] font-sans font-bold uppercase tracking-[0.22em] text-foreground">
              Connect
            </h3>
            <ul className="flex flex-col gap-2.5">
              {contactEmail && (
                <li>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {contactEmail}
                  </a>
                </li>
              )}
              {location && <li className="text-xs text-muted-foreground">{location}</li>}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-[10px] font-sans font-bold uppercase tracking-[0.22em] text-foreground">
              Stay in the loop
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Get new notes directly in your inbox.
            </p>
            {NEWSLETTER_ENABLED && FooterSubscribeForm ? (
              <FooterSubscribeForm />
            ) : (
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <Clock className="size-3.5 text-ink-accent" aria-hidden="true" />
                <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.15em]">
                  Coming Soon
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-8 text-xs text-muted-foreground/70">
          <p>© {currentYear} The Notebook of a Tech Woman. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
