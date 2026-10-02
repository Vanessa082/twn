import {
  getAllTags,
  getNoteByIdAdmin,
  getRevisionsForNote,
  getTagsForNote,
} from "@/modules/editorial";
import { NoteForm } from "@/modules/editorial/admin-ui";
import { getAboutData, getNoteAuthor } from "@/modules/site";
import { notFound } from "next/navigation";

interface EditNotePageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Note | Admin Dashboard",
};

export const dynamic = "force-dynamic";

export default async function EditNotePage({ params }: EditNotePageProps) {
  // 1. Resolve params (Next.js 15 convention)
  const resolvedParams = await params;
  const note = await getNoteByIdAdmin(resolvedParams.id);

  if (!note) {
    notFound();
  }

  const [allTags, initialTags, revisions, about] = await Promise.all([
    getAllTags(),
    getTagsForNote(note.id),
    getRevisionsForNote(note.id),
    getAboutData(),
  ]);

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Edit Form workspace with fetched data */}
      <NoteForm
        initialData={note}
        allTags={allTags}
        initialTags={initialTags}
        revisions={revisions}
        author={getNoteAuthor(about.hero)}
      />
    </div>
  );
}
