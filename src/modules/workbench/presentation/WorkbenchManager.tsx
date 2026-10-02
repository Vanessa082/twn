"use client";

import { useConfirm } from "@/components/admin/ui/ConfirmDialog";
import MigrationNotice from "@/components/admin/ui/MigrationNotice";
import { ToastContainer, useToast } from "@/components/admin/ui/Toast";
import { projectSchema } from "@/lib/validation/schemas";
import {
  createProjectAction,
  deleteProjectAction,
  updateProjectAction,
} from "@/modules/workbench/actions";
import {
  PROJECT_STATUSES,
  type Project,
  type ProjectInput,
  type ProjectStatus,
} from "@/modules/workbench/contracts";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Edit2,
  ExternalLink,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useState, useTransition } from "react";

interface WorkbenchManagerProps {
  initialProjects: Project[];
  tableReady: boolean;
}

interface ProjectDraft
  extends Omit<ProjectInput, "stack" | "why_started" | "what_im_learning" | "url"> {
  stack: string;
  why_started: string;
  what_im_learning: string;
  url: string;
}

const EMPTY_DRAFT: ProjectDraft = {
  name: "",
  category: "",
  status: "Building",
  overview: "",
  why_started: "",
  what_im_learning: "",
  stack: "",
  url: "",
  is_published: false,
  display_order: 0,
};

const inputClass =
  "w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground transition-colors focus:border-foreground focus:outline-none";
const labelClass = "text-xs font-bold uppercase tracking-wider text-foreground";
const hintClass = "text-[11px] text-muted-foreground";

function toDraft(project: Project): ProjectDraft {
  return {
    name: project.name,
    category: project.category,
    status: project.status,
    overview: project.overview,
    why_started: project.why_started ?? "",
    what_im_learning: project.what_im_learning ?? "",
    stack: project.stack.join(", "),
    url: project.url ?? "",
    is_published: project.is_published,
    display_order: project.display_order,
  };
}

function toInput(draft: ProjectDraft): ProjectInput {
  return {
    ...draft,
    why_started: draft.why_started.trim() || null,
    what_im_learning: draft.what_im_learning.trim() || null,
    url: draft.url.trim() || null,
    stack: draft.stack
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  };
}

export default function WorkbenchManager({ initialProjects, tableReady }: WorkbenchManagerProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [draft, setDraft] = useState<ProjectDraft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toasts, showError, showSuccess } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const update = <K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]) =>
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));

  const openNew = () => {
    const nextOrder = projects.reduce((max, p) => Math.max(max, p.display_order + 1), 0);
    setDraft({ ...EMPTY_DRAFT, display_order: nextOrder });
    setEditingId(null);
    setFormError(null);
  };

  const openEdit = (project: Project) => {
    setDraft(toDraft(project));
    setEditingId(project.id);
    setFormError(null);
  };

  const close = () => {
    setDraft(null);
    setEditingId(null);
    setFormError(null);
  };

  const replaceProject = (next: Project) =>
    setProjects((prev) =>
      prev
        .map((p) => (p.id === next.id ? next : p))
        .sort((a, b) => a.display_order - b.display_order)
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const validation = projectSchema.safeParse(toInput(draft));
    if (!validation.success) {
      setFormError(validation.error.issues[0]?.message ?? "Check the project details.");
      return;
    }
    setFormError(null);

    startTransition(async () => {
      const result = editingId
        ? await updateProjectAction(editingId, validation.data)
        : await createProjectAction(validation.data);

      if (!result.success || !result.data) {
        setFormError(result.error);
        return;
      }
      const saved = result.data;
      if (editingId) {
        replaceProject(saved);
      } else {
        setProjects((prev) => [...prev, saved].sort((a, b) => a.display_order - b.display_order));
      }
      showSuccess(editingId ? "Project updated." : "Project added to the workbench.");
      close();
    });
  };

  const togglePublished = (project: Project) =>
    startTransition(async () => {
      const result = await updateProjectAction(project.id, { is_published: !project.is_published });
      if (result.success && result.data) {
        replaceProject(result.data);
        showSuccess(result.data.is_published ? "Published on the workbench." : "Moved to drafts.");
      } else {
        showError(result.error ?? "Failed to update project");
      }
    });

  const move = (index: number, direction: -1 | 1) => {
    const a = projects[index];
    const b = projects[index + direction];
    if (!a || !b) return;
    // Swap positions; fall back to index-based orders if both share a value.
    const orderA = a.display_order === b.display_order ? index : a.display_order;
    const orderB = a.display_order === b.display_order ? index + direction : b.display_order;

    startTransition(async () => {
      const [first, second] = await Promise.all([
        updateProjectAction(a.id, { display_order: orderB }),
        updateProjectAction(b.id, { display_order: orderA }),
      ]);
      if (first.success && first.data && second.success && second.data) {
        replaceProject(first.data);
        replaceProject(second.data);
      } else {
        showError(first.error ?? second.error ?? "Failed to reorder");
      }
    });
  };

  const handleDelete = async (project: Project) => {
    const ok = await confirm({
      title: "Delete project?",
      message: `“${project.name}” will be removed from the workbench permanently.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteProjectAction(project.id);
      if (result.success) {
        setProjects((prev) => prev.filter((p) => p.id !== project.id));
        showSuccess("Project deleted.");
      } else {
        showError(result.error ?? "Failed to delete project");
      }
    });
  };

  const publishedCount = projects.filter((p) => p.is_published).length;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-black tracking-tight text-foreground">
            The Workbench
          </h1>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
            Projects you&apos;re building, breaking and learning from. Each one tells a small story:
            what it is, why you started, what it&apos;s teaching you and where it is now. Published
            projects appear on the homepage (first three) and on{" "}
            <a
              href="/workbench"
              target="_blank"
              className="underline underline-offset-2"
              rel="noreferrer"
            >
              /workbench
            </a>
            .
          </p>
        </div>
        {tableReady && !draft && (
          <button
            type="button"
            onClick={openNew}
            className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md border border-foreground bg-foreground px-4 py-2 text-xs font-bold uppercase tracking-wider text-background transition-colors hover:bg-background hover:text-foreground"
          >
            <Plus className="size-4" /> Add project
          </button>
        )}
      </div>

      {!tableReady && (
        <MigrationNotice table="projects" migrationFile="src/lib/db/migration_projects.sql" />
      )}

      {draft && (
        <form
          onSubmit={handleSubmit}
          className="animate-fade-in space-y-6 rounded-xl border border-border bg-card p-6 shadow-xs"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-serif text-lg font-bold text-foreground">
              {editingId ? "Edit project" : "New project"}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close form"
              className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>

          {formError && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-md border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-500"
            >
              <AlertCircle className="size-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="project-name" className={labelClass}>
                Name
              </label>
              <input
                id="project-name"
                value={draft.name}
                onChange={(e) => update("name", e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="project-category" className={labelClass}>
                Category
              </label>
              <input
                id="project-category"
                value={draft.category}
                onChange={(e) => update("category", e.target.value)}
                placeholder="e.g. Open source, Education, SaaS"
                className={inputClass}
                required
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="project-overview" className={labelClass}>
                What it is
              </label>
              <textarea
                id="project-overview"
                rows={3}
                value={draft.overview}
                onChange={(e) => update("overview", e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="project-why" className={labelClass}>
                Why I started
              </label>
              <textarea
                id="project-why"
                rows={4}
                value={draft.why_started}
                onChange={(e) => update("why_started", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="project-learning" className={labelClass}>
                What I&apos;m learning
              </label>
              <textarea
                id="project-learning"
                rows={4}
                value={draft.what_im_learning}
                onChange={(e) => update("what_im_learning", e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="project-status" className={labelClass}>
                Where it is now
              </label>
              <select
                id="project-status"
                value={draft.status}
                onChange={(e) => update("status", e.target.value as ProjectStatus)}
                className={inputClass}
              >
                {PROJECT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="project-url" className={labelClass}>
                Link (optional)
              </label>
              <input
                id="project-url"
                type="url"
                value={draft.url}
                onChange={(e) => update("url", e.target.value)}
                placeholder="https://"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="project-stack" className={labelClass}>
                Stack (optional)
              </label>
              <input
                id="project-stack"
                value={draft.stack}
                onChange={(e) => update("stack", e.target.value)}
                placeholder="Next.js, Supabase, TypeScript"
                className={inputClass}
              />
              <p className={hintClass}>Separate with commas.</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="project-order" className={labelClass}>
                Position
              </label>
              <input
                id="project-order"
                type="number"
                min={0}
                max={999}
                value={draft.display_order}
                onChange={(e) => update("display_order", Number(e.target.value))}
                className={inputClass}
              />
              <p className={hintClass}>Lower numbers appear first.</p>
            </div>

            <label className="flex cursor-pointer select-none items-center gap-3 md:col-span-2">
              <input
                type="checkbox"
                checked={draft.is_published}
                onChange={(e) => update("is_published", e.target.checked)}
                className="size-4 cursor-pointer rounded-sm accent-foreground"
              />
              <span className={labelClass}>Published</span>
              <span className={hintClass}>Drafts stay private to the dashboard.</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={close}
              className="cursor-pointer rounded-md border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors hover:bg-muted/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="cursor-pointer rounded-md border border-foreground bg-foreground px-5 py-2 text-xs font-bold uppercase tracking-wider text-background transition-colors hover:bg-background hover:text-foreground disabled:opacity-50"
            >
              {isPending ? "Saving…" : editingId ? "Update project" : "Save project"}
            </button>
          </div>
        </form>
      )}

      {tableReady && (
        <section className="space-y-4">
          <h2 className="font-serif text-xl font-bold text-foreground">
            On the bench{" "}
            <span className="text-sm font-normal text-muted-foreground">
              · {publishedCount} published, {projects.length - publishedCount} draft
            </span>
          </h2>

          {projects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nothing on the workbench yet. Until you publish a project, the homepage section
                stays hidden.
              </p>
            </div>
          ) : (
            <ol className="space-y-3">
              {projects.map((project, index) => (
                <li
                  key={project.id}
                  className={`rounded-xl border bg-card p-5 transition-opacity ${
                    project.is_published ? "border-border" : "border-border/50 opacity-70"
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-muted-foreground">{project.category}</span>
                        <span className="rounded-sm border border-border px-2 py-0.5 text-foreground">
                          {project.status}
                        </span>
                        {!project.is_published && (
                          <span className="rounded-sm bg-muted px-2 py-0.5 text-muted-foreground">
                            Draft
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-lg font-bold text-foreground">
                        {project.name}
                      </h3>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {project.overview}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => move(index, -1)}
                        disabled={index === 0 || isPending}
                        title="Move up"
                        className="cursor-pointer rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <ArrowUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, 1)}
                        disabled={index === projects.length - 1 || isPending}
                        title="Move down"
                        className="cursor-pointer rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <ArrowDown className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePublished(project)}
                        disabled={isPending}
                        title={project.is_published ? "Unpublish" : "Publish"}
                        className="cursor-pointer rounded-lg border border-border p-2 text-foreground hover:border-foreground"
                      >
                        {project.is_published ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open link"
                          className="rounded-lg border border-border p-2 text-foreground hover:border-foreground"
                        >
                          <ExternalLink className="size-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => openEdit(project)}
                        title="Edit"
                        className="cursor-pointer rounded-lg border border-border p-2 text-foreground hover:border-foreground"
                      >
                        <Edit2 className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(project)}
                        disabled={isPending}
                        title="Delete"
                        className="cursor-pointer rounded-lg border border-red-500/10 bg-red-500/5 p-2 text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      {ConfirmDialog}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
