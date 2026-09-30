"use client";

import { updateAboutAction } from "@/app/actions/about";
import { useAppForm } from "@/components/admin/form/app-form";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { aboutDataSchema } from "@/lib/validation/schemas";
import type { AboutData } from "@/types/about";
import { revalidateLogic, useStore } from "@tanstack/react-form";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  CurrentlyTab,
  FiguringTab,
  HeroTab,
  ProjectsTab,
  SectionsTab,
  TimelineTab,
  VoiceTab,
  WordsTab,
} from "./AboutSections";
import { ABOUT_TABS, type AboutTabId, tabForPath } from "./about-form";

interface AboutEditorProps {
  initialData: AboutData;
}

interface StatusMessage {
  type: "success" | "error";
  text: string;
}

/**
 * About page CMS. Form state lives in TanStack Form: each list can be added
 * to, reordered and emptied, the same Zod schema as the server validates as
 * you type after the first save, and Discard restores the last saved copy.
 */
export default function AboutEditor({ initialData }: AboutEditorProps) {
  const [activeTab, setActiveTab] = useState<AboutTabId>("sections");
  const [status, setStatus] = useState<StatusMessage | null>(null);

  const form = useAppForm({
    defaultValues: initialData,
    validationLogic: revalidateLogic({ mode: "submit", modeAfterSubmission: "change" }),
    validators: { onDynamic: aboutDataSchema },
    onSubmit: async ({ value, formApi }) => {
      setStatus(null);
      const result = await updateAboutAction(value);
      if (!result.success || !result.data) {
        setStatus({ type: "error", text: result.error ?? "The About page could not be saved." });
        return;
      }
      formApi.reset(result.data);
      setStatus({ type: "success", text: "Published. The About page is updated." });
    },
    onSubmitInvalid: ({ value }) => {
      const issue = aboutDataSchema.safeParse(value).error?.issues[0];
      if (issue) setActiveTab(tabForPath(issue.path));
      setStatus({
        type: "error",
        text: issue
          ? `Nothing was saved yet: ${issue.message}`
          : "Nothing was saved yet. Check the highlighted fields.",
      });
    },
  });

  const isDirty = useStore(form.store, (state) => state.isDirty);
  useUnsavedChanges({ isDirty });

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      className="space-y-6"
    >
      <div className="sticky top-2 z-20 flex flex-col gap-4 rounded-xl border border-border bg-card/95 p-4 shadow-xs backdrop-blur sm:p-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-ink-accent">About page</p>
          <h1 className="mt-1 font-serif text-2xl font-bold text-foreground">
            Manage the About page
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/about"
            target="_blank"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold text-foreground hover:bg-muted"
          >
            <ExternalLink className="size-3.5" aria-hidden="true" /> View live
          </Link>
          <form.AppForm>
            <form.SaveBar />
          </form.AppForm>
        </div>
      </div>

      {status && (
        <div
          role={status.type === "error" ? "alert" : "status"}
          className={`flex items-center justify-between gap-4 rounded-lg border p-4 text-xs font-medium ${
            status.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          <span>{status.text}</span>
          <button
            type="button"
            onClick={() => setStatus(null)}
            className="cursor-pointer opacity-70 hover:opacity-100"
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      <div
        role="tablist"
        aria-label="About page sections"
        className="flex gap-2 overflow-x-auto border-b border-border pb-3 [scrollbar-width:none]"
      >
        {ABOUT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 cursor-pointer whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
              activeTab === tab.id
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {activeTab === "sections" && <SectionsTab form={form} />}
        {activeTab === "hero" && <HeroTab form={form} />}
        {activeTab === "voice" && <VoiceTab form={form} />}
        {activeTab === "timeline" && <TimelineTab form={form} />}
        {activeTab === "projects" && <ProjectsTab form={form} />}
        {activeTab === "figuring" && <FiguringTab form={form} />}
        {activeTab === "currently" && <CurrentlyTab form={form} />}
        {activeTab === "words" && <WordsTab form={form} />}
      </div>
    </form>
  );
}
