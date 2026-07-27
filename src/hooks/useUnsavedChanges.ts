"use client";

/**
 * useUnsavedChanges
 *
 * Tracks whether the user has unsaved form changes and blocks accidental
 * navigation away from the editor.
 *
 * Two layers of protection:
 *   1. `beforeunload` — fires when the user closes the tab or refreshes.
 *      The browser shows its own built-in "Leave site?" dialog.
 *   2. `isDirty` — returned flag used by the component to show a status
 *      indicator and optionally disable links.
 *
 * Pattern reference:
 *   https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
 *   https://tkdodo.eu/blog/why-you-want-react-query (server vs client state)
 */

import { useEffect } from "react";

interface UseUnsavedChangesOptions {
  /**
   * Whether the form has changes that haven't been saved yet.
   * When true, the browser will prompt before tab close / refresh.
   */
  isDirty: boolean;
}

export function useUnsavedChanges({ isDirty }: UseUnsavedChangesOptions) {
  // Layer 1: Block browser tab close / page refresh
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Modern browsers require calling preventDefault AND setting returnValue
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup: removes listener when dirty state clears or component unmounts
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);
}
