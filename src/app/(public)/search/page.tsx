import SearchPageForm from "@/components/search/SearchPageForm";
import ImageWithSkeleton from "@/components/ui/ImageWithSkeleton";
import Pagination from "@/components/ui/Pagination";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { totalPagesFor, withPageParam } from "@/lib/pagination";
import { getPopularSearches, getSearchIndex } from "@/lib/search/documents";
import { SEARCH_DOC_TYPES, search } from "@/lib/search/engine";
import {
  SEARCH_RESULTS_PER_PAGE,
  SEARCH_TYPE_LABELS,
  SEARCH_TYPE_SINGULAR,
  searchQuerySchema,
} from "@/lib/search/query";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readParams(raw: Record<string, string | string[] | undefined>) {
  const flat = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
  );
  const parsed = searchQuerySchema.safeParse(flat);
  return parsed.success ? parsed.data : { q: "", type: undefined, limit: undefined, page: 1 };
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = readParams(await searchParams);
  return pageMetadata({
    title: q ? `“${q}” in the notebook` : "Search the notebook",
    description:
      "Search every note, field note, project, collection and shared page in The Notebook of a Tech Woman.",
    path: routes.search(),
    eyebrow: "Search",
    noIndex: Boolean(q),
  });
}

function hrefFor(q: string, type?: string) {
  const params = new URLSearchParams({ q });
  if (type) params.set("type", type);
  return `/search?${params.toString()}`;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, type, page: requestedPage } = readParams(await searchParams);
  const [index, popular] = await Promise.all([getSearchIndex(), getPopularSearches()]);
  const runSearch = (p: number) =>
    search(index, q, {
      type,
      limit: SEARCH_RESULTS_PER_PAGE,
      offset: (p - 1) * SEARCH_RESULTS_PER_PAGE,
    });
  let response = q ? runSearch(requestedPage) : null;
  const totalPages = totalPagesFor(response?.total ?? 0, SEARCH_RESULTS_PER_PAGE);
  const page = Math.min(requestedPage, totalPages);
  if (response && page !== requestedPage) response = runSearch(page);
  const totalAll = response ? Object.values(response.counts).reduce((sum, n) => sum + n, 0) : 0;
  const firstShown = (page - 1) * SEARCH_RESULTS_PER_PAGE + 1;

  return (
    <div className="bg-background pb-24 pt-14 sm:pt-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-20">
        <Eyebrow>Search</Eyebrow>
        <h1
          className="mt-5 font-serif font-bold leading-[1] tracking-[-0.03em] text-foreground"
          style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.25rem)" }}
        >
          {q ? (
            <>
              Results for <span className="font-quote font-medium italic">&ldquo;{q}&rdquo;</span>
            </>
          ) : (
            "Search the notebook"
          )}
        </h1>

        <div className="mt-10 max-w-3xl">
          <Suspense>
            <SearchPageForm initialQuery={q} />
          </Suspense>
        </div>

        {response?.correctedQuery && (
          <p className="mt-5 text-sm text-muted-foreground">
            Did you mean{" "}
            <Link
              href={hrefFor(response.correctedQuery)}
              className="font-quote text-base italic text-foreground underline underline-offset-4"
            >
              {response.correctedQuery}
            </Link>
            ?
          </p>
        )}

        {!response && (
          <section aria-labelledby="popular-searches" className="mt-14">
            <h2
              id="popular-searches"
              className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground"
            >
              Popular searches
            </h2>
            <ul className="mt-5 flex flex-wrap gap-3">
              {popular.map((term) => (
                <li key={term}>
                  <Link
                    href={hrefFor(term)}
                    className="inline-block border border-border px-4 py-2 font-serif text-base text-foreground/80 transition-colors hover:border-foreground hover:text-foreground"
                  >
                    {term}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {response && (
          <>
            <nav
              aria-label="Filter results by kind"
              className="mt-12 flex gap-x-6 gap-y-3 overflow-x-auto border-b border-border pb-4 [scrollbar-width:none]"
            >
              <FilterLink href={hrefFor(q)} active={!type} label="All" count={totalAll} />
              {SEARCH_DOC_TYPES.filter((kind) => response.counts[kind] > 0).map((kind) => (
                <FilterLink
                  key={kind}
                  href={hrefFor(q, kind)}
                  active={type === kind}
                  label={SEARCH_TYPE_LABELS[kind]}
                  count={response.counts[kind]}
                />
              ))}
            </nav>

            <p aria-live="polite" className="mt-6 text-sm text-muted-foreground">
              {response.total === 0
                ? "Nothing in the notebook matches that yet."
                : totalPages > 1
                  ? `${firstShown}–${firstShown + response.results.length - 1} of ${response.total} results`
                  : `${response.total} ${response.total === 1 ? "result" : "results"}`}
            </p>

            {response.total === 0 ? (
              <div className="mt-10 max-w-xl">
                <p className="font-quote text-2xl italic text-foreground/80">
                  No page answers &ldquo;{q}&rdquo; yet.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Try a broader word or one of these:
                </p>
                <ul className="mt-5 flex flex-wrap gap-3">
                  {popular.slice(0, 5).map((term) => (
                    <li key={term}>
                      <Link
                        href={hrefFor(term)}
                        className="inline-block border border-border px-4 py-2 text-sm text-foreground/80 transition-colors hover:border-foreground hover:text-foreground"
                      >
                        {term}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <ol className="mt-6 divide-y divide-border border-t border-border">
                {response.results.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.url}
                      className="group grid grid-cols-[1fr_auto] items-start gap-5 py-7 sm:grid-cols-[7rem_1fr_auto] sm:gap-8"
                    >
                      <div className="relative hidden aspect-[4/5] w-full overflow-hidden bg-muted sm:block">
                        {item.image ? (
                          <ImageWithSkeleton
                            src={item.image}
                            alt=""
                            fill
                            sizes="112px"
                            cloudinaryWidth={240}
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <span className="absolute inset-0 grid place-items-center font-serif text-lg font-black tracking-[0.12em] text-foreground/15">
                            TWN
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-accent">
                          {SEARCH_TYPE_SINGULAR[item.type]}
                          {item.meta && item.meta !== SEARCH_TYPE_SINGULAR[item.type] && (
                            <span className="text-muted-foreground"> · {item.meta}</span>
                          )}
                        </p>
                        <h2 className="mt-2 font-serif text-xl font-bold leading-snug text-foreground text-balance transition-opacity group-hover:opacity-70 sm:text-2xl">
                          {item.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-muted-foreground">
                          {item.excerpt}
                        </p>
                      </div>
                      {item.date && (
                        <time
                          dateTime={item.date}
                          className="whitespace-nowrap pt-1 font-quote text-sm italic text-muted-foreground"
                        >
                          {new Date(item.date).toLocaleDateString("en-GB", {
                            month: "short",
                            year: "numeric",
                          })}
                        </time>
                      )}
                    </Link>
                  </li>
                ))}
              </ol>
            )}
            <Pagination
              page={page}
              totalPages={totalPages}
              hrefForPage={(p) => withPageParam(hrefFor(q, type), p)}
              label="search results"
              className="mt-10"
            />
          </>
        )}
      </div>
    </div>
  );
}

function FilterLink({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={`shrink-0 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors ${
        active
          ? "text-foreground underline decoration-ink-accent decoration-2 underline-offset-8"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label} <span className="text-muted-foreground/70">({count})</span>
    </Link>
  );
}
