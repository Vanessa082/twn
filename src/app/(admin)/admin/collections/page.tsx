import { CollectionsManager } from "@/modules/editorial/admin-ui";
import { getAllCollectionsAdmin } from "@/modules/editorial";

export const metadata = {
  title: "Collections | Admin Dashboard",
};

export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
  const collections = await getAllCollectionsAdmin();

  return <CollectionsManager initialCollections={collections} />;
}
