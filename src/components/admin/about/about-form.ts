import type { AboutData } from "@/types/about";
import { formOptions } from "@tanstack/react-form";

/** Shared by the editor and each section so field names are type-checked. */
export const aboutFormOptions = formOptions({ defaultValues: {} as AboutData });

export const ABOUT_TABS = [
  { id: "sections", label: "Sections" },
  { id: "hero", label: "Hero & portrait" },
  { id: "voice", label: "Short version & versions" },
  { id: "timeline", label: "The path" },
  { id: "projects", label: "Projects" },
  { id: "figuring", label: "Still figuring out" },
  { id: "currently", label: "Currently" },
  { id: "words", label: "Manifesto & open knowledge" },
] as const;

export type AboutTabId = (typeof ABOUT_TABS)[number]["id"];

const TAB_FOR_KEY: Record<string, AboutTabId> = {
  section_visibility: "sections",
  hero: "hero",
  short_version: "voice",
  identity_stages: "voice",
  timeline: "timeline",
  projects: "projects",
  still_figuring_out: "figuring",
  currently: "currently",
  manifesto: "words",
  open_knowledge: "words",
  closing: "words",
};

/** Which tab holds a field, so a failed save can jump straight to it. */
export function tabForPath(path: readonly PropertyKey[] | undefined): AboutTabId {
  const key = path?.[0];
  if (path?.[0] === "hero" && path[1] === "roles") return "voice";
  return (typeof key === "string" && TAB_FOR_KEY[key]) || "hero";
}

export const VISIBILITY_SECTIONS: {
  key: keyof AboutData["section_visibility"];
  title: string;
  description: string;
}[] = [
  {
    key: "hero",
    title: "Hero & portrait",
    description: "Name, lead statement, story and portrait.",
  },
  {
    key: "short_version",
    title: "The short version & roles",
    description: "Introductory paragraph and role badges.",
  },
  {
    key: "identity_stages",
    title: "A few versions of me",
    description: "The chapters beside your portrait on the homepage.",
  },
  { key: "timeline", title: "The path", description: "Milestones, in the order you choose." },
  { key: "projects", title: "Escaped the notebook", description: "Projects and products." },
  {
    key: "open_knowledge",
    title: "Open knowledge",
    description: "The Wikimedia and documentation chapter.",
  },
  { key: "manifesto", title: "Why this exists", description: "The dark manifesto band." },
  {
    key: "currently",
    title: "Currently",
    description: "What you are learning, building, writing.",
  },
  {
    key: "still_figuring_out",
    title: "Still figuring it out",
    description: "Open questions and reflections.",
  },
  { key: "closing", title: "Closing quote", description: "The final words of the page." },
];
