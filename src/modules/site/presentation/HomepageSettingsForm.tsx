"use client";

import MigrationNotice from "@/components/admin/ui/MigrationNotice";
import { ToastContainer, useToast } from "@/components/admin/ui/Toast";
import { homepageSettingsSchema } from "@/lib/validation/schemas";
import { updateHomepageSettingsAction } from "@/modules/site/actions";
import type { HomepageSettings, SocialLink } from "@/modules/site/contracts";
import { AlertCircle, ExternalLink, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

export interface FeaturableNote {
  id: string;
  title: string;
  published_at: string | null;
}

interface HomepageSettingsFormProps {
  initialSettings: HomepageSettings;
  notes: FeaturableNote[];
  tableReady: boolean;
}

interface SettingsDraft {
  featured_article_id: string;
  volume_label: string;
  volume_subtitle: string;
  volume_season: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_topics: string;
  contact_email: string;
  location: string;
  social_links: SocialLink[];
}

const inputClass =
  "w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground transition-colors focus:border-foreground focus:outline-none";
const labelClass = "text-xs font-bold uppercase tracking-wider text-foreground";
const hintClass = "text-[11px] text-muted-foreground";
const cardClass = "space-y-5 rounded-xl border border-border bg-card p-6";

function toDraft(settings: HomepageSettings): SettingsDraft {
  return {
    featured_article_id: settings.featured_article_id ?? "",
    volume_label: settings.volume_label,
    volume_subtitle: settings.volume_subtitle,
    volume_season: settings.volume_season,
    hero_eyebrow: settings.hero_eyebrow,
    hero_title: settings.hero_title,
    hero_topics: settings.hero_topics.join(", "),
    contact_email: settings.contact_email ?? "",
    location: settings.location ?? "",
    social_links: settings.social_links,
  };
}

export default function HomepageSettingsForm({
  initialSettings,
  notes,
  tableReady,
}: HomepageSettingsFormProps) {
  const [draft, setDraft] = useState<SettingsDraft>(() => toDraft(initialSettings));
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toasts, showSuccess } = useToast();

  const update = <K extends keyof SettingsDraft>(key: K, value: SettingsDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const updateLink = (index: number, patch: Partial<SocialLink>) =>
    update(
      "social_links",
      draft.social_links.map((link, i) => (i === index ? { ...link, ...patch } : link))
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validation = homepageSettingsSchema.safeParse({
      ...draft,
      featured_article_id: draft.featured_article_id || null,
      contact_email: draft.contact_email.trim() || null,
      location: draft.location.trim() || null,
      hero_topics: draft.hero_topics
        .split(",")
        .map((topic) => topic.trim())
        .filter(Boolean),
      social_links: draft.social_links.filter((link) => link.label.trim() || link.url.trim()),
    });
    if (!validation.success) {
      setFormError(validation.error.issues[0]?.message ?? "Check the homepage settings.");
      return;
    }

    startTransition(async () => {
      const result = await updateHomepageSettingsAction(validation.data);
      if (result.success && result.data) {
        setDraft(toDraft(result.data));
        showSuccess("Homepage updated.");
      } else {
        setFormError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-black tracking-tight text-foreground">
            Homepage &amp; Site
          </h1>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
            The hero, the featured note and its volume, and the contact details and links in the
            footer.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted"
          >
            <ExternalLink className="size-3.5" /> View homepage
          </Link>
          <button
            type="submit"
            disabled={isPending || !tableReady}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-foreground px-5 py-2 text-xs font-bold uppercase tracking-wider text-background hover:bg-foreground/85 disabled:opacity-50"
          >
            <Save className="size-4" />
            {isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {!tableReady && (
        <MigrationNotice
          table="homepage_settings"
          migrationFile="src/lib/db/migration_homepage_settings.sql"
        />
      )}

      {formError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-500"
        >
          <AlertCircle className="size-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <fieldset disabled={!tableReady} className="space-y-8 disabled:opacity-60">
        <section className={cardClass}>
          <div>
            <h2 className="font-serif text-lg font-bold text-foreground">Hero</h2>
            <p className={hintClass}>
              The first thing a reader sees: who this notebook belongs to.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="hero-eyebrow" className={labelClass}>
                Overline
              </label>
              <input
                id="hero-eyebrow"
                value={draft.hero_eyebrow}
                onChange={(e) => update("hero_eyebrow", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="hero-title" className={labelClass}>
                Title
              </label>
              <input
                id="hero-title"
                value={draft.hero_title}
                onChange={(e) => update("hero_title", e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="hero-topics" className={labelClass}>
                Topics
              </label>
              <input
                id="hero-topics"
                value={draft.hero_topics}
                onChange={(e) => update("hero_topics", e.target.value)}
                className={inputClass}
              />
              <p className={hintClass}>
                Separate with commas. Shown as a quiet line under the title.
              </p>
            </div>
          </div>
        </section>

        <section className={cardClass}>
          <div>
            <h2 className="font-serif text-lg font-bold text-foreground">Featured note</h2>
            <p className={hintClass}>
              Volumes are seasons of the notebook. Change them when a chapter of your life changes.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="space-y-1.5 md:col-span-3">
              <label htmlFor="featured-note" className={labelClass}>
                Featured note
              </label>
              <select
                id="featured-note"
                value={draft.featured_article_id}
                onChange={(e) => update("featured_article_id", e.target.value)}
                className={inputClass}
              >
                <option value="">Automatic: the latest published note</option>
                {notes.map((note) => (
                  <option key={note.id} value={note.id}>
                    {note.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="volume-label" className={labelClass}>
                Volume
              </label>
              <input
                id="volume-label"
                value={draft.volume_label}
                onChange={(e) => update("volume_label", e.target.value)}
                placeholder="Vol. 01"
                className={inputClass}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="volume-season" className={labelClass}>
                Season
              </label>
              <input
                id="volume-season"
                value={draft.volume_season}
                onChange={(e) => update("volume_season", e.target.value)}
                placeholder="September 2026"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="volume-subtitle" className={labelClass}>
                Volume theme (optional)
              </label>
              <input
                id="volume-subtitle"
                value={draft.volume_subtitle}
                onChange={(e) => update("volume_subtitle", e.target.value)}
                placeholder="e.g. On beginnings"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        <section className={cardClass}>
          <div>
            <h2 className="font-serif text-lg font-bold text-foreground">Footer &amp; contact</h2>
            <p className={hintClass}>Only the links you add here appear in the footer.</p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="contact-email" className={labelClass}>
                Contact email
              </label>
              <input
                id="contact-email"
                type="email"
                value={draft.contact_email}
                onChange={(e) => update("contact_email", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="location" className={labelClass}>
                Location
              </label>
              <input
                id="location"
                value={draft.location}
                onChange={(e) => update("location", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-3">
            <span className={labelClass}>Social links</span>
            {draft.social_links.length === 0 && <p className={hintClass}>No links yet.</p>}
            {draft.social_links.map((link, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  aria-label="Link label"
                  value={link.label}
                  onChange={(e) => updateLink(index, { label: e.target.value })}
                  placeholder="LinkedIn"
                  className={`${inputClass} max-w-[12rem]`}
                />
                <input
                  aria-label="Link URL"
                  type="url"
                  value={link.url}
                  onChange={(e) => updateLink(index, { url: e.target.value })}
                  placeholder="https://"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() =>
                    update(
                      "social_links",
                      draft.social_links.filter((_, i) => i !== index)
                    )
                  }
                  title="Remove link"
                  className="cursor-pointer p-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            {draft.social_links.length < 6 && (
              <button
                type="button"
                onClick={() =>
                  update("social_links", [...draft.social_links, { label: "", url: "" }])
                }
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <Plus className="size-3.5" /> Add link
              </button>
            )}
          </div>
        </section>
      </fieldset>

      <ToastContainer toasts={toasts} />
    </form>
  );
}
