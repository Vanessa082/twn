import CollectionEditor from "@/components/admin/CollectionEditor";
import { getLatestArticles } from "@/lib/services/articles";
import { getCollectionByIdAdmin } from "@/lib/services/collections";
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

  const [collection, availableArticles] = await Promise.all([
    getCollectionByIdAdmin(id),
    getLatestArticles(50),
  ]);

  if (!collection) {
    notFound();
  }

  return <CollectionEditor collection={collection} availableArticles={availableArticles} />;
}
