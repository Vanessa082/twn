"use client";

import { createLocalStore, useLocalStore } from "./local-store";

/**
 * What an anonymous reader has liked, saved and searched, kept in this
 * browser only. Readers never sign in (ADR-005), so there is no server copy.
 */
interface ReaderState {
  liked: string[];
  saved: string[];
}

const EMPTY: ReaderState = { liked: [], saved: [] };
const MAX_ITEMS = 500;
const MAX_RECENT = 5;

const slugList = (value: unknown) =>
  Array.isArray(value)
    ? [...new Set(value.filter((v): v is string => typeof v === "string"))].slice(0, MAX_ITEMS)
    : [];

/** Carries over flags saved under the old one-key-per-note format. */
function legacyReaderState(): ReaderState {
  const state: ReaderState = { liked: [], saved: [] };
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) ?? "";
      if (localStorage.getItem(key) !== "1") continue;
      if (key.startsWith("twn-like-")) state.liked.push(key.slice(9));
      if (key.startsWith("twn-bookmark-")) state.saved.push(key.slice(13));
    }
  } catch {}
  return state;
}

const readerStore = createLocalStore<ReaderState>("twn:reader", EMPTY, (raw) => {
  const value = (raw ?? {}) as Partial<ReaderState>;
  return { liked: slugList(value.liked), saved: slugList(value.saved) };
});

let migrated = false;
function ensureMigrated() {
  if (migrated || typeof window === "undefined") return;
  migrated = true;
  if (localStorage.getItem("twn:reader") !== null) return;
  const legacy = legacyReaderState();
  if (legacy.liked.length || legacy.saved.length) readerStore.set(legacy);
}

function toggle(list: string[], slug: string, on: boolean) {
  const without = list.filter((item) => item !== slug);
  return on ? [slug, ...without].slice(0, MAX_ITEMS) : without;
}

export function useReaderNote(slug: string) {
  ensureMigrated();
  const state = useLocalStore(readerStore, EMPTY);
  return {
    liked: state.liked.includes(slug),
    saved: state.saved.includes(slug),
    setLiked: (on: boolean) => readerStore.set((s) => ({ ...s, liked: toggle(s.liked, slug, on) })),
    setSaved: (on: boolean) => readerStore.set((s) => ({ ...s, saved: toggle(s.saved, slug, on) })),
  };
}

// ── Recent searches ──────────────────────────────────────────────────────────

const recentSearchStore = createLocalStore<string[]>("twn:recent-searches", [], (raw) =>
  slugList(raw).slice(0, MAX_RECENT)
);

const NO_RECENT: string[] = [];

export function useRecentSearches() {
  const recent = useLocalStore(recentSearchStore, NO_RECENT);
  return {
    recent,
    remember(query: string) {
      const clean = query.trim().slice(0, 120);
      if (clean.length < 2) return;
      recentSearchStore.set((list) =>
        [clean, ...list.filter((q) => q.toLowerCase() !== clean.toLowerCase())].slice(0, MAX_RECENT)
      );
    },
    clear: () => recentSearchStore.set([]),
  };
}
