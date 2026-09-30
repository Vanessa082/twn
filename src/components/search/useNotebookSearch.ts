"use client";

import type { SearchResponse, SearchResultItem } from "@/lib/search/engine";
import { useEffect, useRef, useState } from "react";

export interface SearchDiscovery {
  popular: string[];
  latest: SearchResultItem[];
}

type Status = "idle" | "loading" | "ready" | "error";

const RECENT_KEY = "twn:recent-searches";
const MAX_RECENT = 5;

export function readRecentSearches(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string").slice(0, MAX_RECENT)
      : [];
  } catch {
    return [];
  }
}

export function rememberSearch(query: string): string[] {
  const clean = query.trim().slice(0, 120);
  if (clean.length < 2) return readRecentSearches();
  const next = [
    clean,
    ...readRecentSearches().filter((q) => q.toLowerCase() !== clean.toLowerCase()),
  ].slice(0, MAX_RECENT);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // Private mode or full storage: recent searches are a nicety, not a requirement.
  }
  return next;
}

export function clearRecentSearches() {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {}
}

/** Debounced, abortable live search against /api/search. */
export function useNotebookSearch(query: string, debounceMs = 160) {
  const [data, setData] = useState<SearchResponse | null>(null);
  const [discovery, setDiscovery] = useState<SearchDiscovery | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/search", { signal: ac.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: SearchDiscovery | null) => json && setDiscovery(json))
      .catch(() => {});
    return () => ac.abort();
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    controller.current?.abort();
    if (!trimmed) {
      setData(null);
      setStatus("idle");
      return;
    }

    setStatus("loading");
    const ac = new AbortController();
    controller.current = ac;
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=12`, { signal: ac.signal })
        .then((res) => {
          if (!res.ok) throw new Error(String(res.status));
          return res.json() as Promise<SearchResponse>;
        })
        .then((json) => {
          setData(json);
          setStatus("ready");
        })
        .catch((error: unknown) => {
          if ((error as Error).name !== "AbortError") setStatus("error");
        });
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      ac.abort();
    };
  }, [query, debounceMs]);

  return { data, discovery, status };
}
