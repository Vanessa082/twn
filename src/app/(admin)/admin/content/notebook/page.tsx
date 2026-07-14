import NotebookEntriesManager from "@/components/admin/NotebookEntriesManager";
import { getAllArticlesAdmin } from "@/lib/services/articles";
import { getAllEntriesAdmin, getAllNotebooksAdmin } from "@/lib/services/notebook-entries";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminNotebookEntriesPage() {
  // Fetch entries, notebooks, and articles in parallel on the server
  const [entries, notebooks, articles] = await Promise.all([
    getAllEntriesAdmin(),
    getAllNotebooksAdmin(),
    getAllArticlesAdmin(),
  ]);

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-muted-gold transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
      </div>

      {/* Main Manager Component */}
      <NotebookEntriesManager initialEntries={entries} notebooks={notebooks} articles={articles} />
    </div>
  );
}
