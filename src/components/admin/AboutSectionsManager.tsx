"use client";

import { updateAboutAction } from "@/app/actions/about";
import { aboutDataSchema } from "@/lib/validation/schemas";
import type {
  AboutCurrentlyItem,
  AboutData,
  AboutFiguringOutItem,
  AboutProjectItem,
  AboutTimelineItem,
  IdentityStage,
} from "@/types/about";
import {
  Briefcase,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  HelpCircle,
  Layers,
  Plus,
  Save,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";

interface AboutSectionsManagerProps {
  initialData: AboutData;
}

export default function AboutSectionsManager({ initialData }: AboutSectionsManagerProps) {
  const [data, setData] = useState<AboutData>(initialData);
  const [activeTab, setActiveTab] = useState<
    | "visibility"
    | "hero"
    | "voice"
    | "timeline"
    | "projects"
    | "figuring_out"
    | "currently"
    | "open_knowledge"
  >("visibility");
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSave = () => {
    const validation = aboutDataSchema.safeParse(data);
    if (!validation.success) {
      setStatusMessage({
        type: "error",
        text: validation.error.issues[0]?.message ?? "Check the About page content.",
      });
      return;
    }

    startTransition(async () => {
      setStatusMessage(null);
      const res = await updateAboutAction(validation.data);
      if (res.success && res.data) {
        setData(res.data);
        setStatusMessage({
          type: "success",
          text: "About page published and updated successfully!",
        });
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to update About page" });
      }
    });
  };

  const toggleSection = (key: keyof typeof data.section_visibility) => {
    setData((prev) => ({
      ...prev,
      section_visibility: {
        ...prev.section_visibility,
        [key]: !prev.section_visibility[key],
      },
    }));
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Action Bar */}
      <div className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-ink-accent">
              Content Module
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">About Page CMS</span>
          </div>
          <h1 className="font-serif font-bold text-2xl text-foreground mt-1">
            Manage About Page & Sections
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Publish or unpublish sections, edit timeline milestones, and update interactive notebook
            reflections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/about"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Live About Page
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-foreground text-background hover:bg-foreground/85 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            {isPending ? "Publishing..." : "Publish Changes"}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-lg text-xs font-medium flex items-center justify-between border ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
              : "bg-destructive/10 border-destructive/30 text-destructive"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {[
          { id: "visibility", label: "Section Visibility", icon: Eye },
          { id: "hero", label: "Hero & Portrait", icon: User },
          { id: "voice", label: "Voice & Versions", icon: Layers },
          { id: "timeline", label: "The Path (Timeline)", icon: Clock },
          { id: "projects", label: "Projects", icon: Briefcase },
          { id: "figuring_out", label: "Still Figuring Out", icon: HelpCircle },
          { id: "currently", label: "Currently Focus", icon: Sparkles },
          { id: "open_knowledge", label: "Open Knowledge", icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: SECTION VISIBILITY (INCREASE / DECREASE SECTIONS) ────────── */}
      {activeTab === "visibility" && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div>
            <h2 className="font-serif font-bold text-lg text-foreground">
              Publish or Unpublish Sections
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Toggle any section on or off. This allows you to increase or decrease what is
              displayed on the public page without losing your content.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                key: "hero",
                title: "Hero & Portrait Banner",
                desc: "Main headline, portrait photograph, lead statement",
              },
              {
                key: "short_version",
                title: "The Short Version & Roles",
                desc: "Introductory story paragraphs and role badges",
              },
              {
                key: "timeline",
                title: "The Path Timeline",
                desc: "Non-linear chronological milestones (BoulotMan to Now)",
              },
              {
                key: "projects",
                title: "Escaped The Notebook",
                desc: "Featured projects & products (Jalpha, Meyalo, etc.)",
              },
              {
                key: "open_knowledge",
                title: "Open Knowledge & Wikipedia",
                desc: "Wikimedia and regional documentation chapter",
              },
              {
                key: "manifesto",
                title: "Why This Exists (Manifesto)",
                desc: "High-contrast dark card documenting the middle",
              },
              {
                key: "currently",
                title: "Currently Focus Cards",
                desc: "Active verbs: Learning, Building, Writing, etc.",
              },
              {
                key: "still_figuring_out",
                title: "Still Figuring It Out",
                desc: "Interactive clickable reflections & notes",
              },
              {
                key: "closing",
                title: "Closing Quote & CTA",
                desc: "Final notebook quote and link to the archive",
              },
            ].map((section) => {
              const isVisible =
                data.section_visibility[section.key as keyof typeof data.section_visibility];
              return (
                <div
                  key={section.key}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isVisible
                      ? "border-border bg-background shadow-2xs"
                      : "border-border/50 bg-muted/40 opacity-70"
                  }`}
                >
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-sm text-foreground">
                        {section.title}
                      </span>
                      <span
                        className={`text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isVisible
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        {isVisible ? "Published" : "Hidden"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      {section.desc}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      toggleSection(section.key as keyof typeof data.section_visibility)
                    }
                    className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border ${
                      isVisible
                        ? "border-border hover:bg-muted text-foreground"
                        : "border-foreground bg-foreground text-background hover:bg-foreground/90"
                    }`}
                  >
                    {isVisible ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> Hide Section
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" /> Publish Section
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2: HERO & PORTRAIT ────────────────────────────────────────── */}
      {activeTab === "hero" && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-serif font-bold text-lg text-foreground">
                Hero Section & Portrait
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Customize your name, lead thought, story, and author portrait.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-8 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Overline Label
                </label>
                <input
                  type="text"
                  value={data.hero.tagline}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, tagline: e.target.value },
                    }))
                  }
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Main Headline / Name
                </label>
                <input
                  type="text"
                  value={data.hero.title}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, title: e.target.value },
                    }))
                  }
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Lead Statement
                </label>
                <input
                  type="text"
                  value={data.hero.lead}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, lead: e.target.value },
                    }))
                  }
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Bio Paragraphs
                </label>
                {data.hero.story.map((para, i) => (
                  <textarea
                    key={i}
                    rows={3}
                    value={para}
                    onChange={(e) => {
                      const newStory = [...data.hero.story];
                      newStory[i] = e.target.value;
                      setData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, story: newStory },
                      }));
                    }}
                    className="w-full p-3 mb-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-foreground leading-relaxed"
                  />
                ))}
              </div>
            </div>

            {/* Right: Portrait Preview */}
            <div className="md:col-span-4 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Author Portrait Photo
              </label>
              {/* <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-border"> */}
              <Image
                src={data.hero.image_url}
                alt={data.hero.title}
                fill
                className="object-cover"
              />
              {/* </div> */}
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">
                  Image URL / Path
                </label>
                <input
                  type="text"
                  value={data.hero.image_url}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, image_url: e.target.value },
                    }))
                  }
                  className="w-full h-9 px-3 rounded-md border border-border bg-background text-xs text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">
                  Portrait Caption
                </label>
                <input
                  type="text"
                  value={data.hero.image_caption}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, image_caption: e.target.value },
                    }))
                  }
                  className="w-full h-9 px-3 rounded-md border border-border bg-background text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2b: VOICE & VERSIONS ─────────────────────────────────────── */}
      {activeTab === "voice" && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div>
              <h2 className="font-serif font-bold text-lg text-foreground">The Short Version</h2>
              <p className="text-xs text-muted-foreground mt-1">
                The heading and paragraph beside your roles on the About page.
              </p>
            </div>
            <div>
              <label
                htmlFor="short-version-heading"
                className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1"
              >
                Heading
              </label>
              <input
                id="short-version-heading"
                type="text"
                value={data.short_version.heading}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    short_version: { ...prev.short_version, heading: e.target.value },
                  }))
                }
                className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="short-version-body"
                className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1"
              >
                Paragraph
              </label>
              <textarea
                id="short-version-body"
                rows={3}
                value={data.short_version.body}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    short_version: { ...prev.short_version, body: e.target.value },
                  }))
                }
                className="w-full p-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif font-bold text-lg text-foreground">
                  A Few Versions of Me
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  The chapters shown on the homepage beside your portrait. The section hides when
                  this list is empty.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newItem: IdentityStage = {
                    number: String(data.identity_stages.length + 1).padStart(2, "0"),
                    role: "",
                    description: "",
                  };
                  setData((prev) => ({
                    ...prev,
                    identity_stages: [...prev.identity_stages, newItem],
                  }));
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border hover:bg-muted text-foreground cursor-pointer"
              >
                <Plus className="size-3.5" /> Add Version
              </button>
            </div>

            <div className="space-y-4">
              {data.identity_stages.map((stage, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg border border-border bg-background flex flex-col sm:flex-row gap-4 items-start justify-between"
                >
                  <div className="space-y-3 flex-1 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">
                          Number
                        </label>
                        <input
                          type="text"
                          value={stage.number}
                          onChange={(e) => {
                            const updated = [...data.identity_stages];
                            updated[idx] = { ...updated[idx], number: e.target.value };
                            setData((prev) => ({ ...prev, identity_stages: updated }));
                          }}
                          className="w-full h-9 px-3 rounded border border-border bg-card text-xs text-foreground"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">
                          Version / Role
                        </label>
                        <input
                          type="text"
                          value={stage.role}
                          placeholder="e.g. Learner"
                          onChange={(e) => {
                            const updated = [...data.identity_stages];
                            updated[idx] = { ...updated[idx], role: e.target.value };
                            setData((prev) => ({ ...prev, identity_stages: updated }));
                          }}
                          className="w-full h-9 px-3 rounded border border-border bg-card text-xs text-foreground font-semibold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        value={stage.description}
                        onChange={(e) => {
                          const updated = [...data.identity_stages];
                          updated[idx] = { ...updated[idx], description: e.target.value };
                          setData((prev) => ({ ...prev, identity_stages: updated }));
                        }}
                        className="w-full p-2.5 rounded border border-border bg-card text-xs text-foreground leading-relaxed"
                      />
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => {
                        const updated = [...data.identity_stages];
                        [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
                        setData((prev) => ({ ...prev, identity_stages: updated }));
                      }}
                      className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                      title="Move up"
                    >
                      <ChevronUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === data.identity_stages.length - 1}
                      onClick={() => {
                        const updated = [...data.identity_stages];
                        [updated[idx + 1], updated[idx]] = [updated[idx], updated[idx + 1]];
                        setData((prev) => ({ ...prev, identity_stages: updated }));
                      }}
                      className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                      title="Move down"
                    >
                      <ChevronDown className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = data.identity_stages.filter((_, i) => i !== idx);
                        setData((prev) => ({ ...prev, identity_stages: updated }));
                      }}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      title="Delete version"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div>
              <h2 className="font-serif font-bold text-lg text-foreground">Closing Lines</h2>
              <p className="text-xs text-muted-foreground mt-1">
                The words that close the manifesto band, the open knowledge chapter and the page.
              </p>
            </div>
            {(
              [
                {
                  id: "manifesto-body",
                  label: "Why TWN exists: paragraph",
                  value: data.manifesto.body,
                  rows: 3,
                  onChange: (value: string) =>
                    setData((prev) => ({ ...prev, manifesto: { ...prev.manifesto, body: value } })),
                },
                {
                  id: "manifesto-closing",
                  label: "Why TWN exists: signature line",
                  value: data.manifesto.closing,
                  rows: 1,
                  onChange: (value: string) =>
                    setData((prev) => ({
                      ...prev,
                      manifesto: { ...prev.manifesto, closing: value },
                    })),
                },
                {
                  id: "open-knowledge-closing",
                  label: "Open knowledge: closing sentence",
                  value: data.open_knowledge.closing,
                  rows: 2,
                  onChange: (value: string) =>
                    setData((prev) => ({
                      ...prev,
                      open_knowledge: { ...prev.open_knowledge, closing: value },
                    })),
                },
                {
                  id: "closing-quote",
                  label: "Final quote of the page",
                  value: data.closing.quote,
                  rows: 2,
                  onChange: (value: string) =>
                    setData((prev) => ({ ...prev, closing: { ...prev.closing, quote: value } })),
                },
              ] as const
            ).map((field) => (
              <div key={field.id}>
                <label
                  htmlFor={field.id}
                  className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1"
                >
                  {field.label}
                </label>
                <textarea
                  id={field.id}
                  rows={field.rows}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="w-full p-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: THE PATH (TIMELINE) ────────────────────────────────────── */}
      {activeTab === "timeline" && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-lg text-foreground">
                The Path (Non-Linear Timeline)
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Add, reorder, or edit milestones.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const newItem: AboutTimelineItem = {
                  period: "2026",
                  title: "New Milestone",
                  detail: "Description of what happened and what was learned.",
                };
                setData((prev) => ({ ...prev, timeline: [...prev.timeline, newItem] }));
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border hover:bg-muted text-foreground cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Milestone
            </button>
          </div>

          <div className="space-y-4">
            {data.timeline.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border border-border bg-background flex flex-col sm:flex-row gap-4 items-start justify-between"
              >
                <div className="space-y-3 flex-1 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">
                        Period / Year
                      </label>
                      <input
                        type="text"
                        value={item.period}
                        onChange={(e) => {
                          const updated = [...data.timeline];
                          updated[idx] = { ...updated[idx], period: e.target.value };
                          setData((prev) => ({ ...prev, timeline: updated }));
                        }}
                        className="w-full h-9 px-3 rounded border border-border bg-card text-xs text-foreground"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">
                        Title / Role
                      </label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const updated = [...data.timeline];
                          updated[idx] = { ...updated[idx], title: e.target.value };
                          setData((prev) => ({ ...prev, timeline: updated }));
                        }}
                        className="w-full h-9 px-3 rounded border border-border bg-card text-xs text-foreground font-semibold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">
                      Narrative Detail
                    </label>
                    <textarea
                      rows={2}
                      value={item.detail}
                      onChange={(e) => {
                        const updated = [...data.timeline];
                        updated[idx] = { ...updated[idx], detail: e.target.value };
                        setData((prev) => ({ ...prev, timeline: updated }));
                      }}
                      className="w-full p-2.5 rounded border border-border bg-card text-xs text-foreground leading-relaxed"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const updated = data.timeline.filter((_, i) => i !== idx);
                    setData((prev) => ({ ...prev, timeline: updated }));
                  }}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors shrink-0 cursor-pointer"
                  title="Delete milestone"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: STILL FIGURING OUT (INTERACTIVE ACCORDION) ──────────────── */}
      {activeTab === "figuring_out" && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-lg text-foreground">
                Still Figuring It Out
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                These are the interactive click-to-open questions and reflections that readers can
                explore.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const newItem: AboutFiguringOutItem = {
                  question: "New inquiry question...",
                  reflection: "The deeper reflection note...",
                  tag: "Reflection",
                };
                setData((prev) => ({
                  ...prev,
                  still_figuring_out: [...prev.still_figuring_out, newItem],
                }));
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border hover:bg-muted text-foreground cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Inquiry
            </button>
          </div>

          <div className="space-y-4">
            {data.still_figuring_out.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-border bg-background space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">
                        Question / Theme
                      </label>
                      <input
                        type="text"
                        value={item.question}
                        onChange={(e) => {
                          const updated = [...data.still_figuring_out];
                          updated[idx] = { ...updated[idx], question: e.target.value };
                          setData((prev) => ({ ...prev, still_figuring_out: updated }));
                        }}
                        className="w-full h-9 px-3 rounded border border-border bg-card text-xs text-foreground font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">
                        Category Tag
                      </label>
                      <input
                        type="text"
                        value={item.tag || ""}
                        onChange={(e) => {
                          const updated = [...data.still_figuring_out];
                          updated[idx] = { ...updated[idx], tag: e.target.value };
                          setData((prev) => ({ ...prev, still_figuring_out: updated }));
                        }}
                        className="w-full h-9 px-3 rounded border border-border bg-card text-xs text-foreground"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = data.still_figuring_out.filter((_, i) => i !== idx);
                      setData((prev) => ({ ...prev, still_figuring_out: updated }));
                    }}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">
                    Expandable Reflection (Revealed on click)
                  </label>
                  <textarea
                    rows={3}
                    value={item.reflection}
                    onChange={(e) => {
                      const updated = [...data.still_figuring_out];
                      updated[idx] = { ...updated[idx], reflection: e.target.value };
                      setData((prev) => ({ ...prev, still_figuring_out: updated }));
                    }}
                    className="w-full p-3 rounded border border-border bg-card text-xs text-foreground leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 5: CURRENTLY ──────────────────────────────────────────────── */}
      {activeTab === "currently" && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-lg text-foreground">Currently Focus</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Active focal areas (Learning, Building, Writing, etc.).
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const newItem: AboutCurrentlyItem = {
                  verb: "Focus",
                  detail: "What you are actively doing.",
                };
                setData((prev) => ({ ...prev, currently: [...prev.currently, newItem] }));
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border hover:bg-muted text-foreground cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Focus Area
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.currently.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-border bg-background space-y-2"
              >
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={item.verb}
                    onChange={(e) => {
                      const updated = [...data.currently];
                      updated[idx] = { ...updated[idx], verb: e.target.value };
                      setData((prev) => ({ ...prev, currently: updated }));
                    }}
                    className="font-serif font-bold text-sm text-foreground bg-transparent border-b border-border/50 pb-0.5 focus:outline-none focus:border-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = data.currently.filter((_, i) => i !== idx);
                      setData((prev) => ({ ...prev, currently: updated }));
                    }}
                    className="text-muted-foreground hover:text-destructive p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={item.detail}
                  onChange={(e) => {
                    const updated = [...data.currently];
                    updated[idx] = { ...updated[idx], detail: e.target.value };
                    setData((prev) => ({ ...prev, currently: updated }));
                  }}
                  className="w-full text-xs text-muted-foreground bg-transparent border-0 resize-none focus:outline-none focus:ring-1 focus:ring-border rounded p-1"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 6: PROJECTS ───────────────────────────────────────────────── */}
      {activeTab === "projects" && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-lg text-foreground">
                Projects (Escaped The Notebook)
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Showcase tangible applications and tools.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const newItem: AboutProjectItem = {
                  name: "New Project",
                  desc: "Project description and technologies used.",
                  tag: "Product",
                };
                setData((prev) => ({ ...prev, projects: [...prev.projects, newItem] }));
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border hover:bg-muted text-foreground cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Project
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {data.projects.map((project, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-border bg-background space-y-2"
              >
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={project.tag}
                    onChange={(e) => {
                      const updated = [...data.projects];
                      updated[idx] = { ...updated[idx], tag: e.target.value };
                      setData((prev) => ({ ...prev, projects: updated }));
                    }}
                    className="text-[9px] font-sans font-bold uppercase tracking-widest text-ink-accent bg-transparent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = data.projects.filter((_, i) => i !== idx);
                      setData((prev) => ({ ...prev, projects: updated }));
                    }}
                    className="text-muted-foreground hover:text-destructive p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) => {
                    const updated = [...data.projects];
                    updated[idx] = { ...updated[idx], name: e.target.value };
                    setData((prev) => ({ ...prev, projects: updated }));
                  }}
                  className="font-serif font-bold text-sm text-foreground w-full bg-transparent border-b border-border/50 pb-0.5 focus:outline-none"
                />
                <textarea
                  rows={3}
                  value={project.desc}
                  onChange={(e) => {
                    const updated = [...data.projects];
                    updated[idx] = { ...updated[idx], desc: e.target.value };
                    setData((prev) => ({ ...prev, projects: updated }));
                  }}
                  className="w-full text-xs text-muted-foreground bg-transparent border-0 resize-none focus:outline-none p-1"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 7: OPEN KNOWLEDGE ─────────────────────────────────────────── */}
      {activeTab === "open_knowledge" && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div>
            <h2 className="font-serif font-bold text-lg text-foreground">
              Open Knowledge & Manifesto
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Edit the text for the Wikipedia/Wikimedia chapter and the Why TWN Exists dark card.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Open Knowledge Heading
              </label>
              <input
                type="text"
                value={data.open_knowledge.heading}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    open_knowledge: { ...prev.open_knowledge, heading: e.target.value },
                  }))
                }
                className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Open Knowledge Lead Story
              </label>
              <textarea
                rows={3}
                value={data.open_knowledge.lead}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    open_knowledge: { ...prev.open_knowledge, lead: e.target.value },
                  }))
                }
                className="w-full p-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Why TWN Exists: Main Quote
              </label>
              <textarea
                rows={2}
                value={data.manifesto.quote}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    manifesto: { ...prev.manifesto, quote: e.target.value },
                  }))
                }
                className="w-full p-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none font-quote text-base"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
