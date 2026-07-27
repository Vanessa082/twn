import type { MarginNote, SharedPage, ModerationStatus } from "@/types";

export type { MarginNote, SharedPage, ModerationStatus };

export const FALLBACK_MARGIN_NOTES: MarginNote[] = [
  {
    id: "mn1",
    article_id: "default-article",
    author_name: "Amy",
    content: "This paragraph resonates so deeply. Confidence is built in the daily, quiet work.",
    status: "approved",
    display_order: 999,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "mn2",
    article_id: "default-article",
    author_name: "Jess",
    content:
      "The part about 'designing for scale' is exactly what we struggle with in early startups.",
    status: "approved",
    display_order: 999,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const FALLBACK_SHARED_PAGES: SharedPage[] = [
  {
    id: "fp1",
    author_name: "Sofia T.",
    title: null,
    content: "Today I almost quit software engineering. I didn't.",
    word_count: 8,
    status: "approved",
    submitted_at: "2026-07-02T12:00:00.000Z",
    published_at: "2026-07-02T12:00:00.000Z",
    updated_at: "2026-07-02T12:00:00.000Z",
  },
  {
    id: "fp2",
    author_name: "Anonymous",
    title: null,
    content: "I shipped my first production build today. Small win, big feeling.",
    word_count: 11,
    status: "approved",
    submitted_at: "2026-07-01T12:00:00.000Z",
    published_at: "2026-07-01T12:00:00.000Z",
    updated_at: "2026-07-01T12:00:00.000Z",
  },
  {
    id: "fp3",
    author_name: "Amara O.",
    title: null,
    content: "I finally spoke up in the meeting. My idea mattered.",
    word_count: 10,
    status: "approved",
    submitted_at: "2026-06-30T12:00:00.000Z",
    published_at: "2026-06-30T12:00:00.000Z",
    updated_at: "2026-06-30T12:00:00.000Z",
  },
];
