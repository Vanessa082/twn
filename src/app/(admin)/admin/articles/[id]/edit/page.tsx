import ArticleForm from "@/components/admin/ArticleForm";
import { getArticleByIdAdmin } from "@/lib/services/articles";
import { getRevisionsForArticle } from "@/lib/services/revisions";
import { getAllTags, getTagsForArticle } from "@/lib/services/tags";
import { notFound } from "next/navigation";

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Article | Admin Dashboard",
};

export const dynamic = "force-dynamic";

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  // 1. Resolve params (Next.js 15 convention)
  const resolvedParams = await params;
  const article = await getArticleByIdAdmin(resolvedParams.id);

  if (!article) {
    notFound();
  }

  const [allTags, initialTags, revisions] = await Promise.all([
    getAllTags(),
    getTagsForArticle(article.id),
    getRevisionsForArticle(article.id),
  ]);

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Edit Form workspace with fetched data */}
      <ArticleForm
        initialData={article}
        allTags={allTags}
        initialTags={initialTags}
        revisions={revisions}
      />
    </div>
  );
}
