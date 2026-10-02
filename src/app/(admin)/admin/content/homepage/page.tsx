import { getAllNotesAdmin } from "@/modules/editorial";
import { getHomepageSettingsAdmin } from "@/modules/site";
import { type FeaturableNote, HomepageSettingsForm } from "@/modules/site/admin-ui";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const [{ settings, tableReady }, allNotes] = await Promise.all([
    getHomepageSettingsAdmin(),
    getAllNotesAdmin(),
  ]);

  const notes: FeaturableNote[] = allNotes
    .filter((note) => note.status === "published")
    .map(({ id, title, published_at }) => ({ id, title, published_at }));

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
      <HomepageSettingsForm initialSettings={settings} notes={notes} tableReady={tableReady} />
    </div>
  );
}
