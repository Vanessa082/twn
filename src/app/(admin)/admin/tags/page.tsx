import TagsManager from "@/components/admin/TagsManager";
import { getAllTags } from "@/lib/services/tags";

export const metadata = {
  title: "Tags Management | Admin Dashboard",
};

export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const tags = await getAllTags();

  return <TagsManager initialTags={tags} />;
}
