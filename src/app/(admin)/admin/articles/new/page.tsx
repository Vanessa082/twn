import ArticleForm from "@/components/admin/ArticleForm";
import { getNoteAuthor } from "@/lib/about/portrait";
import { getAboutData } from "@/lib/services/about";
import { getAllTags } from "@/lib/services/tags";

export const metadata = {
  title: "New Article | Admin Dashboard",
};

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const [allTags, about] = await Promise.all([getAllTags(), getAboutData()]);

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Create Article Form Workspace */}
      <ArticleForm allTags={allTags} author={getNoteAuthor(about.hero)} />
    </div>
  );
}
