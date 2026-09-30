"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { rememberSearch } from "./useNotebookSearch";

/** Updates ?q= as the reader types so results stay server-rendered and shareable. */
export default function SearchPageForm({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      const trimmed = value.trim();
      if (trimmed) next.set("q", trimmed);
      else next.delete("q");
      next.delete("type");
      startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
    }, 250);
    return () => clearTimeout(timer);
  }, [value, pathname, router, params]);

  return (
    <form
      role="search"
      action="/search"
      onSubmit={(event) => {
        event.preventDefault();
        rememberSearch(value);
        const trimmed = value.trim();
        startTransition(() =>
          router.replace(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search")
        );
      }}
      className="relative"
    >
      <label htmlFor="search-page-input" className="sr-only">
        Search the notebook
      </label>
      <Search
        className="pointer-events-none absolute left-0 top-1/2 size-5 -translate-y-1/2 text-muted-foreground sm:size-6"
        strokeWidth={1.25}
        aria-hidden="true"
      />
      <input
        id="search-page-input"
        name="q"
        type="search"
        value={value}
        maxLength={120}
        autoComplete="off"
        enterKeyHint="search"
        placeholder="Search notes, field notes, projects…"
        onChange={(event) => setValue(event.target.value)}
        className="w-full border-b border-foreground bg-transparent py-4 pl-9 pr-4 font-serif text-2xl text-foreground outline-none placeholder:text-muted-foreground/60 sm:pl-12 sm:text-4xl [&::-webkit-search-cancel-button]:hidden"
      />
      <span
        aria-hidden="true"
        className={`absolute bottom-0 left-0 h-px bg-ink-accent transition-all duration-500 ${isPending ? "w-full" : "w-0"}`}
      />
    </form>
  );
}
