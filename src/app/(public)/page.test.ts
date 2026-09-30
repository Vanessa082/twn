import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FieldNotesSection from "@/components/home/FieldNotesSection";
import HeroClient from "@/components/home/HeroClient";
import WorkbenchSection from "@/components/home/WorkbenchSection";
import type { Article } from "@/types";
import type { FieldNote, Project } from "@/types/cms";

const timestamps = { created_at: "2026-09-01T00:00:00Z", updated_at: "2026-09-01T00:00:00Z" };

const note: FieldNote = {
  id: "note-1",
  note_number: "001",
  tag: "Craft",
  headline: "A note managed in the admin",
  body: "First paragraph from the CMS.\n\nSecond paragraph from the CMS.",
  is_published: true,
  display_order: 0,
  published_at: "2026-09-02T00:00:00Z",
  ...timestamps,
};

const project: Project = {
  id: "project-1",
  name: "A project managed in the admin",
  category: "Open source",
  status: "Building",
  overview: "What the project is.",
  why_started: "Why it started.",
  what_im_learning: null,
  stack: ["Next.js"],
  url: null,
  is_published: true,
  display_order: 0,
  ...timestamps,
};

const article: Article = {
  id: "article-1",
  title: "An article worth reading",
  slug: "an-article-worth-reading",
  excerpt: "This required excerpt introduces the latest article to readers.",
  content: "<p>The full article.</p>",
  cover_image: null,
  category: "technology",
  status: "published",
  published_at: "2026-09-30T08:00:00Z",
  ...timestamps,
};

describe("Today's Page", () => {
  it("promotes the latest article through its required excerpt", () => {
    const markup = renderToStaticMarkup(
      React.createElement(HeroClient, {
        eyebrow: "The Notebook of a Tech Woman",
        title: "Notes from becoming.",
        topics: ["Technology"],
        authorName: "Vanessa",
        todaysArticle: article,
      })
    );

    expect(markup).toContain(article.excerpt);
    expect(markup).toContain(`/articles/${article.slug}`);
    expect(markup).toContain("Read the full note");
  });
});

describe("FieldNotesSection", () => {
  it("renders nothing when no field notes are published", () => {
    expect(renderToStaticMarkup(React.createElement(FieldNotesSection, { notes: [] }))).toBe("");
  });

  it("renders the notes supplied by the CMS, paragraph by paragraph", () => {
    const markup = renderToStaticMarkup(React.createElement(FieldNotesSection, { notes: [note] }));
    expect(markup).toContain("A note managed in the admin");
    expect(markup).toContain("<p>First paragraph from the CMS.</p>");
    expect(markup).toContain("<p>Second paragraph from the CMS.</p>");
  });
});

describe("WorkbenchSection", () => {
  it("renders nothing when no projects are published", () => {
    expect(renderToStaticMarkup(React.createElement(WorkbenchSection, { projects: [] }))).toBe("");
  });

  it("tells each project's story and omits the parts left blank", () => {
    const markup = renderToStaticMarkup(
      React.createElement(WorkbenchSection, { projects: [project] })
    );
    expect(markup).toContain("A project managed in the admin");
    expect(markup).toContain("Why it started.");
    expect(markup).not.toContain("What I’m learning");
  });
});
