import WorkbenchSection from "@/components/home/WorkbenchSection";
import { Eyebrow, TextLink } from "@/components/ui/SectionHeading";
import { pageMetadata } from "@/lib/seo";
import { getPublishedProjects } from "@/lib/services/projects";
import { routes } from "@/lib/site";

export const revalidate = 60;

export const metadata = pageMetadata({
  title: "The Workbench",
  description:
    "Things Vanessa is building, breaking, testing and learning from, with honest notes on what worked.",
  path: routes.workbench,
  eyebrow: "Workbench",
});

export default async function WorkbenchPage() {
  const projects = await getPublishedProjects();

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-10 sm:py-24 lg:px-20">
        <header className="max-w-3xl border-b border-border pb-12">
          <Eyebrow>Things I&rsquo;m building, breaking, testing and learning from</Eyebrow>
          <h1
            className="mt-5 font-serif font-bold leading-[0.98] tracking-[-0.03em] text-foreground"
            style={{ fontSize: "clamp(2.8rem, 6vw, 4.75rem)" }}
          >
            The Workbench
          </h1>
        </header>

        {projects.length > 0 ? (
          <div className="mt-4">
            <WorkbenchSection projects={projects} variant="page" />
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="font-quote text-2xl italic text-muted-foreground">
              The workbench is quiet right now.
            </p>
            <div className="mt-8 flex justify-center">
              <TextLink href="/notebook">Read the notebook instead</TextLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
