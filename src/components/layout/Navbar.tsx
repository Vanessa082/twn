"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Menu, X, Search, BookOpen } from "lucide-react";

export default function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { label: t("home"), href: "/" },
    { label: t("articles"), href: "/articles" },
    { label: t("about"), href: "/about" },
    { label: t("newsletter"), href: "/newsletter" },
    { label: t("contact"), href: "/contact" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              {/* Pure Typographic Logo - Framer style */}
              <span className="font-serif text-2xl font-black tracking-[0.15em] text-foreground transition-all duration-300 group-hover:opacity-80">
                TWN
              </span>
              <span className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground transition-colors group-hover:text-foreground hidden sm:inline-block border-l border-border pl-3">
                The Notebook
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-200 hover:text-foreground ${
                  isActive(link.href)
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4">
            <Link
              href="/search"
              aria-label={t("search")}
              className={`p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 ${
                pathname === "/search" ? "bg-muted text-foreground" : ""
              }`}
            >
              <Search className="h-5 w-5" />
            </Link>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none transition-all duration-200 md:hidden"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-background animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1 px-4 pb-4 pt-2">
            {links.map((link) => (
              <Link
                key={link.href}
                onClick={() => setIsOpen(false)}
                href={link.href}
                className={`block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-muted hover:text-muted-gold ${
                  isActive(link.href)
                    ? "bg-muted text-deep-navy dark:text-muted-gold font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
