"use client";

import { createTagAction } from "@/app/actions/tags";
import type { Tag } from "@/types";
import { Loader2, Plus, Tag as TagIcon, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

interface TagPickerProps {
  allTags: Tag[];
  selectedTags: Tag[];
  onChange: (tags: Tag[]) => void;
}

export default function TagPicker({ allTags, selectedTags, onChange }: TagPickerProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [tags, setTags] = useState<Tag[]>(allTags);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter suggestions from existing tags not already selected
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    const filtered = tags.filter(
      (t) => t.name.toLowerCase().includes(q) && !selectedTags.some((s) => s.id === t.id)
    );
    setSuggestions(filtered);
    setIsOpen(true);
  }, [query, tags, selectedTags]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current !== e.target
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addTag = (tag: Tag) => {
    const next = [...selectedTags, tag];
    onChange(next);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const removeTag = (id: string) => {
    onChange(selectedTags.filter((t) => t.id !== id));
  };

  const handleCreateNew = () => {
    const name = query.trim();
    if (!name || name.length < 2) return;

    startTransition(async () => {
      const result = await createTagAction(name);
      if (result.success && result.data) {
        const newTag = result.data;
        setTags((prev) => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)));
        addTag(newTag);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0) {
        addTag(suggestions[0]);
      } else if (query.trim().length >= 2) {
        handleCreateNew();
      }
    }
    if (e.key === "Escape") {
      setIsOpen(false);
      setQuery("");
    }
  };

  const exactMatch = tags.some((t) => t.name.toLowerCase() === query.trim().toLowerCase());
  const showCreateOption = query.trim().length >= 2 && !exactMatch;

  return (
    <div className="space-y-3">
      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-foreground/8 border border-border text-foreground"
            >
              <TagIcon className="h-3 w-3 text-muted-foreground" />
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="ml-0.5 hover:text-red-500 transition-colors cursor-pointer"
                aria-label={`Remove ${tag.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder="Type a tag name…"
          className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
        />

        {/* Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-20 top-full mt-1 left-0 right-0 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
          >
            {suggestions.length > 0 &&
              suggestions.slice(0, 8).map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2"
                >
                  <TagIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {tag.name}
                </button>
              ))}

            {showCreateOption && (
              <button
                type="button"
                onClick={handleCreateNew}
                disabled={isPending}
                className="w-full text-left px-3 py-2 text-sm text-muted-gold hover:bg-muted/50 transition-colors cursor-pointer flex items-center gap-2 border-t border-border disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                ) : (
                  <Plus className="h-3.5 w-3.5 shrink-0" />
                )}
                Create tag "{query.trim()}"
              </button>
            )}

            {suggestions.length === 0 && !showCreateOption && (
              <div className="px-3 py-2 text-xs text-muted-foreground">
                No matching tags found. Type at least 2 characters to create a new one.
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">
        Press{" "}
        <kbd className="px-1 py-0.5 rounded border border-border text-[10px] font-mono">Enter</kbd>{" "}
        to add the first match, or type a new name to create it.
      </p>
    </div>
  );
}
