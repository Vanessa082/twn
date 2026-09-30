import { FieldNotesManager } from "@/modules/editorial/admin-ui";
import { getAllFieldNotesAdmin } from "@/modules/editorial";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminFieldNotesPage() {
  const { notes, tableReady } = await getAllFieldNotesAdmin();

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
      <FieldNotesManager initialNotes={notes} tableReady={tableReady} />
    </div>
  );
}
