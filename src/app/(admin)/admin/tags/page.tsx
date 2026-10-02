import { getAllTags } from "@/modules/editorial";
import { TagsManager } from "@/modules/editorial/admin-ui";

export const metadata = {
  title: "Tags Management | Admin Dashboard",
};

export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const tags = await getAllTags();

  return <TagsManager initialTags={tags} />;
}
