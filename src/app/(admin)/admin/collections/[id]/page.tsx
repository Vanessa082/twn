import { getAllNotesAdmin, getCollectionByIdAdmin } from "@/modules/editorial";
import { CollectionEditor } from "@/modules/editorial/admin-ui";
import { notFound } from "next/navigation";

interface EditCollectionPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Collection | Admin Dashboard",
};

export const dynamic = "force-dynamic";

export default async function EditCollectionPage({ params }: EditCollectionPageProps) {
  const { id } = await params;

  const [collection, notes] = await Promise.all([getCollectionByIdAdmin(id), getAllNotesAdmin()]);

  if (!collection) {
    notFound();
  }

  const availableNotes = notes.map(({ content: _content, ...card }) => card);

  return <CollectionEditor collection={collection} availableNotes={availableNotes} />;
}
