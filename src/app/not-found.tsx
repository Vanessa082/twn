import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Eyebrow, TextLink } from "@/components/ui/SectionHeading";
import { getLatestArticles } from "@/lib/services/articles";
import { getHomepageSettings } from "@/lib/services/homepage-settings";
import { routes } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page isn't in the notebook. It may have moved, or the link may be mistyped.",
  robots: { index: false, follow: true },
};

/**
 * Handles unknown URLs and every notFound() call. It renders outside the
 * public layout, so it brings its own navigation and footer.
 */
export default async function NotFound() {
  const [settings, latest] = await Promise.all([getHomepageSettings(), getLatestArticles(3)]);

  return (
    <>
      <Navbar />
      <main id="content" className="flex flex-1 flex-col bg-background">
        <div className="mx-auto w-full max-w-7xl px-5 pb-24 pt-16 sm:px-10 sm:pt-24 lg:px-20">
          <div className="max-w-3xl">
            <Eyebrow>Error 404 · A missing page</Eyebrow>
            <h1
              className="mt-6 font-serif font-bold leading-[1] tracking-[-0.03em] text-foreground text-balance"
              style={{ fontSize: "clamp(2.6rem, 6.5vw, 5rem)" }}
            >
              This page was torn out of the notebook.
            </h1>
            <p className="mt-6 max-w-xl font-serif text-lg leading-relaxed text-muted-foreground sm:text-xl">
              The link may be mistyped, or the note has moved. Old{" "}
              <span className="font-mono text-base">/articles</span> links now live under{" "}
              <span className="font-mono text-base">/notebook</span>.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link
                href={routes.notebook}
                className="inline-flex items-center gap-2 bg-foreground px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-85"
              >
                Open the notebook
              </Link>
              <TextLink href={routes.search()}>Search instead</TextLink>
              <TextLink href={routes.home}>Back to the first page</TextLink>
            </div>
          </div>

          {latest.length > 0 && (
            <section aria-labelledby="nf-latest" className="mt-20 border-t border-border pt-10">
              <h2
                id="nf-latest"
                className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground"
              >
                Perhaps you were looking for
              </h2>
              <ul className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-3">
                {latest.map((note) => (
                  <li key={note.id}>
                    <Link href={routes.note(note.slug)} className="group block">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-accent">
                        {note.category}
                      </span>
                      <span className="mt-2 block font-serif text-xl font-bold leading-snug text-foreground text-balance transition-opacity group-hover:opacity-70">
                        {note.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
      <Footer
        contactEmail={settings.contact_email}
        location={settings.location}
        socialLinks={settings.social_links}
      />
    </>
  );
}
