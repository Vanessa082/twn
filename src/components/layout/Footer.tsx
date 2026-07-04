import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const currentYear = new Date().getFullYear();

  const links = [
    { label: t("links.articles"), href: "/articles" },
    { label: t("links.about"), href: "/about" },
    { label: t("links.newsletter"), href: "/newsletter" },
    { label: t("links.contact"), href: "/contact" },
  ];

  return (
    <footer className="border-t border-border bg-card text-card-foreground mt-auto transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 pb-8 border-b border-border">
          {/* Logo & Tagline */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <span className="font-serif text-2xl font-black tracking-[0.15em] text-foreground transition-all duration-300 group-hover:opacity-80">
                TWN
              </span>
              <span className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground transition-colors group-hover:text-foreground border-l border-border pl-3">
                The Notebook
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mt-2">
              {t("tagline")}
            </p>
          </div>

          {/* Site Navigation Links */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {nav("home")}
            </span>
            <ul className="grid grid-cols-2 gap-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-muted-gold transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Connections */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Connect
            </span>
            <div className="flex items-center gap-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("social.linkedin")}
                className="p-2 rounded-full border border-border hover:border-muted-gold text-muted-foreground hover:text-muted-gold transition-all duration-200 hover:-translate-y-0.5 bg-background"
              >
                <span className="sr-only">LinkedIn</span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("social.github")}
                className="p-2 rounded-full border border-border hover:border-muted-gold text-muted-foreground hover:text-muted-gold transition-all duration-200 hover:-translate-y-0.5 bg-background"
              >
                <span className="sr-only">GitHub</span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-muted-foreground">
          <p>{t("copyright", { year: currentYear })}</p>
          <div className="flex gap-6">
            {/* TODO: Create /privacy and /terms pages */}
            <Link href="/about" className="hover:text-muted-gold transition-colors">
              Privacy Policy
            </Link>
            <Link href="/about" className="hover:text-muted-gold transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
