import { CollectionEditor } from "@/modules/editorial/admin-ui";
import { getLatestNotes } from "@/modules/editorial";
import { getCollectionByIdAdmin } from "@/modules/editorial";
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

  const [collection, availableNotes] = await Promise.all([
    getCollectionByIdAdmin(id),
    getLatestNotes(50),
  ]);

  if (!collection) {
    notFound();
  }

  return <CollectionEditor collection={collection} availableNotes={availableNotes} />;
}
