"use client";

/**
 * Navbar   88px height, invisible until scrolled 50px.
 * Pure editorial: tiny uppercase links, serif logo, search that opens an overlay.
 */

import { routes } from "@/lib/site";
import { Menu, Search, X } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const loadSearchOverlay = () => import("@/components/search/SearchOverlay");
const SearchOverlay = dynamic(loadSearchOverlay, { ssr: false });

const links = [
  { label: "Notebook", href: routes.notebook },
  { label: "Workbench", href: routes.workbench },
  { label: "About", href: routes.about },
  { label: "Archive", href: routes.archive },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const openSearch = useCallback(() => {
    setIsOpen(false);
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "");
      if (
        (event.key === "k" && (event.metaKey || event.ctrlKey)) ||
        (event.key === "/" && !typing)
      ) {
        event.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSearch]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: close menus whenever the route changes
  useEffect(() => {
    setIsOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (event: globalThis.KeyboardEvent) => event.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const headerClass = [
    "sticky top-0 z-50 w-full border-b transition-all duration-500 h-[72px] sm:h-[88px]",
    isScrolled || isOpen
      ? "bg-background/90 backdrop-blur-[20px] border-border"
      : "bg-background/0 border-transparent",
  ].join(" ");

  return (
    <>
      <header className={headerClass}>
        <div className="twn-nav-enter mx-auto h-full max-w-7xl px-5 sm:px-10 lg:px-20">
          <div className="relative flex h-full items-center justify-between">
            <Link
              href={routes.home}
              className="group flex items-center gap-3"
              data-cursor="link"
              aria-label="The Notebook of a Tech Woman, home"
            >
              <span className="font-serif text-[1.75rem] font-black leading-none tracking-[0.12em] text-foreground transition-opacity duration-300 group-hover:opacity-70 sm:text-[2rem]">
                TWN
              </span>
              <span
                aria-hidden="true"
                className="hidden flex-col border-l border-border pl-3 text-left leading-[1.4] sm:flex"
              >
                <span className="font-sans text-[8px] font-bold uppercase tracking-[0.28em] text-muted-foreground transition-colors group-hover:text-foreground">
                  The Notebook
                </span>
                <span className="font-sans text-[8px] font-bold uppercase tracking-[0.28em] text-muted-foreground/70 transition-colors group-hover:text-muted-foreground">
                  of a Tech Woman
                </span>
              </span>
            </Link>

            <nav
              className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 lg:flex"
              aria-label="Primary navigation"
            >
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  data-cursor="link"
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={[
                    "nav-ink-link text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors duration-200",
                    isActive(link.href)
                      ? "font-bold text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                  {...(isActive(link.href) ? { "data-active": "true" } : {})}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-3">
              <button
                type="button"
                onClick={openSearch}
                onPointerEnter={loadSearchOverlay}
                onFocus={loadSearchOverlay}
                aria-haspopup="dialog"
                aria-expanded={isSearchOpen}
                data-cursor="button"
                className="group inline-flex cursor-pointer items-center gap-3 p-2 text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                <Search className="size-[18px]" strokeWidth={1.5} aria-hidden="true" />
                <span className="hidden border-b border-transparent pb-px text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors group-hover:border-foreground md:inline">
                  Search
                </span>
                <span className="sr-only md:hidden">Search the notebook</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                className="inline-flex cursor-pointer items-center justify-center p-2 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
                aria-label={isOpen ? "Close menu" : "Open menu"}
                data-cursor="button"
              >
                {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div
            id="mobile-menu"
            className="fixed inset-x-0 bottom-0 top-[72px] z-40 overflow-y-auto bg-background sm:top-[88px] lg:hidden"
          >
            <nav
              aria-label="Mobile navigation"
              className="mx-auto flex max-w-7xl flex-col px-5 pb-10 pt-8 sm:px-10"
            >
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`block border-b border-border py-4 font-serif text-2xl font-black tracking-tight transition-colors hover:text-foreground ${
                    isActive(link.href) ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={openSearch}
                className="mt-6 flex cursor-pointer items-center gap-2 py-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                <Search className="size-4" aria-hidden="true" />
                Search the notebook
              </button>
            </nav>
          </div>
        )}
      </header>

      {isSearchOpen && <SearchOverlay onClose={closeSearch} />}
    </>
  );
}
