import { TagsManager } from "@/modules/editorial/admin-ui";
import { getAllTags } from "@/modules/editorial";

export const metadata = {
  title: "Tags Management | Admin Dashboard",
};

export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const tags = await getAllTags();

  return <TagsManager initialTags={tags} />;
}
