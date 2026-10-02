import { getAllProjectsAdmin } from "@/modules/workbench";
import { WorkbenchManager } from "@/modules/workbench/admin-ui";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminWorkbenchPage() {
  const { projects, tableReady } = await getAllProjectsAdmin();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-muted-gold"
        >
          <ArrowLeft className="size-3.5" />
          Back to Dashboard
        </Link>
      </div>
      <WorkbenchManager initialProjects={projects} tableReady={tableReady} />
    </div>
  );
}
