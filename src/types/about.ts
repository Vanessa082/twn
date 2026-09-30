// ── About Page Types ────────────────────────────────────────────────────────
// Single source of truth for the editable About page sections.

export interface AboutRoleItem {
  label: string;
  sub: string;
}

export interface AboutTimelineItem {
  period: string;
  title: string;
  detail: string;
}

export interface AboutProjectItem {
  name: string;
  desc: string;
  tag: string;
  link?: string;
}

export interface AboutCurrentlyItem {
  verb: string;
  detail: string;
}

export interface AboutFiguringOutItem {
  question: string;
  reflection: string;
  tag?: string;
}

/**
 * One stage in the "A few versions of me" biographical continuum.
 * Managed through the About Page CMS → Identity Stages tab.
 */
export interface IdentityStage {
  number: string; // e.g. "01"
  role: string; // e.g. "Learner"
  description: string; // 1–2 sentence description of this phase
}

export interface AboutSectionVisibility {
  hero: boolean;
  short_version: boolean;
  timeline: boolean;
  projects: boolean;
  open_knowledge: boolean;
  manifesto: boolean;
  currently: boolean;
  still_figuring_out: boolean;
  closing: boolean;
  identity_stages: boolean;
}

export interface AboutData {
  hero: {
    title: string;
    tagline: string;
    lead: string;
    story: string[];
    roles: AboutRoleItem[];
    image_url: string;
    image_caption: string;
  };
  timeline: AboutTimelineItem[];
  projects: AboutProjectItem[];
  short_version: {
    heading: string;
    body: string;
  };
  open_knowledge: {
    heading: string;
    lead: string;
    quote: string;
    /** Sentence closing the chapter, after the quote. */
    closing: string;
    topics: string[];
  };
  manifesto: {
    quote: string;
    body: string;
    closing: string;
  };
  /** The final words of the About page. */
  closing: {
    quote: string;
  };
  currently: AboutCurrentlyItem[];
  still_figuring_out: AboutFiguringOutItem[];
  /** The biographical continuum powering the "A few versions of me" section. */
  identity_stages: IdentityStage[];
  section_visibility: AboutSectionVisibility;
  updated_at?: string;
}
