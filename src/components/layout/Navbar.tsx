"use client";

/**
 * Navbar   88px height, invisible until scrolled 50px.
 * Pure editorial: tiny uppercase links, serif logo, CTA with hover lift.
 */

import { Menu, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  const links = [
    { label: "Notebook", href: "/articles" },
    { label: "Workbench", href: "/workbench" },
    { label: "About", href: "/about" },
    { label: "Archive", href: "/archive" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path) && path !== "/#community";
  };

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      // Blur + border appear only after 50px
      setIsScrolled(y > 50);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const headerClass = [
    "sticky top-0 z-50 w-full border-b transition-all duration-500 h-[88px]",
    isScrolled
      ? "bg-background/90 backdrop-blur-[20px] border-border"
      : "bg-background/0 border-transparent",
  ].join(" ");

  return (
    <header className={headerClass}>
      <div className="twn-nav-enter mx-auto max-w-7xl px-5 sm:px-10 lg:px-20 h-full">
        <div className="flex h-full items-center justify-between">
          {/* ── Logo ── */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group" data-cursor="link">
              <span className="font-serif text-[2rem] font-black tracking-[0.12em] text-foreground transition-opacity duration-300 group-hover:opacity-70 leading-none">
                TWN
              </span>
              <span className="hidden sm:flex flex-col border-l border-border pl-3 leading-[1.4] text-left">
                <span className="font-sans text-[8px] font-bold tracking-[0.28em] uppercase text-muted-foreground group-hover:text-foreground transition-colors">
                  The Notebook
                </span>
                <span className="font-sans text-[8px] font-bold tracking-[0.28em] uppercase text-muted-foreground/70 group-hover:text-muted-foreground transition-colors">
                  of a Tech Woman
                </span>
              </span>
            </Link>
          </div>

          {/* ── Desktop Nav — centered absolutely ── */}
          <nav
            className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2"
            aria-label="Primary navigation"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                data-cursor="link"
                className={[
                  "nav-ink-link text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors duration-200",
                  isActive(link.href)
                    ? "text-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
                {...(isActive(link.href) ? { "data-active": "true" } : {})}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-5">
            <Link
              href="/search"
              aria-label={t("search")}
              data-cursor="button"
              className="text-muted-foreground hover:text-foreground transition-colors duration-200 p-2"
            >
              <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </Link>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setIsOpen((v) => !v)}
              className="inline-flex items-center justify-center p-2 text-muted-foreground hover:text-foreground transition-colors lg:hidden cursor-pointer"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              data-cursor="button"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div id="mobile-menu" className="lg:hidden fixed inset-0 top-[88px] z-40 bg-background">
          <div className="flex flex-col h-full px-8 pt-10 pb-10 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                onClick={() => setIsOpen(false)}
                href={link.href}
                className={`block py-4 text-xl font-serif font-black tracking-tight border-b border-border transition-colors hover:text-foreground ${
                  isActive(link.href) ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-6">
              <Link
                onClick={() => setIsOpen(false)}
                href="/search"
                className="flex items-center gap-2 py-3 text-sm font-sans font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                <Search className="h-4 w-4" />
                Search the Notebook
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
