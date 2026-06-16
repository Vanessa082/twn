import ArticleForm from "@/components/admin/ArticleForm";

export const metadata = {
  title: "New Article | Admin Dashboard",
};

export default function NewArticlePage() {
  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Create Article Form Workspace */}
      <ArticleForm />
    </div>
  );
}
