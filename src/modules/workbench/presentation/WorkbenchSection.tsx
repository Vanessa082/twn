"use client";

/**
 * WorkbenchSection — projects managed in Admin → Workbench, each told as a small
 * story: what it is, why it started, what it is teaching, where it is now.
 * Renders nothing when no projects are published.
 */

import SectionHeading from "@/components/ui/SectionHeading";
import { useInView } from "@/hooks/useInView";
import type { Project, ProjectStatus } from "@/modules/workbench/contracts";
import { ArrowUpRight } from "lucide-react";

const STATUS_DOT: Record<ProjectStatus, string> = {
  Building: "bg-ink-accent",
  Active: "bg-foreground",
  Shipped: "bg-emerald-600/80",
  Continuous: "bg-foreground/50",
  Paused: "bg-muted-foreground/40",
};

interface WorkbenchSectionProps {
  projects: Project[];
  /** Homepage shows a heading and a link to /workbench; the page renders its own header. */
  variant?: "home" | "page";
}

function ProjectEntry({ project, index }: { project: Project; index: number }) {
  const story = [
    { label: "Why I started", text: project.why_started },
    { label: "What I’m learning", text: project.what_im_learning },
  ].filter((part): part is { label: string; text: string } => Boolean(part.text));

  return (
    <li
      id={`project-${project.id}`}
      className="grid scroll-mt-28 grid-cols-1 gap-6 border-b border-border py-10 md:grid-cols-12 md:gap-10 sm:py-12"
    >
      <div className="md:col-span-4">
        <span className="font-mono text-[11px] text-muted-foreground/70">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="mt-3 font-serif text-2xl font-bold leading-tight text-foreground sm:text-[1.75rem]">
          {project.name}
        </h3>
        <p className="mt-2 text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-ink-accent">
          {project.category}
        </p>
        <p className="mt-5 inline-flex items-center gap-2 text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <span
            className={`size-1.5 rounded-full ${STATUS_DOT[project.status]}`}
            aria-hidden="true"
          />
          <span className="sr-only">Where it is now: </span>
          {project.status}
        </p>
      </div>

      <div className="md:col-span-8">
        <p className="max-w-2xl font-serif text-[1.15rem] leading-[1.7] text-foreground/85 text-pretty">
          {project.overview}
        </p>

        {story.length > 0 && (
          <dl
            className={`mt-8 grid grid-cols-1 gap-6 ${story.length > 1 ? "sm:grid-cols-2 sm:gap-10" : "max-w-xl"}`}
          >
            {story.map((part) => (
              <div key={part.label} className="border-t border-border pt-4">
                <dt className="text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {part.label}
                </dt>
                <dd className="mt-2 text-[15px] leading-[1.75] text-muted-foreground text-pretty">
                  {part.text}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {(project.stack.length > 0 || project.url) && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            {project.stack.length > 0 && (
              <p className="font-mono text-[11px] text-muted-foreground">
                {project.stack.join(" · ")}
              </p>
            )}
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="link"
                className="group inline-flex items-center gap-2 text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
              >
                Visit project
                <ArrowUpRight
                  className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

export default function WorkbenchSection({ projects, variant = "home" }: WorkbenchSectionProps) {
  const [ref, inView] = useInView<HTMLElement>();

  if (projects.length === 0) return null;

  return (
    <section
      ref={ref}
      id="workbench"
      aria-label={variant === "page" ? "Projects" : undefined}
      aria-labelledby={variant === "home" ? "workbench-heading" : undefined}
      className={`twn-reveal ${inView ? "is-visible" : ""} scroll-mt-24 ${
        variant === "home" ? "border-b border-border bg-background py-20 sm:py-28" : ""
      }`}
    >
      <div className={variant === "home" ? "mx-auto max-w-7xl px-5 sm:px-10 lg:px-20" : ""}>
        {variant === "home" && (
          <SectionHeading
            eyebrow="Things I’m building, breaking, testing and learning from"
            title={<span id="workbench-heading">The Workbench</span>}
            action={{ label: "Visit the workbench", href: "/workbench" }}
          />
        )}

        <ol className="border-t border-border">
          {projects.map((project, index) => (
            <ProjectEntry key={project.id} project={project} index={index} />
          ))}
        </ol>
      </div>
    </section>
  );
}
