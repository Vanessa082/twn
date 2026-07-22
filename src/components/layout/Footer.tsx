"use client";

/**
 * Footer — 5-column editorial layout.
 * Newsletter form is dynamically loaded only when NEWSLETTER_ENABLED is true,
 * so a Resend/email failure cannot take down every page via the root layout.
 */

import { NEWSLETTER_ENABLED } from "@/lib/feature-flags";
import { Clock } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

const FooterSubscribeForm = NEWSLETTER_ENABLED
  ? dynamic(() => import("./FooterSubscribeForm"), { ssr: false })
  : null;

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const exploreLinks = [
    { label: "Home", href: "/" },
    { label: "Articles", href: "/articles" },
    { label: "Notebook", href: "/#community" },
    { label: "About", href: "/about" },
    { label: "Newsletter", href: "/newsletter" },
    { label: "Contact", href: "/contact" },
  ];

  const infoLinks = [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/about" },
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
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px] mt-1">
              Notes on technology, ideas, challenges, and the journey of becoming.
            </p>
            <div className="flex items-center gap-3 mt-1">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-muted-foreground/70 hover:text-foreground transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="text-muted-foreground/70 hover:text-foreground transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-muted-foreground/70 hover:text-foreground transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M15 22v-4a4.8 4.8 0 00-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 004 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
            </div>
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
              <li>
                <a
                  href="mailto:hello@twnotebook.com"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  hello@twnotebook.com
                </a>
              </li>
              <li className="text-xs text-muted-foreground">Abuja, Nigeria</li>
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
                <Clock className="h-3.5 w-3.5 text-[#AE8D64]" aria-hidden="true" />
                <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.15em]">
                  Coming Soon
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-8 text-xs text-muted-foreground/70">
          <p>© {currentYear} The Notebook of a Tech Woman. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-foreground transition-colors">
              Terms of Use
            </Link>
            <Link href="/about" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
