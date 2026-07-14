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

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import CustomCursor from "@/components/ui/CustomCursor";
import NotebookTimeline from "@/components/ui/NotebookTimeline";
import PageTransition from "@/components/ui/PageTransition";
import ReadingLine from "@/components/ui/ReadingLine";
import type { Metadata } from "next";
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
 * Cormorant Garamond — the "notebook thought" font.
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
  title: {
    default: "The Notebook of a Tech Woman | TWN",
    template: "%s | The Notebook of a Tech Woman",
  },
  description:
    "Notes on technology, ideas, challenges, and the journey of becoming. Reflections on leadership, learning, society, and life by a tech woman.",
  metadataBase: new URL("https://twnotebook.com"),
  openGraph: {
    title: "The Notebook of a Tech Woman",
    description: "Notes on technology, ideas, challenges, and the journey of becoming.",
    url: "https://twnotebook.com",
    siteName: "TWN",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Notebook of a Tech Woman",
    description: "Notes on technology, ideas, challenges, and the journey of becoming.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* Global ambient UI — cursor, reading line, page transitions */}
          <CustomCursor />
          <NotebookTimeline />
          <ReadingLine />
          <PageTransition />

          {/* Shared Header Navigation */}
          <Navbar />

          {/* Main workspace container where child routes (e.g. /articles, /about) inject their HTML */}
          <main className="flex-1 flex flex-col">{children}</main>

          {/* Shared Footer Navigation */}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
