import StillFiguringItOutSection from "@/components/about/StillFiguringItOutSection";
import FramedPortrait from "@/components/ui/FramedPortrait";
import SectionHeading, { Eyebrow, TextLink } from "@/components/ui/SectionHeading";
import { getAboutData } from "@/lib/services/about";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const revalidate = 60; // ISR validation

export const metadata = {
  title: "About",
  description:
    "I'm Vanessa — developer, writer, educator and builder. This is where I document the becoming.",
};

const container = "mx-auto max-w-7xl px-5 sm:px-10 lg:px-20";

export default async function AboutPage() {
  const data = await getAboutData();
  const {
    hero,
    short_version,
    closing,
    timeline,
    projects,
    open_knowledge,
    manifesto,
    currently,
    still_figuring_out,
    section_visibility,
  } = data;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── 1. The woman behind the notebook ─────────────────────────────── */}
      {section_visibility.hero && (
        <section className="border-b border-border py-16 sm:py-24">
          <div className={container}>
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-20">
              <div className="lg:col-span-5">
                <FramedPortrait
                  src={hero.image_url}
                  alt={`Portrait of ${hero.title}`}
                  sizes="(max-width: 1024px) 90vw, 40vw"
                  caption={hero.image_caption}
                  priority
                  className="mx-auto max-w-[460px] lg:max-w-none"
                />
              </div>

              <div className="lg:col-span-7">
                <Eyebrow>{hero.tagline}</Eyebrow>
                <h1
                  className="mt-5 font-serif font-bold leading-[0.95] tracking-[-0.03em] text-foreground"
                  style={{ fontSize: "clamp(3.2rem, 7vw, 5.5rem)" }}
                >
                  {hero.title}
                </h1>
                <p
                  className="mt-6 font-quote font-medium leading-[1.2] text-foreground/80"
                  style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.1rem)" }}
                >
                  &ldquo;{hero.lead}&rdquo;
                </p>

                <div className="mt-8 max-w-[34rem] space-y-5 font-serif text-[1.125rem] leading-[1.8] text-foreground/80 text-pretty">
                  {hero.story.map((para) => (
                    <p key={para}>{para}</p>
                  ))}
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-8">
                  <Link
                    href="/articles"
                    data-cursor="link"
                    className="inline-flex h-11 items-center justify-center rounded-[4px] bg-foreground px-6 text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-background transition-opacity duration-300 hover:opacity-85"
                  >
                    Read the notebook
                  </Link>
                  <TextLink href="/contact">Write to me</TextLink>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 2. Why this exists — the quote band ─────────────────────────── */}
      {section_visibility.manifesto && (
        <section className="bg-ink-band py-20 text-ink-band-foreground sm:py-28">
          <div className={`${container} text-center`}>
            <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.28em] text-ink-band-foreground/55">
              Why this notebook exists
            </span>
            <blockquote
              className="mx-auto mt-8 max-w-4xl font-quote font-medium leading-[1.25] text-balance"
              style={{ fontSize: "clamp(1.75rem, 3.6vw, 2.75rem)" }}
            >
              &ldquo;{manifesto.quote}&rdquo;
            </blockquote>
            <p className="mx-auto mt-8 max-w-2xl text-[15px] leading-[1.8] text-ink-band-foreground/65 text-pretty">
              {manifesto.body}
            </p>
            <p className="mt-8 font-quote text-lg italic text-ink-band-foreground/85">
              — {manifesto.closing}
            </p>
          </div>
        </section>
      )}

      {/* ── 3. The short version ─────────────────────────────────────────── */}
      {section_visibility.short_version && (
        <section className="border-b border-border py-20 sm:py-28">
          <div className={container}>
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-20">
              <div className="lg:col-span-7">
                <Eyebrow>The short version</Eyebrow>
                <h2
                  className="mt-4 font-serif font-bold leading-[1.1] tracking-[-0.02em] text-foreground text-balance"
                  style={{ fontSize: "clamp(1.9rem, 3.6vw, 2.75rem)" }}
                >
                  {short_version.heading}
                </h2>
                {short_version.body && (
                  <p className="mt-6 max-w-xl font-serif text-[1.125rem] leading-[1.8] text-foreground/80 text-pretty">
                    {short_version.body}
                  </p>
                )}
              </div>

              <dl className="border-t border-border lg:col-span-5 lg:mt-10">
                {hero.roles.map((r) => (
                  <div
                    key={r.label}
                    className="grid grid-cols-[8rem_1fr] items-baseline gap-4 border-b border-border py-4"
                  >
                    <dt className="font-serif text-lg font-bold text-foreground">{r.label}</dt>
                    <dd className="text-[14px] leading-relaxed text-muted-foreground">{r.sub}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
      )}

      {/* ── 4. The path ──────────────────────────────────────────────────── */}
      {section_visibility.timeline && (
        <section className="border-b border-border bg-paper-deep py-20 sm:py-28">
          <div className={container}>
            <SectionHeading
              eyebrow="The path"
              title="Not linear. Never was."
              description="I didn’t take the scripted, university-to-corporate route. I learned through practice, projects, mentoring, open knowledge and a lot of curiosity."
            />

            <ol className="max-w-4xl border-t border-border">
              {timeline.map((item) => (
                <li
                  key={`${item.period}-${item.title}`}
                  className="grid grid-cols-1 gap-2 border-b border-border py-7 sm:grid-cols-[9rem_1fr] sm:gap-10"
                >
                  <span className="pt-1 font-mono text-[12px] text-ink-accent">{item.period}</span>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-foreground">{item.title}</h3>
                    <p className="mt-2 max-w-2xl text-[15px] leading-[1.75] text-muted-foreground">
                      {item.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ── 5. Open knowledge ────────────────────────────────────────────── */}
      {section_visibility.open_knowledge && (
        <section id="open-knowledge" className="scroll-mt-24 border-b border-border py-20 sm:py-28">
          <div className={container}>
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-20">
              <div className="lg:col-span-7">
                <Eyebrow>Public archiving</Eyebrow>
                <h2
                  className="mt-4 font-serif font-bold leading-[1.15] tracking-[-0.02em] text-foreground text-balance"
                  style={{ fontSize: "clamp(1.9rem, 3.6vw, 2.75rem)" }}
                >
                  {open_knowledge.heading}
                </h2>
                <p className="mt-6 max-w-xl font-serif text-[1.125rem] leading-[1.8] text-foreground/80 text-pretty">
                  {open_knowledge.lead}
                </p>
                <blockquote className="mt-8 max-w-xl border-l-2 border-ink-accent pl-6 font-quote text-2xl italic leading-snug text-foreground">
                  &ldquo;{open_knowledge.quote}&rdquo;
                </blockquote>
                {open_knowledge.closing && (
                  <p className="mt-8 max-w-xl text-[15px] leading-[1.75] text-muted-foreground">
                    {open_knowledge.closing}
                  </p>
                )}
              </div>

              <div className="lg:col-span-5 lg:pt-12">
                <h3 className="text-[10px] font-sans font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Where I contribute
                </h3>
                <ul className="mt-5 border-t border-border">
                  {open_knowledge.topics.map((topic) => (
                    <li
                      key={topic}
                      className="flex items-center gap-4 border-b border-border py-4 font-serif text-lg text-foreground"
                    >
                      <span
                        className="size-1 shrink-0 rounded-full bg-ink-accent"
                        aria-hidden="true"
                      />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 6. Things that escaped the notebook ─────────────────────────── */}
      {section_visibility.projects && projects.length > 0 && (
        <section className="border-b border-border py-20 sm:py-28">
          <div className={container}>
            <SectionHeading
              eyebrow="Selected work"
              title="Things that escaped the notebook"
              description="Some projects are finished. Some are still becoming themselves."
            />

            <ol className="border-t border-border">
              {projects.map((proj, index) => {
                const row = (
                  <>
                    <span className="font-mono text-[11px] text-muted-foreground/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="sm:col-span-4">
                      <h3 className="font-serif text-2xl font-bold text-foreground transition-opacity duration-300 group-hover:opacity-70">
                        {proj.name}
                      </h3>
                      <p className="mt-2 text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-ink-accent">
                        {proj.tag}
                      </p>
                    </div>
                    <p className="max-w-xl text-[15px] leading-[1.75] text-muted-foreground sm:col-span-6">
                      {proj.desc}
                    </p>
                    <span className="hidden justify-self-end sm:block">
                      {proj.link && (
                        <ArrowUpRight
                          className="size-4 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                          aria-label="Opens in a new tab"
                        />
                      )}
                    </span>
                  </>
                );
                const rowClass =
                  "group grid grid-cols-1 gap-3 py-8 sm:grid-cols-12 sm:items-baseline sm:gap-8";
                return (
                  <li key={proj.name} className="border-b border-border">
                    {proj.link ? (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cursor="link"
                        className={rowClass}
                      >
                        {row}
                      </a>
                    ) : (
                      <div className={rowClass}>{row}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      {/* ── 7. Currently ─────────────────────────────────────────────────── */}
      {section_visibility.currently && (
        <section className="border-b border-border bg-paper-deep py-20 sm:py-28">
          <div className={container}>
            <SectionHeading
              eyebrow="Right now"
              title="Currently"
              description="A living record of what has my attention this season."
              aside={
                data.updated_at &&
                `Last updated ${new Date(data.updated_at).toLocaleDateString("en-GB", {
                  month: "long",
                  year: "numeric",
                })}`
              }
            />

            <dl className="grid grid-cols-1 gap-x-16 border-t border-border md:grid-cols-2">
              {currently.map((item) => (
                <div
                  key={item.verb}
                  className="grid grid-cols-[7.5rem_1fr] items-baseline gap-4 border-b border-border py-5"
                >
                  <dt className="font-quote text-xl italic text-foreground">{item.verb}</dt>
                  <dd className="text-[15px] leading-[1.7] text-muted-foreground">{item.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* ── 8. Still figuring it out ─────────────────────────────────────── */}
      {section_visibility.still_figuring_out && still_figuring_out.length > 0 && (
        <StillFiguringItOutSection items={still_figuring_out} />
      )}

      {/* ── 9. Closing ───────────────────────────────────────────────────── */}
      {section_visibility.closing && (
        <section className="py-24 sm:py-32">
          <div className={`${container} text-center`}>
            {closing.quote && (
              <p
                className="mx-auto max-w-3xl font-quote font-medium leading-[1.2] text-foreground text-balance"
                style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}
              >
                &ldquo;{closing.quote}&rdquo;
              </p>
            )}
            <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-10">
              <Link
                href="/archive"
                data-cursor="link"
                className="inline-flex h-11 items-center justify-center rounded-[4px] bg-foreground px-6 text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-background transition-opacity duration-300 hover:opacity-85"
              >
                Explore the archive
              </Link>
              <TextLink href="/newsletter">Subscribe to notebook notes</TextLink>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
