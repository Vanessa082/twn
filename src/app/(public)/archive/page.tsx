import { Eyebrow } from "@/components/ui/SectionHeading";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";
import { getLatestNotes } from "@/modules/editorial";
import type { Note } from "@/modules/editorial";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const revalidate = 60;

export const metadata = pageMetadata({
  title: "The Archive",
  description:
    "Every note in The Notebook of a Tech Woman, arranged by year and month so nothing written gets lost.",
  path: routes.archive,
  eyebrow: "Archive",
});

const CATEGORY_LABELS: Record<string, string> = {
  technology: "Technology",
  leadership: "Leadership",
  learning: "Learning",
  community: "Community",
  reflections: "Reflections",
};

interface ArchivePageProps {
  searchParams: Promise<{ category?: string }>;
}

interface MonthGroup {
  month: string;
  items: Note[];
}

interface YearGroup {
  year: string;
  months: MonthGroup[];
}

function formatDay(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function groupByYearAndMonth(notes: Note[]): YearGroup[] {
  const grouped: YearGroup[] = [];

  for (const note of notes) {
    const date = new Date(note.published_at ?? note.created_at);
    const year = date.getFullYear().toString();
    const month = date.toLocaleDateString("en-GB", { month: "long" });

    let yearGroup = grouped.find((g) => g.year === year);
    if (!yearGroup) {
      yearGroup = { year, months: [] };
      grouped.push(yearGroup);
    }

    let monthGroup = yearGroup.months.find((m) => m.month === month);
    if (!monthGroup) {
      monthGroup = { month, items: [] };
      yearGroup.months.push(monthGroup);
    }

    monthGroup.items.push(note);
  }

  return grouped.sort((a, b) => Number(b.year) - Number(a.year));
}

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const { category } = await searchParams;
  const activeCategory = category && CATEGORY_LABELS[category] ? category : undefined;

  const notes = await getLatestNotes(100);
  const published = notes.filter(
    (a) => a.status === "published" && (!activeCategory || a.category === activeCategory)
  );
  const grouped = groupByYearAndMonth(published);

  const filters = [
    { value: "", label: "All" },
    ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border pb-12 pt-16 sm:pb-16 sm:pt-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-20">
          <div className="max-w-2xl">
            <Eyebrow>The complete record</Eyebrow>
            <h1
              className="mt-5 font-serif font-bold leading-[0.96] tracking-[-0.03em] text-foreground"
              style={{ fontSize: "clamp(2.8rem, 6vw, 4.5rem)" }}
            >
              Archive
            </h1>
            <p className="mt-5 max-w-lg font-serif text-[1.1rem] leading-[1.7] text-muted-foreground">
              Everything written, collected and documented in the notebook, kept in the order it
              happened.
            </p>
          </div>

          <nav
            aria-label="Filter the archive by chapter"
            className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-6"
          >
            {filters.map(({ value, label }) => {
              const isActive = (value || undefined) === activeCategory;
              return (
                <Link
                  key={label}
                  href={value ? `/archive?category=${value}` : "/archive"}
                  aria-current={isActive ? "page" : undefined}
                  data-active={isActive ? "true" : undefined}
                  className={`nav-ink-link text-[11px] font-sans font-semibold uppercase tracking-[0.2em] transition-colors ${
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-20">
          {published.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-serif text-2xl font-bold text-foreground/50">
                {activeCategory
                  ? "Nothing in this chapter yet."
                  : "The notebook is still being filled."}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {activeCategory ? (
                  <Link
                    href="/archive"
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    See the whole archive
                  </Link>
                ) : (
                  "Check back soon — the first notes are on their way."
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-20">
              {grouped.map((yearGroup) => (
                <div key={yearGroup.year}>
                  <div className="mb-10 flex items-center gap-6">
                    <h2
                      className="font-serif font-black leading-none text-foreground/15"
                      style={{ fontSize: "clamp(3rem, 7vw, 5rem)" }}
                    >
                      {yearGroup.year}
                    </h2>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="space-y-12">
                    {yearGroup.months.map((monthGroup) => (
                      <div
                        key={monthGroup.month}
                        className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-8"
                      >
                        <div className="md:col-span-2 md:pt-5">
                          <h3 className="text-[11px] font-sans font-semibold uppercase tracking-[0.22em] text-foreground">
                            {monthGroup.month}
                          </h3>
                          <span className="mt-1 block text-[11px] text-muted-foreground">
                            {monthGroup.items.length}{" "}
                            {monthGroup.items.length === 1 ? "note" : "notes"}
                          </span>
                        </div>

                        <ul className="border-t border-border md:col-span-10">
                          {monthGroup.items.map((note) => (
                            <li key={note.id} className="border-b border-border">
                              <Link
                                href={`/notebook/${note.slug}`}
                                data-cursor="link"
                                className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-5 sm:grid-cols-[4.5rem_1fr_auto]"
                              >
                                <span className="order-3 col-span-2 text-[11px] text-muted-foreground sm:order-none sm:col-span-1">
                                  {formatDay(note.published_at)}
                                </span>
                                <span className="min-w-0">
                                  <span className="block font-serif text-lg font-bold text-foreground transition-opacity duration-300 group-hover:opacity-70 sm:text-xl">
                                    {note.title}
                                  </span>
                                  <span className="mt-1 block text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-ink-accent">
                                    {CATEGORY_LABELS[note.category] ?? note.category}
                                    {note.reading_time ? (
                                      <span className="text-muted-foreground">
                                        {" "}
                                        · {note.reading_time} min
                                      </span>
                                    ) : null}
                                  </span>
                                </span>
                                <ArrowRight
                                  className="size-4 text-muted-foreground/60 transition-all duration-300 group-hover:translate-x-1 group-hover:text-foreground"
                                  aria-hidden="true"
                                />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
