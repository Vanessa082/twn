import { describe, expect, it } from "vitest";
import { type SearchDocument, buildSearchIndex, editDistance, search, stem } from "./engine";

const NOW = Date.parse("2026-09-30T00:00:00Z");

const docs: SearchDocument[] = [
  {
    id: "note-1",
    type: "note",
    title: "Building the space I wish I had in tech",
    excerpt: "Why I started a notebook for women building careers in technology.",
    body: "Community, mentoring and the long road of becoming a software engineer.",
    keywords: ["community"],
    url: "/notebook/building-the-space-i-wish-i-had-in-tech",
    date: "2026-09-20T00:00:00Z",
    meta: "community",
  },
  {
    id: "note-2",
    type: "note",
    title: "What leading a team taught me about listening",
    excerpt: "Leadership lessons from my first year as an engineering manager.",
    keywords: ["leadership"],
    url: "/notebook/what-leading-a-team-taught-me",
    date: "2025-01-10T00:00:00Z",
    meta: "leadership",
  },
  {
    id: "project-1",
    type: "project",
    title: "NAO robot tutor",
    excerpt: "Teaching children to code with a humanoid robot.",
    keywords: ["robotics", "Python"],
    url: "/workbench#project-1",
    meta: "Building",
  },
  {
    id: "topic-1",
    type: "topic",
    title: "Machine Learning",
    excerpt: "Every note about Machine Learning.",
    url: "/topics/machine-learning",
  },
];

const index = buildSearchIndex(docs);

describe("search engine", () => {
  it("stems common English endings", () => {
    expect(stem("leaders")).toBe("lead");
    expect(stem("leading")).toBe("lead");
    expect(stem("stories")).toBe("story");
  });

  it("measures bounded edit distance including transpositions", () => {
    expect(editDistance("leadership", "leadreship", 2)).toBe(1);
    expect(editDistance("robot", "rbot", 1)).toBe(1);
    expect(editDistance("abc", "xyz12", 1)).toBeGreaterThan(1);
  });

  it("ranks title matches first", () => {
    const res = search(index, "leading", { now: NOW });
    expect(res.results[0].id).toBe("note-2");
  });

  it("matches the word being typed as a prefix", () => {
    const res = search(index, "robo", { now: NOW });
    expect(res.results.map((r) => r.id)).toContain("project-1");
  });

  it("tolerates typos and offers a correction", () => {
    const res = search(index, "leadrship", { now: NOW });
    expect(res.results[0]?.id).toBe("note-2");
    expect(res.correctedQuery).toBe("leadership");
  });

  it("corrects typos against the original spelling, not just the stem", () => {
    const res = search(index, "buildng", { now: NOW });
    expect(res.results[0]?.id).toBe("note-1");
    expect(res.correctedQuery).toBe("building");
  });

  it("expands editorial synonyms", () => {
    const res = search(index, "ai", { now: NOW });
    expect(res.results.map((r) => r.id)).toContain("topic-1");
  });

  it("filters by type while still counting every kind", () => {
    const res = search(index, "code", { now: NOW, type: "note" });
    expect(res.results.every((r) => r.type === "note")).toBe(true);
    expect(res.counts.project).toBeGreaterThan(0);
  });

  it("never returns the private body or keywords", () => {
    const res = search(index, "community", { now: NOW });
    expect(res.results[0]).not.toHaveProperty("body");
    expect(res.results[0]).not.toHaveProperty("keywords");
  });

  it("returns nothing for empty or stop-word-only queries", () => {
    expect(search(index, "   ").total).toBe(0);
    expect(search(index, "the and of").total).toBe(0);
  });

  it("suggests completions for the last word", () => {
    const res = search(index, "lea", { now: NOW });
    expect(res.suggestions.some((s) => s.startsWith("lead"))).toBe(true);
  });

  it("pages through the ranked list without changing the total", () => {
    const all = search(index, "community", { now: NOW, limit: 50 });
    const second = search(index, "community", { now: NOW, limit: 1, offset: 1 });
    expect(second.total).toBe(all.total);
    expect(second.results.map((r) => r.id)).toEqual(all.results.slice(1, 2).map((r) => r.id));
  });
});
