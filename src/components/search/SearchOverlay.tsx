"use client";

import ImageWithSkeleton from "@/components/ui/ImageWithSkeleton";
import { useRecentSearches } from "@/lib/client-store/reader-store";
import type { SearchDocType, SearchResultItem } from "@/lib/search/engine";
import { SEARCH_TYPE_LABELS, SEARCH_TYPE_SINGULAR } from "@/lib/search/query";
import { routes } from "@/lib/site";
import { ArrowRight, Clock, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import Highlight from "./Highlight";
import { useNotebookSearch } from "./useNotebookSearch";

interface SearchOverlayProps {
  onClose: () => void;
}

const GROUP_ORDER: SearchDocType[] = [
  "topic",
  "field_note",
  "project",
  "collection",
  "shared_page",
];

/**
 * Full-screen search panel in the spirit of hermes.com: a quiet, oversized
 * input, discovery prompts before typing, and live grouped results after.
 * Implements the WAI-ARIA combobox + listbox pattern for keyboard users.
 */
export default function SearchOverlay({ onClose }: SearchOverlayProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const { recent, remember: rememberSearch, clear: clearRecentSearches } = useRecentSearches();
  const { data, discovery, status } = useNotebookSearch(query);

  const trimmed = query.trim();
  const results = trimmed ? (data?.results ?? []) : (discovery?.latest ?? []);
  const notes = results.filter((item) => item.type === "note").slice(0, 4);
  const others = trimmed ? results.filter((item) => item.type !== "note") : [];
  const grouped = GROUP_ORDER.map((type) => ({
    type,
    items: others.filter((item) => item.type === type).slice(0, 4),
  })).filter((group) => group.items.length > 0);

  const options = [...notes, ...grouped.flatMap((group) => group.items)];

  useEffect(() => {
    inputRef.current?.focus();
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, []);

  const updateQuery = (value: string) => {
    setQuery(value);
    setActiveIndex(-1);
  };

  const goTo = (href: string, remember = trimmed) => {
    if (remember) rememberSearch(remember);
    onClose();
    router.push(href);
  };

  const submit = (value = trimmed) => {
    if (!value) return;
    goTo(routes.search(value), value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === "Tab") {
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && options.length > 0) {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % options.length);
    } else if (event.key === "ArrowUp" && options.length > 0) {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? options.length - 1 : i - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const active = options[activeIndex];
      if (active) goTo(active.url);
      else submit();
    }
  };

  const optionId = (item: SearchResultItem) => `${listId}-${item.id}`;
  const isActive = (item: SearchResultItem) => options[activeIndex]?.id === item.id;

  const leftTitle = trimmed ? "Suggestions" : "Popular searches";
  const leftItems = trimmed ? (data?.suggestions ?? []) : (discovery?.popular ?? []);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Search the notebook"
      onKeyDown={onKeyDown}
      className="twn-search-overlay fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-background"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-20">
        <div className="flex h-[72px] items-center justify-between border-b border-border sm:h-[88px]">
          <span className="font-serif text-2xl font-black tracking-[0.12em] text-foreground">
            TWN
          </span>
          <button
            type="button"
            onClick={onClose}
            data-cursor="button"
            className="group inline-flex cursor-pointer items-center gap-2 p-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="hidden sm:inline">Close</span>
            <X className="size-5" strokeWidth={1.5} aria-hidden="true" />
            <span className="sr-only sm:hidden">Close search</span>
          </button>
        </div>

        <form
          role="search"
          action="/search"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          className="relative mt-8 sm:mt-14"
        >
          <label htmlFor={`${listId}-input`} className="sr-only">
            Search the notebook
          </label>
          <Search
            className="pointer-events-none absolute left-0 top-1/2 size-5 -translate-y-1/2 text-muted-foreground sm:size-7"
            strokeWidth={1.25}
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            id={`${listId}-input`}
            name="q"
            type="search"
            value={query}
            maxLength={120}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            placeholder="What are you looking for?"
            onChange={(event) => updateQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
            role="combobox"
            aria-expanded={options.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              options[activeIndex] ? optionId(options[activeIndex]) : undefined
            }
            className="w-full border-b border-foreground bg-transparent py-4 pl-9 pr-24 font-serif text-2xl text-foreground outline-none placeholder:text-muted-foreground/60 sm:py-6 sm:pl-14 sm:text-5xl [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                updateQuery("");
                inputRef.current?.focus();
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer p-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </form>

        <p aria-live="polite" className="mt-4 min-h-5 text-sm text-muted-foreground">
          {trimmed && status === "ready" && data && (
            <>
              {data.correctedQuery ? (
                <>
                  Showing results for{" "}
                  <button
                    type="button"
                    onClick={() => updateQuery(data.correctedQuery ?? "")}
                    className="cursor-pointer font-quote text-base italic text-foreground underline underline-offset-4"
                  >
                    {data.correctedQuery}
                  </button>
                  .{" "}
                </>
              ) : null}
              {data.total === 0
                ? "Nothing in the notebook matches that yet."
                : `${data.total} ${data.total === 1 ? "result" : "results"} in the notebook.`}
            </>
          )}
          {trimmed &&
            status === "error" &&
            "Search is resting for a moment. Press Enter to try the full results page."}
        </p>

        <div className="grid grid-cols-1 gap-12 pb-20 pt-6 lg:grid-cols-12 lg:gap-16">
          <aside className="lg:col-span-3" aria-label={leftTitle}>
            {!trimmed && recent.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center justify-between">
                  <h2 className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                    Recent searches
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      clearRecentSearches();
                    }}
                    className="cursor-pointer text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Clear
                  </button>
                </div>
                <ul className="mt-4 space-y-1">
                  {recent.map((item) => (
                    <li key={item}>
                      <button
                        type="button"
                        onClick={() => updateQuery(item)}
                        className="flex w-full cursor-pointer items-center gap-3 py-1.5 text-left text-[15px] text-foreground/80 transition-colors hover:text-foreground"
                      >
                        <Clock
                          className="size-3.5 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {leftItems.length > 0 && (
              <>
                <h2 className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  {leftTitle}
                </h2>
                <ul className="mt-4 space-y-1">
                  {leftItems.map((item) => (
                    <li key={item}>
                      <button
                        type="button"
                        onClick={() => {
                          updateQuery(item);
                          inputRef.current?.focus();
                        }}
                        className="w-full cursor-pointer py-1.5 text-left font-serif text-lg text-foreground/80 transition-colors hover:text-foreground"
                      >
                        {trimmed ? <Highlight text={item} query={query} /> : item}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </aside>

          <section className="lg:col-span-9" aria-label="Results">
            <div id={listId} role="listbox" tabIndex={-1} aria-label="Search results">
              {trimmed && status === "loading" && !data && <ResultsSkeleton />}

              {notes.length > 0 && (
                <div className="mb-12">
                  <h2 className="mb-5 font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                    {trimmed ? "Notes" : "Latest in the notebook"}
                  </h2>
                  <ul className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4">
                    {notes.map((item) => (
                      <li key={item.id}>
                        <Link
                          id={optionId(item)}
                          role="option"
                          aria-selected={isActive(item)}
                          href={item.url}
                          onClick={() => trimmed && rememberSearch(trimmed)}
                          onNavigate={onClose}
                          data-cursor="link"
                          className={`group block outline-none ${isActive(item) ? "ring-2 ring-foreground ring-offset-4 ring-offset-background" : ""}`}
                        >
                          <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                            <ImageWithSkeleton
                              src={item.image ?? null}
                              alt=""
                              fill
                              sizes="(max-width: 768px) 45vw, 20vw"
                              cloudinaryWidth={400}
                              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                            />
                          </div>
                          {item.meta && (
                            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-accent">
                              {item.meta}
                            </p>
                          )}
                          <p className="mt-1.5 font-serif text-[15px] font-bold leading-snug text-foreground text-balance sm:text-base">
                            <Highlight text={item.title} query={trimmed} />
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {grouped.map((group) => (
                <div key={group.type} className="mb-10">
                  <h2 className="mb-3 font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                    {SEARCH_TYPE_LABELS[group.type]}
                  </h2>
                  <ul className="divide-y divide-border border-y border-border">
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <Link
                          id={optionId(item)}
                          role="option"
                          aria-selected={isActive(item)}
                          href={item.url}
                          onClick={() => rememberSearch(trimmed)}
                          onNavigate={onClose}
                          className={`group flex items-baseline justify-between gap-6 px-1 py-4 outline-none transition-colors hover:bg-muted/50 ${isActive(item) ? "bg-muted" : ""}`}
                        >
                          <span className="min-w-0">
                            <span className="block font-serif text-lg font-bold leading-snug text-foreground">
                              <Highlight text={item.title} query={trimmed} />
                            </span>
                            <span className="mt-1 line-clamp-1 block text-sm text-muted-foreground">
                              {item.excerpt}
                            </span>
                          </span>
                          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            {SEARCH_TYPE_SINGULAR[item.type]}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {trimmed && status === "ready" && data?.total === 0 && (
              <div className="border-t border-border pt-10">
                <p className="font-quote text-2xl italic text-foreground/80">
                  No page in the notebook answers &ldquo;{trimmed}&rdquo; yet.
                </p>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Try a broader word, a chapter like Leadership or Learning, or browse every note.
                </p>
                <button
                  type="button"
                  onClick={() => goTo(routes.notebook, "")}
                  className="mt-6 inline-flex cursor-pointer items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground"
                >
                  Browse the notebook <ArrowRight className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            )}

            {trimmed && data && data.total > options.length && (
              <button
                type="button"
                onClick={() => submit()}
                className="group mt-2 inline-flex cursor-pointer items-center gap-2 border-b border-foreground pb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground"
              >
                See all {data.total} results
                <ArrowRight
                  className="size-3.5 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div aria-hidden="true" className="grid grid-cols-2 gap-5 md:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i}>
          <div className="aspect-[4/5] animate-pulse bg-muted" />
          <div className="mt-3 h-2.5 w-1/3 animate-pulse bg-muted" />
          <div className="mt-2 h-4 w-4/5 animate-pulse bg-muted" />
        </div>
      ))}
    </div>
  );
}
