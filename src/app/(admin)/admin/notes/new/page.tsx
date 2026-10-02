import { getAllTags } from "@/modules/editorial";
import { NoteForm } from "@/modules/editorial/admin-ui";
import { getAboutData, getNoteAuthor } from "@/modules/site";

export const metadata = {
  title: "New Note | Admin Dashboard",
};

export const dynamic = "force-dynamic";

export default async function NewNotePage() {
  const [allTags, about] = await Promise.all([getAllTags(), getAboutData()]);

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Create Note Form Workspace */}
      <NoteForm allTags={allTags} author={getNoteAuthor(about.hero)} />
    </div>
  );
}
