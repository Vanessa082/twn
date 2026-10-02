"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { SearchResponse, SearchResultItem } from "../application/engine";

export interface SearchDiscovery {
  popular: string[];
  latest: SearchResultItem[];
}

type Status = "idle" | "loading" | "ready" | "error";

export const searchKeys = {
  discovery: ["search", "discovery"] as const,
  query: (q: string) => ["search", "query", q] as const,
};

async function getJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  return res.json() as Promise<T>;
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

/**
 * Live search against /api/search. TanStack Query caches each query (so
 * backspacing is instant), cancels superseded requests, and keeps the last
 * results on screen while the next ones load.
 */
export function useNotebookSearch(query: string, debounceMs = 160) {
  const trimmed = query.trim();
  const debounced = useDebouncedValue(trimmed, debounceMs);

  const discovery = useQuery({
    queryKey: searchKeys.discovery,
    queryFn: ({ signal }) => getJson<SearchDiscovery>("/api/search", signal),
    staleTime: 5 * 60 * 1000,
  });

  const results = useQuery({
    queryKey: searchKeys.query(debounced),
    queryFn: ({ signal }) =>
      getJson<SearchResponse>(`/api/search?q=${encodeURIComponent(debounced)}&limit=12`, signal),
    enabled: debounced.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });

  let status: Status = "ready";
  if (!trimmed) status = "idle";
  else if (results.isError) status = "error";
  else if (trimmed !== debounced || results.isFetching) status = "loading";

  return {
    data: trimmed ? (results.data ?? null) : null,
    discovery: discovery.data ?? null,
    status,
  };
}
