import MarginNotesModerator from "@/components/admin/MarginNotesModerator";
import { getAllMarginNotesAdmin } from "@/lib/services/margin-notes";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminMarginNotesPage() {
  const notes = await getAllMarginNotesAdmin();

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

      {/* Main moderator Component */}
      <MarginNotesModerator initialNotes={notes} />
    </div>
  );
}
