"use client";

import { useSyncExternalStore } from "react";

/**
 * A tiny typed store over localStorage, read through useSyncExternalStore so
 * every component (and every open tab) sees the same value without effects
 * or hydration mismatches. Storage failures (private mode, quota) degrade to
 * in-memory state instead of throwing.
 */
export interface LocalStore<T> {
  get: () => T;
  set: (next: T | ((previous: T) => T)) => void;
  subscribe: (listener: () => void) => () => void;
}

export function createLocalStore<T>(
  key: string,
  fallback: T,
  parse: (raw: unknown) => T
): LocalStore<T> {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null | undefined;
  let cachedValue = fallback;

  const read = (): T => {
    if (typeof window === "undefined") return fallback;
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      return cachedValue;
    }
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    try {
      cachedValue = raw === null ? fallback : parse(JSON.parse(raw));
    } catch {
      cachedValue = fallback;
    }
    return cachedValue;
  };

  const emit = () => {
    for (const listener of listeners) listener();
  };

  return {
    get: read,
    set(next) {
      const value = typeof next === "function" ? (next as (p: T) => T)(read()) : next;
      cachedValue = value;
      try {
        const raw = JSON.stringify(value);
        window.localStorage.setItem(key, raw);
        cachedRaw = raw;
      } catch {
        cachedRaw = undefined;
      }
      emit();
    },
    subscribe(listener) {
      listeners.add(listener);
      const onStorage = (event: StorageEvent) => {
        if (event.key === key || event.key === null) listener();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
  };
}

export function useLocalStore<T>(store: LocalStore<T>, fallback: T): T {
  return useSyncExternalStore(store.subscribe, store.get, () => fallback);
}
