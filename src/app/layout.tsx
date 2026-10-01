/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ROOT LAYOUT COMPONENT
 * ─────────────────────────────────────────────────────────────────────────────
 * In Next.js App Router, layout.tsx acts as the wrapper for all pages. It defines
 * the top-level HTML, handles fonts, and manages global context providers.
 *
 * 🧠 LEARNING POINT: Server Component by Default
 * This file is a React Server Component (RSC). It executes exclusively on the server.
 * This is highly beneficial because:
 *  1. It can fetch configuration (like i18n messages) directly from the filesystem
 *     or a database without sending heavy JS parser libraries to the user's browser.
 *  2. The generated HTML is streamed directly to the browser, offering rapid First Contentful Paint.
 */

import QueryProvider from "@/components/providers/QueryProvider";
import { ogImageUrl } from "@/lib/seo";
import { site } from "@/lib/site";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Cormorant_Garamond, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

/**
 * 🧠 LEARNING POINT: Font Optimization (next/font)
 * Instead of loading fonts via external CDN links (e.g. Google Fonts tags) which slows down
 * page load and triggers FOIT (Flash of Unstyled Text), Next.js downloads font files at build
 * time and self-hosts them.
 * - `display: "swap"` instructs the browser to show a fallback system font while loading the main font.
 * - `variable` exposes the font as a CSS Custom Property (variable) which we map in Tailwind.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

/**
 * Cormorant Garamond   the "notebook thought" font.
 * Used exclusively for the hero typewriter text and blockquotes.
 * At 500 weight it reads like words written with an elegant pen.
 */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-quote",
  display: "swap",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

/**
 * 🧠 LEARNING POINT: SEO & Metadata API
 * Next.js automatically parses this static metadata object and inserts the correct meta,
 * og:title, twitter:card, and robots tags inside the <head> of the generated document.
 * This is crucial for Search Engine Optimization and link previews on Slack, Twitter, and LinkedIn.
 */
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | ${site.shortName}`,
    template: `%s | ${site.shortName}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.author, url: site.url }],
  creator: site.author,
  openGraph: {
    title: site.name,
    description: site.description,
    siteName: site.name,
    locale: site.locale,
    type: "website",
    images: [{ url: ogImageUrl(site.name), width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    images: [ogImageUrl(site.name)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [
      { url: "/brand/twn-mark.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/icon/32", sizes: "32x32", type: "image/png" },
      { url: "/icon/192", sizes: "192x192", type: "image/png" },
      { url: "/icon/512", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "mask-icon", url: "/brand/twn-mark-mono.svg", color: "#111111" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /**
   * 🧠 LEARNING POINT: Internationalization (i18n) Hydration
   * `getLocale()` and `getMessages()` read the translation files on the server.
   * We wrap children inside `NextIntlClientProvider` which transmits the messages dictionary
   * to Client Components down the tree, allowing client-side hooks like `useTranslations` to work.
   */
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${playfair.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300"
        suppressHydrationWarning
      >
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-foreground focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:uppercase focus:tracking-[0.2em] focus:text-background"
        >
          Skip to content
        </a>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <div className="flex flex-1 flex-col">{children}</div>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
