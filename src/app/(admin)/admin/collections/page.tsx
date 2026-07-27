import CollectionsManager from "@/components/admin/CollectionsManager";
import { getAllCollectionsAdmin } from "@/lib/services/collections";

export const metadata = {
  title: "Collections | Admin Dashboard",
};

export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
  const collections = await getAllCollectionsAdmin();

  return <CollectionsManager initialCollections={collections} />;
}
